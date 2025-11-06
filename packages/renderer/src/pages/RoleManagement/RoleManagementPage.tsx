import type { JSX, Key } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Empty,
  Flex,
  Form,
  Input,
  List,
  Modal,
  Segmented,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
  theme
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  AppstoreOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  TableOutlined,
  UnorderedListOutlined
} from '@ant-design/icons'
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
  const breadcrumbItems = usePrimaryBreadcrumb([
    { title: t('appShell.navigation.roleManagement', { ns: 'common' }) }
  ])
  const breadcrumbStyle = useBreadcrumbStyle(breadcrumbItems)
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const token = useAppSelector(selectToken)
  const { token: themeToken } = theme.useToken()

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
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [deleteTargets, setDeleteTargets] = useState<RoleSummary[] | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'cards'>('table')
  const [hoveredRoleId, setHoveredRoleId] = useState<string | null>(null)

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

  useEffect(() => {
    if (selectedRoleIds.length === 0) {
      return
    }
    const deletableRoles = new Set(
      roles
        .filter((role) => !role.isSystemRole && role.userCount === 0)
        .map((role) => role.id)
    )
    const cleaned = selectedRoleIds.filter((id) => deletableRoles.has(id))
    if (cleaned.length !== selectedRoleIds.length) {
      setSelectedRoleIds(cleaned)
    }
  }, [roles, selectedRoleIds])

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds]
  )

  const isRoleSelectable = useCallback(
    (role: RoleSummary) => !role.isSystemRole && role.userCount === 0,
    []
  )

  const handleRoleSelectionChange = useCallback((roleId: string, checked: boolean) => {
    setSelectedRoleIds((current) => {
      if (checked) {
        if (current.includes(roleId)) {
          return current
        }
        return [...current, roleId]
      }
      return current.filter((id) => id !== roleId)
    })
  }, [])

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

  const openDeleteConfirm = useCallback(
    (targets: RoleSummary | RoleSummary[]) => {
      if (deleteLoading) {
        return
      }
      const list = Array.isArray(targets) ? targets : [targets]
      const deletable = list.filter((role) => !role.isSystemRole && role.userCount === 0)
      const skipped = list.length - deletable.length

      if (skipped > 0) {
        messageApi.warning(
          t('roles:messages.deletePartialWarning', {
            count: skipped,
            defaultValue:
              skipped === 1
                ? '1 role cannot be removed because it is protected or still assigned.'
                : '{{count}} roles cannot be removed because they are protected or still assigned.'
          })
        )
      }

      if (deletable.length === 0) {
        return
      }

      setDeleteTargets(deletable)
    },
    [deleteLoading, messageApi, t]
  )

  const closeDeleteConfirm = useCallback(() => {
    if (deleteLoading) {
      return
    }
    setDeleteTargets(null)
  }, [deleteLoading])

  const confirmDelete = useCallback(async () => {
    if (!deleteTargets || deleteTargets.length === 0) {
      return
    }
    if (!token) {
      setError(t('roles:errors.sessionExpired'))
      return
    }

    setDeleteLoading(true)
    let successCount = 0
    const removedIds: string[] = []

    for (const role of deleteTargets) {
      try {
        await handleResponse(window.api.role.remove(token, role.id))
        successCount += 1
        removedIds.push(role.id)
      } catch (err) {
        if (isSessionExpiredError(err)) {
          dispatch(forceLogout())
          setError(t('roles:errors.sessionExpired'))
          break
        } else {
          const reason = extractErrorMessage(err)
          setError(reason)
          messageApi.error(reason)
        }
      }
    }

    if (successCount > 0) {
      if (successCount === 1) {
        const role = deleteTargets.find((item) => removedIds.includes(item.id))
        messageApi.success(
          t('roles:messages.deleteSuccess', { name: role?.name ?? '', defaultValue: 'Role deleted' })
        )
      } else {
        messageApi.success(
          t('roles:messages.deleteBulkSuccess', {
            count: successCount,
            defaultValue: '{{count}} roles deleted'
          })
        )
      }
      await refreshData()
      setSelectedRoleIds((prev) => prev.filter((id) => !removedIds.includes(id)))
    }

    setDeleteLoading(false)
    setDeleteTargets(null)
  }, [
    deleteTargets,
    dispatch,
    messageApi,
    refreshData,
    setSelectedRoleIds,
    t,
    token
  ])

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
            <Button
              type="link"
              onClick={() => openEditModal(record)}
              disabled={record.isSystemRole || deleteLoading}
            >
              {t('roles:actions.edit')}
            </Button>
            <Button
              type="link"
              danger
              disabled={record.isSystemRole || record.userCount > 0 || deleteLoading}
              onClick={() => openDeleteConfirm(record)}
            >
              {t('roles:actions.delete')}
            </Button>
          </Space>
        )
      }
    ],
    [deleteLoading, openDeleteConfirm, openEditModal, permissionMetadata, t]
  )

  const deleteModalTitle = useMemo(() => {
    if (!deleteTargets || deleteTargets.length === 0) {
      return ''
    }
    if (deleteTargets.length === 1) {
      return t('roles:modals.delete.title', { name: deleteTargets[0].name })
    }
    return t('roles:modals.delete.bulkTitle', { count: deleteTargets.length })
  }, [deleteTargets, t])

  const deleteModalDescription = useMemo(() => {
    if (!deleteTargets || deleteTargets.length === 0) {
      return ''
    }
    if (deleteTargets.length === 1) {
      return t('roles:modals.delete.description', { name: deleteTargets[0].name })
    }
    return t('roles:modals.delete.bulkDescription', { count: deleteTargets.length })
  }, [deleteTargets, t])

  const deleteConfirmItems = useMemo(
    () =>
      deleteTargets?.map((role) => ({
        id: role.id,
        label: role.name
      })) ?? [],
    [deleteTargets]
  )

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const rowSelection = {
    selectedRowKeys: selectedRoleIds,
    onChange: (keys: Key[]) => {
      setSelectedRoleIds(keys.map((key) => String(key)))
    },
    getCheckboxProps: (record: RoleSummary) => ({
      disabled: record.isSystemRole || record.userCount > 0 || deleteLoading
    })
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
              icon={<DeleteOutlined />}
              danger
              onClick={() => openDeleteConfirm(selectedRoles)}
              disabled={selectedRoles.length === 0 || deleteLoading}
              loading={deleteLoading}
            >
              {t('roles:actions.deleteSelected', {
                count: selectedRoles.length,
                defaultValue:
                  selectedRoles.length > 0
                    ? `Delete selected (${selectedRoles.length})`
                    : 'Delete selected'
              })}
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void refreshData()}
              disabled={loading}
              loading={loading}
            >
              {t('roles:actions.refresh')}
            </Button>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as typeof viewMode)}
              options={[
                {
                  value: 'table',
                  label: t('roles:view.table', { defaultValue: 'Tabellare' }),
                  icon: <TableOutlined />
                },
                {
                  value: 'list',
                  label: t('roles:view.list', { defaultValue: 'Elenco' }),
                  icon: <UnorderedListOutlined />
                },
                {
                  value: 'cards',
                  label: t('roles:view.cards', { defaultValue: 'Card' }),
                  icon: <AppstoreOutlined />
                }
              ]}
            />
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
        {viewMode === 'table' ? (
          <Table<RoleSummary>
            rowKey="id"
            dataSource={roles}
            columns={columns}
            rowSelection={rowSelection}
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
        ) : null}
        {viewMode === 'list' ? (
          <List<RoleSummary>
            dataSource={roles}
            loading={loading}
            locale={{
              emptyText: hasLoaded || !loading ? t('roles:emptyState') : t('roles:loadingState')
            }}
            renderItem={(role) => {
              const selectable = isRoleSelectable(role)
              const selected = selectedRoleIds.includes(role.id)
              const permissions = Array.isArray(role.permissions) ? role.permissions : []
              const visiblePermissions = permissions.slice(0, 6)
              const remainingPermissions = permissions.length - visiblePermissions.length

              const itemActions: JSX.Element[] = [
                <Button
                  key="edit"
                  type="link"
                  onClick={() => openEditModal(role)}
                  disabled={role.isSystemRole || deleteLoading}
                >
                  {t('roles:actions.edit')}
                </Button>,
                <Button
                  key="delete"
                  type="link"
                  danger
                  disabled={role.isSystemRole || role.userCount > 0 || deleteLoading}
                  onClick={() => openDeleteConfirm(role)}
                >
                  {t('roles:actions.delete')}
                </Button>
              ]

              return (
                <List.Item
                  key={role.id}
                  actions={itemActions}
                  onMouseEnter={() => setHoveredRoleId(role.id)}
                  onMouseLeave={() =>
                    setHoveredRoleId((current) => (current === role.id ? null : current))
                  }
                  style={{
                    borderRadius: themeToken.borderRadiusLG,
                    padding: themeToken.paddingLG,
                    background:
                      hoveredRoleId === role.id
                        ? themeToken.colorFillTertiary
                        : themeToken.colorBgContainer,
                    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: hoveredRoleId === role.id ? themeToken.boxShadowTertiary : 'none'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Checkbox
                        checked={selected}
                        disabled={!selectable || deleteLoading}
                        onChange={(event) =>
                          selectable
                            ? handleRoleSelectionChange(role.id, event.target.checked)
                            : undefined
                        }
                      />
                    }
                    title={
                      <Space align="center" size={8} wrap>
                        <Typography.Text strong>{role.name}</Typography.Text>
                        <Tag color={role.isSystemRole ? 'red' : 'blue'} bordered={false}>
                          {role.isSystemRole
                            ? t('roles:table.systemRole')
                            : t('roles:table.customRole')}
                        </Tag>
                        <Tag bordered={false}>
                          {t('roles:table.userCount')}: {role.userCount}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        {role.description ? (
                          <Typography.Text type="secondary">{role.description}</Typography.Text>
                        ) : null}
                        <Space size={4} wrap>
                          {visiblePermissions.map((permission) => {
                            const meta = permissionMetadata.get(permission)
                            return (
                              <Tag key={permission} bordered={false}>
                                {meta?.label ?? permission}
                              </Tag>
                            )
                          })}
                          {remainingPermissions > 0 ? (
                            <Tag bordered={false}>+{remainingPermissions}</Tag>
                          ) : null}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )
            }}
          />
        ) : null}
        {viewMode === 'cards' ? (
          loading ? (
            <Flex justify="center" align="center" style={{ width: '100%', minHeight: 240 }}>
              <Spin />
            </Flex>
          ) : roles.length === 0 ? (
            <Flex justify="center" align="center" style={{ width: '100%', minHeight: 240 }}>
              <Empty description={t('roles:emptyState')} />
            </Flex>
          ) : (
            <Flex wrap gap={themeToken.marginLG}>
              {roles.map((role) => {
                const selectable = isRoleSelectable(role)
                const selected = selectedRoleIds.includes(role.id)
                const permissions = Array.isArray(role.permissions) ? role.permissions : []
                const visiblePermissions = permissions.slice(0, 6)
                const remainingPermissions = permissions.length - visiblePermissions.length
                return (
                  <Card
                    key={role.id}
                    hoverable
                    style={{
                      width: 320,
                      borderColor: selected ? themeToken.colorPrimary : undefined,
                      boxShadow: selected ? themeToken.boxShadowSecondary : undefined,
                      transition: 'box-shadow 0.2s ease, border-color 0.2s ease'
                    }}
                    bodyStyle={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: themeToken.marginSM
                    }}
                  >
                    <Flex align="flex-start" justify="space-between" gap={themeToken.marginSM}>
                      <Space direction="vertical" size={4}>
                        <Typography.Text strong>{role.name}</Typography.Text>
                        <Tag color={role.isSystemRole ? 'red' : 'blue'} bordered={false}>
                          {role.isSystemRole
                            ? t('roles:table.systemRole')
                            : t('roles:table.customRole')}
                        </Tag>
                      </Space>
                      <Checkbox
                        checked={selected}
                        disabled={!selectable || deleteLoading}
                        onChange={(event) =>
                          selectable
                            ? handleRoleSelectionChange(role.id, event.target.checked)
                            : undefined
                        }
                      />
                    </Flex>
                    {role.description ? (
                      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        {role.description}
                      </Typography.Paragraph>
                    ) : null}
                    <Typography.Text type="secondary">
                      {t('roles:table.userCount')}: {role.userCount}
                    </Typography.Text>
                    <Space size={4} wrap>
                      {visiblePermissions.map((permission) => {
                        const meta = permissionMetadata.get(permission)
                        return (
                          <Tag key={permission} bordered={false}>
                            {meta?.label ?? permission}
                          </Tag>
                        )
                      })}
                      {remainingPermissions > 0 ? (
                        <Tag bordered={false}>+{remainingPermissions}</Tag>
                      ) : null}
                    </Space>
                    <Space size={8} wrap>
                      <Button
                        type="link"
                        onClick={() => openEditModal(role)}
                        disabled={role.isSystemRole || deleteLoading}
                      >
                        {t('roles:actions.edit')}
                      </Button>
                      <Button
                        type="link"
                        danger
                        disabled={role.isSystemRole || role.userCount > 0 || deleteLoading}
                        onClick={() => openDeleteConfirm(role)}
                      >
                        {t('roles:actions.delete')}
                      </Button>
                    </Space>
                  </Card>
                )
              })}
            </Flex>
          )
        ) : null}
      </Space>
      <Modal
        open={Boolean(deleteTargets && deleteTargets.length > 0)}
        title={deleteModalTitle}
        onCancel={closeDeleteConfirm}
        onOk={() => void confirmDelete()}
        okText={t('roles:modals.delete.confirm')}
        cancelText={t('roles:modals.delete.cancel')}
        okButtonProps={{
          danger: true,
          loading: deleteLoading,
          disabled: !deleteTargets || deleteTargets.length === 0
        }}
        cancelButtonProps={{ disabled: deleteLoading }}
        closable={!deleteLoading}
        maskClosable={false}
        destroyOnHidden
      >
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          {deleteModalDescription ? (
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {deleteModalDescription}
            </Typography.Paragraph>
          ) : null}
          {deleteConfirmItems.length > 1 ? (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {deleteConfirmItems.map((item) => (
                <li key={item.id}>
                  <Typography.Text>{item.label}</Typography.Text>
                </li>
              ))}
            </ul>
          ) : null}
          <Typography.Text type="danger">
            {t('roles:modals.delete.warning')}
          </Typography.Text>
        </Space>
      </Modal>
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
