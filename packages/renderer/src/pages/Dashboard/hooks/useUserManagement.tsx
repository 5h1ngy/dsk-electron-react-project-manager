import { JSX, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Space, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

import type { UserDTO } from '@main/services/auth'

import { useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth'

import type {
  CreateUserValues,
  UpdateUserValues
} from '@renderer/pages/Dashboard/schemas/userSchemas'
import { useUserForms } from '@renderer/pages/Dashboard/hooks/useUserForms'
import { useUserData } from '@renderer/pages/Dashboard/hooks/useUserData'
import type { OptionalUserColumn } from '@renderer/pages/Dashboard/components/UserColumnVisibilityControls'

interface UserManagementState {
  users: UserDTO[]
  baseColumns: ColumnsType<UserDTO>
  optionalColumns: Record<OptionalUserColumn, ColumnsType<UserDTO>[number]>
  actionsColumn: ColumnsType<UserDTO>[number]
  error?: string
  loading: boolean
  hasLoaded: boolean
  isCreateOpen: boolean
  editingUser: UserDTO | null
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (user: UserDTO) => void
  closeEditModal: () => void
  submitCreate: () => Promise<void>
  submitUpdate: () => Promise<void>
  createForm: ReturnType<typeof useUserForms>['createForm']
  updateForm: ReturnType<typeof useUserForms>['updateForm']
  refreshUsers: () => void
  clearError: () => void
  messageContext: JSX.Element
  isAdmin: boolean
  openDeleteConfirm: (users: UserDTO | UserDTO[]) => void
  closeDeleteConfirm: () => void
  confirmDelete: () => Promise<void>
  deleteConfirmUsers: UserDTO[] | null
  deleteLoading: boolean
  isDeletingUser: (userId: string) => boolean
  selectedUserIds: string[]
  setSelectedUserIds: (ids: string[]) => void
}

export const useUserManagement = (): UserManagementState => {
  const currentUser = useAppSelector(selectCurrentUser)
  const isAdmin = (currentUser?.roles ?? []).includes('Admin')
  const {
    users,
    error,
    loading,
    hasLoaded,
    refreshUsers,
    clearError,
    createUser,
    updateUser,
    deleteUser
  } = useUserData({
    enabled: isAdmin
  })
  const { createForm, updateForm, resetCreateForm, resetUpdateForm } = useUserForms()
  const [messageApi, messageContext] = message.useMessage()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null)
  const [deleteTargets, setDeleteTargets] = useState<UserDTO[] | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const { t } = useTranslation('dashboard')
  const badgeTokens = useSemanticBadges()

  const normalizeMessage = useCallback(
    (value: string) =>
      value.includes('ERR_PERMISSION') ? t('dashboard:permissions.description') : value,
    [t]
  )

  const isDeletingUser = useCallback(
    (userId: string) => deletingIds.includes(userId),
    [deletingIds]
  )

  const openCreateModal = useCallback(() => {
    if (!isAdmin) {
      return
    }
    clearError()
    resetCreateForm()
    setCreateOpen(true)
  }, [clearError, resetCreateForm, isAdmin])

  const closeCreateModal = useCallback(() => setCreateOpen(false), [])

  const openEditModal = useCallback(
    (user: UserDTO) => {
      if (!isAdmin) {
        return
      }
      clearError()
      setEditingUser(user)
      resetUpdateForm({
        displayName: user.displayName,
        roles: user.roles,
        isActive: user.isActive,
        password: undefined
      })
    },
    [clearError, resetUpdateForm, isAdmin]
  )

  const closeEditModal = useCallback(() => setEditingUser(null), [])

  const submitCreate = createForm.handleSubmit(async (values: CreateUserValues) => {
    try {
      await createUser(values)
      messageApi.success(t('dashboard:messages.createSuccess'))
      closeCreateModal()
      refreshUsers()
    } catch (error) {
      const messageText =
        typeof error === 'string'
          ? error
          : ((error as Error).message ?? t('dashboard:messages.createErrorFallback'))
      messageApi.error(normalizeMessage(messageText))
    }
  })

  const submitUpdate = updateForm.handleSubmit(async (values: UpdateUserValues) => {
    if (!editingUser) {
      return
    }
    try {
      const payload = { ...values }
      if (!values.password) {
        delete (payload as Partial<UpdateUserValues>).password
      }
      await updateUser(editingUser.id, payload)
      messageApi.success(t('dashboard:messages.updateSuccess'))
      closeEditModal()
      refreshUsers()
    } catch (error) {
      const messageText =
        typeof error === 'string'
          ? error
          : ((error as Error).message ?? t('dashboard:messages.updateErrorFallback'))
      messageApi.error(normalizeMessage(messageText))
    }
  })

  const openDeleteConfirm = useCallback(
    (targets: UserDTO | UserDTO[]) => {
      if (!isAdmin) {
        return
      }
      if (deleteLoading) {
        return
      }
      const list = (Array.isArray(targets) ? targets : [targets]).filter((user) => {
        if (currentUser?.id === user.id) {
          messageApi.warning(t('dashboard:messages.deleteSelfWarning'))
          return false
        }
        return true
      })
      if (list.length === 0) {
        return
      }
      setDeleteTargets(list)
    },
    [currentUser?.id, deleteLoading, isAdmin, messageApi, t]
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
    if (!isAdmin) {
      return
    }

    setDeleteLoading(true)
    const targetIds = deleteTargets.map((user) => user.id)
    setDeletingIds((prev) => Array.from(new Set([...prev, ...targetIds])))

    let successCount = 0

    for (const user of deleteTargets) {
      try {
        await deleteUser(user.id)
        successCount += 1
      } catch (error) {
        const messageText =
          typeof error === 'string'
            ? error
            : ((error as Error).message ?? t('dashboard:messages.deleteErrorFallback'))
        messageApi.error(normalizeMessage(messageText))
      }
    }

    setDeletingIds((prev) => prev.filter((id) => !targetIds.includes(id)))
    setDeleteLoading(false)
    setDeleteTargets(null)
    setSelectedUserIds((prev) => prev.filter((id) => !targetIds.includes(id)))

    if (successCount > 0) {
      if (successCount === 1) {
        messageApi.success(t('dashboard:messages.deleteSuccess'))
      } else {
        messageApi.success(
          t('dashboard:messages.deleteBulkSuccess', {
            count: successCount
          })
        )
      }
      refreshUsers()
    }
  }, [deleteTargets, deleteUser, isAdmin, messageApi, normalizeMessage, refreshUsers, t])

  const baseColumns = useMemo<ColumnsType<UserDTO>>(
    () => [
      { title: t('dashboard:table.username'), dataIndex: 'username', key: 'username' },
      { title: t('dashboard:table.displayName'), dataIndex: 'displayName', key: 'displayName' },
      {
        title: t('dashboard:table.roles'),
        dataIndex: 'roles',
        key: 'roles',
        render: (roles: string[]) => (
          <Space size={4} wrap>
            {roles.map((role) => {
              const badge = badgeTokens.userRole[role] ?? badgeTokens.userRole.Viewer
              return (
                <Tag key={role} bordered={false} style={buildBadgeStyle(badge)}>
                  {t(`dashboard:roles.${role}`, { defaultValue: role })}
                </Tag>
              )
            })}
          </Space>
        )
      },
      {
        title: t('dashboard:table.status'),
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => {
          const badge = isActive ? badgeTokens.userStatus.active : badgeTokens.userStatus.inactive
          return (
            <Tag bordered={false} style={buildBadgeStyle(badge)}>
              {isActive ? t('dashboard:status.active') : t('dashboard:status.inactive')}
            </Tag>
          )
        }
      }
    ],
    [badgeTokens, t]
  )

  const dateFormatter = useCallback(
    (value: Date | string | null, formatKey: string) => {
      if (!value) {
        return t(formatKey, { defaultValue: '—' })
      }
      const parsed = dayjs(value)
      if (!parsed.isValid()) {
        return t(formatKey, { defaultValue: '—' })
      }
      return parsed.format('LLL')
    },
    [t]
  )

  const optionalColumns = useMemo<Record<OptionalUserColumn, ColumnsType<UserDTO>[number]>>(
    () => ({
      id: {
        title: t('dashboard:table.id'),
        dataIndex: 'id',
        key: 'id'
      },
      lastLoginAt: {
        title: t('dashboard:table.lastLoginAt'),
        dataIndex: 'lastLoginAt',
        key: 'lastLoginAt',
        render: (value: UserDTO['lastLoginAt']) =>
          dateFormatter(value, 'dashboard:table.neverLoggedIn')
      },
      createdAt: {
        title: t('dashboard:table.createdAt'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: UserDTO['createdAt']) => dateFormatter(value, 'dashboard:table.createdAt')
      },
      updatedAt: {
        title: t('dashboard:table.updatedAt'),
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        render: (value: UserDTO['updatedAt']) => dateFormatter(value, 'dashboard:table.updatedAt')
      }
    }),
    [dateFormatter, t]
  )

  const actionsColumn = useMemo<ColumnsType<UserDTO>[number]>(
    () => ({
      title: t('dashboard:table.actions'),
      key: 'actions',
      render: (_value: unknown, record: UserDTO) => (
        <Space size={4}>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(event) => {
              event.stopPropagation()
              openEditModal(record)
            }}
          >
            {t('dashboard:actions.edit')}
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={isDeletingUser(record.id)}
            disabled={deleteLoading && !isDeletingUser(record.id)}
            onClick={(event) => {
              event.stopPropagation()
              openDeleteConfirm(record)
            }}
          >
            {t('dashboard:actions.delete')}
          </Button>
        </Space>
      )
    }),
    [deleteLoading, isDeletingUser, openDeleteConfirm, openEditModal, t]
  )

  return {
    users,
    baseColumns,
    optionalColumns,
    actionsColumn,
    error,
    loading,
    hasLoaded,
    isCreateOpen,
    editingUser,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    submitCreate,
    submitUpdate,
    createForm,
    updateForm,
    refreshUsers,
    clearError,
    messageContext,
    isAdmin,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    deleteConfirmUsers: deleteTargets,
    deleteLoading,
    isDeletingUser,
    selectedUserIds,
    setSelectedUserIds
  }
}
