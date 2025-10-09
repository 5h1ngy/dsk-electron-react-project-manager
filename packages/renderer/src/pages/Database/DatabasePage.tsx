import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { Breadcrumb, Button, Card, Form, Input, Modal, Progress, Space, Typography, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser, selectToken } from '@renderer/store/slices/auth/selectors'
import { handleResponse, isSessionExpiredError, extractErrorMessage } from '@renderer/store/slices/auth/helpers'
import { forceLogout } from '@renderer/store/slices/auth'
import type { DatabaseProgressUpdate } from '@preload/types'

const PASSWORD_MIN_LENGTH = 12

type ProgressOperation = 'export' | 'import'

interface ProgressModalState {
  visible: boolean
  operation: ProgressOperation | null
  operationId: string | null
  percent: number
  message: string
  current: number | null
  total: number | null
}

const INITIAL_PROGRESS_STATE: ProgressModalState = {
  visible: false,
  operation: null,
  operationId: null,
  percent: 0,
  message: '',
  current: null,
  total: null
}

interface ExportFormValues {
  password: string
  confirmPassword: string
}

interface ImportFormValues {
  password: string
}

const DatabasePage = (): JSX.Element => {
  const { t } = useTranslation(['database', 'common'])
  const breadcrumbItems = usePrimaryBreadcrumb([{ title: t('title') }])
  const [exportForm] = Form.useForm<ExportFormValues>()
  const [importForm] = Form.useForm<ImportFormValues>()
  const token = useAppSelector(selectToken)
  const currentUser = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [restartModalVisible, setRestartModalVisible] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [messageApi, messageContext] = message.useMessage()
  const [progressState, setProgressState] = useState<ProgressModalState>({
    ...INITIAL_PROGRESS_STATE
  })
  const progressResetTimeout = useRef<NodeJS.Timeout | number | null>(null)

  const isAdmin = currentUser?.roles?.includes('Admin') ?? false

  const resolveProgressMessage = useCallback(
    (update: DatabaseProgressUpdate) => {
      const { operation, phase, detail, current, total, percent } = update
      const key = `progress.phases.${operation}.${phase}`
      const values: Record<string, unknown> = {
        percent: Math.round(percent)
      }
      if (detail) {
        values.table = detail
      }
      if (typeof current === 'number') {
        values.current = current
      }
      if (typeof total === 'number') {
        values.total = total
      }
      return t(key, {
        defaultValue: t('progress.generic', { percent: Math.round(percent) }),
        ...values
      })
    },
    [t]
  )

  const resetProgress = useCallback(() => {
    if (progressResetTimeout.current) {
      window.clearTimeout(progressResetTimeout.current)
      progressResetTimeout.current = null
    }
    setProgressState({ ...INITIAL_PROGRESS_STATE })
  }, [progressResetTimeout])

  const startProgress = useCallback(
    (operation: ProgressOperation) => {
      if (progressResetTimeout.current) {
        window.clearTimeout(progressResetTimeout.current)
        progressResetTimeout.current = null
      }
      setProgressState({
        visible: true,
        operation,
        operationId: null,
        percent: 0,
        message: t('progress.pending'),
        current: null,
        total: null
      })
    },
    [progressResetTimeout, t]
  )

  const completeProgress = useCallback(
    (messageText?: string) => {
      setProgressState((prev) => ({
        ...prev,
        percent: 100,
        message: messageText ?? (prev.message || t('progress.complete'))
      }))
      if (progressResetTimeout.current) {
        window.clearTimeout(progressResetTimeout.current)
      }
      progressResetTimeout.current = window.setTimeout(() => {
        setProgressState({ ...INITIAL_PROGRESS_STATE })
        progressResetTimeout.current = null
      }, 400)
    },
    [progressResetTimeout, t]
  )

  const handleSessionFailure = useCallback(() => {
    resetProgress()
    dispatch(forceLogout())
  }, [dispatch, resetProgress])

  useEffect(() => {
    return () => {
      if (progressResetTimeout.current) {
        window.clearTimeout(progressResetTimeout.current)
      }
    }
  }, [progressResetTimeout])

  useEffect(() => {
    const unsubscribeExport =
      window.api?.database?.onExportProgress?.((update) => {
        setProgressState((previous) => {
          if (previous.operation && previous.operation !== 'export' && previous.visible) {
            return previous
          }
          if (previous.operationId && previous.operationId !== update.operationId) {
            return previous
          }
          const message = resolveProgressMessage(update)
          return {
            visible: true,
            operation: 'export',
            operationId: update.operationId,
            percent: update.percent,
            message,
            current:
              typeof update.current === 'number'
                ? update.current
                : previous.operationId === update.operationId
                  ? previous.current
                  : null,
            total:
              typeof update.total === 'number'
                ? update.total
                : previous.operationId === update.operationId
                  ? previous.total
                  : null
          }
        })
      }) ?? (() => {})

    const unsubscribeImport =
      window.api?.database?.onImportProgress?.((update) => {
        setProgressState((previous) => {
          if (previous.operation && previous.operation !== 'import' && previous.visible) {
            return previous
          }
          if (previous.operationId && previous.operationId !== update.operationId) {
            return previous
          }
          const message = resolveProgressMessage(update)
          return {
            visible: true,
            operation: 'import',
            operationId: update.operationId,
            percent: update.percent,
            message,
            current:
              typeof update.current === 'number'
                ? update.current
                : previous.operationId === update.operationId
                  ? previous.current
                  : null,
            total:
              typeof update.total === 'number'
                ? update.total
                : previous.operationId === update.operationId
                  ? previous.total
                  : null
          }
        })
      }) ?? (() => {})

    return () => {
      unsubscribeExport()
      unsubscribeImport()
    }
  }, [resolveProgressMessage])

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
      startProgress('export')
      try {
        const result = await handleResponse(
          window.api.database.export(token, values.password)
        )
        if (result.canceled) {
          resetProgress()
          messageApi.info(t('export.cancelled'))
        } else {
          completeProgress()
          messageApi.success(
            t('export.success', {
              path: result.filePath
            })
          )
          exportForm.resetFields()
        }
      } catch (error) {
        resetProgress()
        if (isSessionExpiredError(error)) {
          handleSessionFailure()
          return
        }
        messageApi.error(extractErrorMessage(error))
      } finally {
        setExporting(false)
      }
    },
    [
      completeProgress,
      exportForm,
      handleSessionFailure,
      messageApi,
      resetProgress,
      startProgress,
      t,
      token
    ]
  )

  const handleImport = useCallback(
    async (values: ImportFormValues) => {
      if (!token) {
        handleSessionFailure()
        return
      }
      setImporting(true)
      startProgress('import')
      try {
        const result = await handleResponse(
          window.api.database.import(token, values.password)
        )
        if (result.canceled) {
          resetProgress()
          messageApi.info(t('import.cancelled'))
        } else {
          completeProgress()
          messageApi.success(t('import.success'))
          importForm.resetFields()
          if (result.restartRequired) {
            setRestartModalVisible(true)
          }
        }
      } catch (error) {
        resetProgress()
        if (isSessionExpiredError(error)) {
          handleSessionFailure()
          return
        }
        messageApi.error(extractErrorMessage(error))
      } finally {
        setImporting(false)
      }
    },
    [
      completeProgress,
      handleSessionFailure,
      importForm,
      messageApi,
      resetProgress,
      startProgress,
      t,
      token
    ]
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
        open={progressState.visible}
        closable={false}
        maskClosable={false}
        keyboard={false}
        centered
        footer={null}
        destroyOnClose
        title={
          progressState.operation
            ? t(`progress.title.${progressState.operation}`)
            : t('progress.title.export')
        }
      >
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {progressState.operation ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t(`progress.description.${progressState.operation}`)}
            </Typography.Paragraph>
          ) : null}
          <Typography.Text strong>
            {progressState.message || t('progress.pending')}
          </Typography.Text>
          {progressState.total !== null && progressState.current !== null ? (
            <Typography.Text type="secondary">
              {t('progress.counter', {
                current: progressState.current,
                total: progressState.total
              })}
            </Typography.Text>
          ) : null}
          <Progress
            percent={Math.max(0, Math.min(100, Math.round(progressState.percent)))}
            status={progressState.percent >= 100 ? 'normal' : 'active'}
          />
        </Space>
      </Modal>
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
        <Space
          size={12}
          wrap
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          }}
        >
          <Breadcrumb items={breadcrumbItems} />
        </Space>
      </ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
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
