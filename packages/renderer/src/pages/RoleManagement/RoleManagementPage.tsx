import type { JSX } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Breadcrumb,
  Button,
  Checkbox,
  Flex,
  Form,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import type { RoleSummary } from '@main/services/roles'
import type { RolePermissionDefinition } from '@main/services/roles/constants'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser, selectToken, forceLogout } from '@renderer/store/slices/auth'
import {
  extractErrorMessage,
  handleResponse,
  isSessionExpiredError
} from '@renderer/store/slices/auth/helpers'

interface RoleFormValues {
  name: string
  description?: string
  permissions: string[]
}

const RoleManagementPage = (): JSX.Element => {
  const { t } = useTranslation(['roles', 'common'])
  const breadcrumbItems = usePrimaryBreadcrumb([{ title: t('appShell.navigation.roleManagement', { ns: 'common' }) }])
  const breadcrumbStyle = useBreadcrumbStyle(breadcrumbItems)
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const token = useAppSelector(selectToken)

  const isAdmin = (currentUser?.roles ?? []).includes('Admin')

  const [roles, setRoles] = useState<RoleSummary[]>([])
  const [permissions, setPermissions] = useState<RolePermissionDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<string | undefined>()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RoleSummary | null>(null)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [messageApi, messageContext] = message.useMessage()
  const [createForm] = Form.useForm<RoleFormValues>()
  const [editForm] = Form.useForm<RoleFormValues>()

  const permissionMetadata = useMemo(() => {
    const map = new Map<string, { label: string; description: string }>()
    for (const definition of permissions) {
      map.set(definition.key, {
        label: t(`roles:permissions.${definition.key}.label`, {
          defaultValue: definition.label
        }),
        description: t(`roles:permissions.${definition.key}.description`, {
          defaultValue: definition.description
        })
      })
    }
    return map
  }, [permissions, t])

  const refreshData = useCallback(async () => {
    if (!token) {
      setError(t('roles:errors.sessionExpired'))
      return
    }
    setLoading(true)
    try {
      const [roleResponse, permissionResponse] = await Promise.all([
        handleResponse(window.api.role.list(token)),
        handleResponse(window.api.role.permissions(token))
      ])
      setRoles(roleResponse)
      setPermissions(permissionResponse)
      setError(undefined)
    } catch (err) {
      if (isSessionExpiredError(err)) {
        dispatch(forceLogout())
        setError(t('roles:errors.sessionExpired'))
      } else {
        setError(extractErrorMessage(err))
      }
    } finally {
      setHasLoaded(true)
      setLoading(false)
    }
  }, [dispatch, t, token])

  useEffect(() => {
    if (!isAdmin) {
      return
    }
    void refreshData()
  }, [isAdmin, refreshData])

  const openCreateModal = useCallback(() => {
    createForm.resetFields()
    setCreateModalOpen(true)
  }, [createForm])

  const openEditModal = useCallback(
    (role: RoleSummary) => {
      setEditTarget(role)
      editForm.setFieldsValue({
        name: role.name,
        description: role.description ?? '',
        permissions: Array.isArray(role.permissions) ? role.permissions : []
      })
      setEditModalOpen(true)
    },
    [editForm]
  )

  const closeCreateModal = useCallback(() => {
    setCreateModalOpen(false)
  }, [])

  const closeEditModal = useCallback(() => {
    setEditModalOpen(false)
    setEditTarget(null)
  }, [])

  const handleCreate = useCallback(async () => {
    if (!token) {
      setError(t('roles:errors.sessionExpired'))
      return
    }
    try {
      const values = await createForm.validateFields()
      setCreateSubmitting(true)
      await handleResponse(
        window.api.role.create(token, {
          name: values.name,
          description: values.description?.trim() || null,
          permissions: values.permissions
        })
      )
      messageApi.success(t('roles:messages.createSuccess'))
      setCreateModalOpen(false)
      createForm.resetFields()
      await refreshData()
    } catch (err) {
      if (err instanceof Error && 'errorFields' in err) {
        // validation handled by form
        return
      }
      if (isSessionExpiredError(err)) {
        dispatch(forceLogout())
        setError(t('roles:errors.sessionExpired'))
      } else {
        const reason = extractErrorMessage(err)
        setError(reason)
        messageApi.error(reason)
      }
    } finally {
      setCreateSubmitting(false)
    }
  }, [createForm, dispatch, messageApi, refreshData, t, token])

  const handleEdit = useCallback(async () => {
    if (!token || !editTarget) {
      setError(t('roles:errors.sessionExpired'))
      return
    }
    try {
      const values = await editForm.validateFields()
      setEditSubmitting(true)
      await handleResponse(
        window.api.role.update(token, editTarget.id, {
          name: values.name,
          description: values.description?.trim() || null,
          permissions: values.permissions
        })
      )
      messageApi.success(t('roles:messages.updateSuccess'))
      closeEditModal()
      await refreshData()
    } catch (err) {
      if (err instanceof Error && 'errorFields' in err) {
        return
      }
      if (isSessionExpiredError(err)) {
        dispatch(forceLogout())
        setError(t('roles:errors.sessionExpired'))
      } else {
        const reason = extractErrorMessage(err)
        setError(reason)
        messageApi.error(reason)
      }
    } finally {
      setEditSubmitting(false)
    }
  }, [closeEditModal, dispatch, editForm, editTarget, messageApi, refreshData, t, token])

  const handleDelete = useCallback(
    async (role: RoleSummary) => {
      if (!token) {
        setError(t('roles:errors.sessionExpired'))
        return
      }
      try {
        await handleResponse(window.api.role.remove(token, role.id))
        messageApi.success(t('roles:messages.deleteSuccess', { name: role.name }))
        await refreshData()
      } catch (err) {
        if (isSessionExpiredError(err)) {
          dispatch(forceLogout())
          setError(t('roles:errors.sessionExpired'))
        } else {
          const reason = extractErrorMessage(err)
          setError(reason)
          messageApi.error(reason)
        }
      }
    },
    [dispatch, messageApi, refreshData, t, token]
  )

  const columns = useMemo<ColumnsType<RoleSummary>>(
    () => [
      {
        title: t('roles:table.name'),
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: t('roles:table.description'),
        dataIndex: 'description',
        key: 'description',
        render: (value: string | null) =>
          value && value.trim().length > 0 ? (
            <Typography.Text>{value}</Typography.Text>
          ) : (
            <Typography.Text type="secondary">{t('roles:table.noDescription')}</Typography.Text>
          )
      },
      {
        title: t('roles:table.permissions'),
        dataIndex: 'permissions',
        key: 'permissions',
        render: (value: string[]) => (
          <Space size={4} wrap>
            {(value ?? []).map((permission) => {
              const meta = permissionMetadata.get(permission)
              return (
                <Tag key={permission} bordered={false}>
                  {meta?.label ?? permission}
                </Tag>
              )
            })}
          </Space>
        )
      },
      {
        title: t('roles:table.userCount'),
        dataIndex: 'userCount',
        key: 'userCount',
        width: 120,
        render: (count: number) => <Typography.Text>{count}</Typography.Text>
      },
      {
        title: t('roles:table.type'),
        dataIndex: 'isSystemRole',
        key: 'isSystemRole',
        width: 160,
        render: (value: boolean) => (
          <Tag color={value ? 'red' : 'blue'} bordered={false}>
            {value ? t('roles:table.systemRole') : t('roles:table.customRole')}
          </Tag>
        )
      },
      {
        title: t('roles:table.actions'),
        key: 'actions',
        width: 200,
        render: (_value: unknown, record: RoleSummary) => (
          <Space size="small">
            <Button type="link" onClick={() => openEditModal(record)}>
              {t('roles:actions.edit')}
            </Button>
            <Button
              type="link"
              danger
              disabled={record.isSystemRole || record.userCount > 0}
              onClick={() => handleDelete(record)}
            >
              {t('roles:actions.delete')}
            </Button>
          </Space>
        )
      }
    ],
    [handleDelete, openEditModal, permissionMetadata, t]
  )

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <>
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
          <Breadcrumb items={breadcrumbItems} style={breadcrumbStyle} />
          <Space size={12} wrap>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              disabled={loading}
            >
              {t('roles:actions.create')}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void refreshData()}
              disabled={loading}
              loading={loading}
            >
              {t('roles:actions.refresh')}
            </Button>
          </Space>
        </Space>
      </ShellHeaderPortal>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {messageContext}
        {error ? (
          <Alert
            type="error"
            message={t('roles:errors.title')}
            description={error}
            closable
            onClose={() => setError(undefined)}
          />
        ) : null}
        <Table<RoleSummary>
          rowKey="id"
          dataSource={roles}
          columns={columns}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          locale={{
            emptyText: hasLoaded || !loading ? t('roles:emptyState') : t('roles:loadingState')
          }}
        />
      </Space>
      <Modal
        title={t('roles:create.title')}
        open={createModalOpen}
        onCancel={closeCreateModal}
        onOk={() => void handleCreate()}
        confirmLoading={createSubmitting}
        destroyOnHidden
        okText={t('roles:create.confirm')}
        cancelText={t('roles:create.cancel')}
      >
        <Form<RoleFormValues> layout="vertical" form={createForm}>
          <Form.Item
            name="name"
            label={t('roles:form.name')}
            rules={[
              { required: true, message: t('roles:validation.nameRequired') },
              { max: 64, message: t('roles:validation.nameLength') }
            ]}
          >
            <Input placeholder={t('roles:form.namePlaceholder')} />
          </Form.Item>
          <Form.Item name="description" label={t('roles:form.description')}>
            <Input.TextArea rows={3} placeholder={t('roles:form.descriptionPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="permissions"
            label={t('roles:form.permissions')}
            rules={[{ required: true, message: t('roles:validation.permissionsRequired') }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Flex vertical gap={8}>
                {permissions.map((definition) => {
                  const meta = permissionMetadata.get(definition.key)
                  return (
                    <Checkbox key={definition.key} value={definition.key}>
                      <Flex vertical gap={4}>
                        <Typography.Text strong>{meta?.label ?? definition.key}</Typography.Text>
                        <Typography.Text type="secondary">
                          {meta?.description ?? definition.description}
                        </Typography.Text>
                      </Flex>
                    </Checkbox>
                  )
                })}
              </Flex>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={t('roles:edit.title', { name: editTarget?.name ?? '' })}
        open={editModalOpen}
        onCancel={closeEditModal}
        onOk={() => void handleEdit()}
        confirmLoading={editSubmitting}
        destroyOnHidden
        okText={t('roles:edit.confirm')}
        cancelText={t('roles:edit.cancel')}
      >
        <Form<RoleFormValues> layout="vertical" form={editForm}>
          <Form.Item
            name="name"
            label={t('roles:form.name')}
            rules={[
              { required: true, message: t('roles:validation.nameRequired') },
              { max: 64, message: t('roles:validation.nameLength') }
            ]}
          >
            <Input disabled={editTarget?.isSystemRole} />
          </Form.Item>
          <Form.Item name="description" label={t('roles:form.description')}>
            <Input.TextArea rows={3} placeholder={t('roles:form.descriptionPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="permissions"
            label={t('roles:form.permissions')}
            rules={[{ required: true, message: t('roles:validation.permissionsRequired') }]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Flex vertical gap={8}>
                {permissions.map((definition) => {
                  const meta = permissionMetadata.get(definition.key)
                  return (
                    <Checkbox key={definition.key} value={definition.key}>
                      <Flex vertical gap={4}>
                        <Typography.Text strong>{meta?.label ?? definition.key}</Typography.Text>
                        <Typography.Text type="secondary">
                          {meta?.description ?? definition.description}
                        </Typography.Text>
                      </Flex>
                    </Checkbox>
                  )
                })}
              </Flex>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

RoleManagementPage.displayName = 'RoleManagementPage'

export { RoleManagementPage }
export default RoleManagementPage
