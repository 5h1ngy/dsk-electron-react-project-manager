import { useCallback, useMemo, useState, type JSX } from 'react'
import { Breadcrumb, Button, Card, Form, Input, Modal, Space, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Navigate, useNavigate } from 'react-router-dom'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser, selectToken } from '@renderer/store/slices/auth/selectors'
import { handleResponse, isSessionExpiredError, extractErrorMessage } from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth'

const PASSWORD_MIN_LENGTH = 12

interface ExportFormValues {
  password: string
  confirmPassword: string
}

interface ImportFormValues {
  password: string
}

const DatabasePage = (): JSX.Element => {
  const { t } = useTranslation(['database', 'common'])
  const [exportForm] = Form.useForm<ExportFormValues>()
  const [importForm] = Form.useForm<ImportFormValues>()
  const token = useAppSelector(selectToken)
  const currentUser = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [restartModalVisible, setRestartModalVisible] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [messageApi, messageContext] = message.useMessage()

  const breadcrumbItems = usePrimaryBreadcrumb(
    useMemo(
      () => [
        {
          title: t('appShell.navigation.dashboard', { ns: 'common' }),
          onClick: () => navigate('/')
        },
        {
          title: t('appShell.navigation.database', { ns: 'common' })
        }
      ],
      [navigate, t]
    )
  )

  const isAdmin = currentUser?.roles?.includes('Admin') ?? false

  const handleSessionFailure = useCallback(() => {
    dispatch(forceLogout())
  }, [dispatch])

  const handleExport = useCallback(
    async (values: ExportFormValues) => {
      if (!token) {
        handleSessionFailure()
        return
      }
      if (values.password !== values.confirmPassword) {
        exportForm.setFields([
          {
            name: 'confirmPassword',
            errors: [t('errors.passwordMismatch', { ns: 'database' })]
          }
        ])
        return
      }
      setExporting(true)
      try {
        const result = await handleResponse(
          window.api.database.export(token, values.password)
        )
        if (result.canceled) {
          messageApi.info(t('export.cancelled'))
        } else {
          messageApi.success(
            t('export.success', {
              path: result.filePath
            })
          )
          exportForm.resetFields()
        }
      } catch (error) {
        if (isSessionExpiredError(error)) {
          handleSessionFailure()
          return
        }
        messageApi.error(extractErrorMessage(error))
      } finally {
        setExporting(false)
      }
    },
    [exportForm, handleSessionFailure, messageApi, t, token]
  )

  const handleImport = useCallback(
    async (values: ImportFormValues) => {
      if (!token) {
        handleSessionFailure()
        return
      }
      setImporting(true)
      try {
        const result = await handleResponse(
          window.api.database.import(token, values.password)
        )
        if (result.canceled) {
          messageApi.info(t('import.cancelled'))
        } else {
          messageApi.success(t('import.success'))
          importForm.resetFields()
          if (result.restartRequired) {
            setRestartModalVisible(true)
          }
        }
      } catch (error) {
        if (isSessionExpiredError(error)) {
          handleSessionFailure()
          return
        }
        messageApi.error(extractErrorMessage(error))
      } finally {
        setImporting(false)
      }
    },
    [handleSessionFailure, importForm, messageApi, t, token]
  )

  const handleRestartConfirm = useCallback(async () => {
    if (!token) {
      handleSessionFailure()
      return
    }
    setRestarting(true)
    try {
      await handleResponse(window.api.database.restart(token))
    } catch (error) {
      setRestarting(false)
      if (isSessionExpiredError(error)) {
        handleSessionFailure()
        return
      }
      messageApi.error(extractErrorMessage(error))
    }
  }, [handleSessionFailure, messageApi, token])

  const passwordRules = useMemo(
    () => [
      {
        required: true,
        message: t('errors.passwordRequired')
      },
      {
        min: PASSWORD_MIN_LENGTH,
        message: t('errors.passwordTooShort', { length: PASSWORD_MIN_LENGTH })
      }
    ],
    [t]
  )

  if (!currentUser || !isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <>
      {messageContext}
      <Modal
        open={restartModalVisible}
        closable={false}
        maskClosable={false}
        keyboard={false}
        centered
        title={t('restartModal.title')}
        footer={
          <Button
            type="primary"
            danger
            onClick={handleRestartConfirm}
            loading={restarting}
          >
            {t('restartModal.confirm')}
          </Button>
        }
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('restartModal.description')}
          </Typography.Paragraph>
        </Space>
      </Modal>
      <ShellHeaderPortal>
        <Breadcrumb items={breadcrumbItems} />
      </ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {t('title')}
          </Typography.Title>
          <Typography.Paragraph type="secondary">{t('description')}</Typography.Paragraph>
        </div>

        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>
                {t('export.title')}
              </Typography.Title>
              <Typography.Text type="secondary">{t('export.subtitle')}</Typography.Text>
            </div>
            <Form<ExportFormValues>
              layout="vertical"
              form={exportForm}
              onFinish={handleExport}
              requiredMark={false}
            >
              <Form.Item
                name="password"
                label={t('export.passwordLabel')}
                rules={passwordRules}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label={t('export.confirmPasswordLabel')}
                dependencies={['password']}
                rules={[
                  ...passwordRules,
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error(t('errors.passwordMismatch')))
                    }
                  })
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={exporting}
                  disabled={importing}
                >
                  {t('export.submit')}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>
                {t('import.title')}
              </Typography.Title>
              <Typography.Text type="secondary">{t('import.subtitle')}</Typography.Text>
            </div>
            <Form<ImportFormValues>
              layout="vertical"
              form={importForm}
              onFinish={handleImport}
              requiredMark={false}
            >
              <Form.Item
                name="password"
                label={t('import.passwordLabel')}
                rules={passwordRules}
              >
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={importing}
                  disabled={exporting}
                >
                  {t('import.submit')}
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Space>
    </>
  )
}

DatabasePage.displayName = 'DatabasePage'

export { DatabasePage }
