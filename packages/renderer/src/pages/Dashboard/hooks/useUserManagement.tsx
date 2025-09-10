import { JSX, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Space, Tag, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import type { UserDTO } from '@main/services/auth'
import type { RoleName } from '@main/services/auth/constants'

import { useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth'

import type { CreateUserValues, UpdateUserValues } from '@renderer/pages/Dashboard/schemas/userSchemas'
import { useUserForms } from '@renderer/pages/Dashboard/hooks/useUserForms'
import { useUserData } from '@renderer/pages/Dashboard/hooks/useUserData'

interface UserManagementState {
  users: UserDTO[]
  columns: ColumnsType<UserDTO>
  error?: string
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
}

export const useUserManagement = (): UserManagementState => {
  const currentUser = useAppSelector(selectCurrentUser)
  const isAdmin = (currentUser?.roles ?? []).includes('Admin')
  const { users, error, refreshUsers, clearError, createUser, updateUser } = useUserData({
    enabled: isAdmin
  })
  const { createForm, updateForm, resetCreateForm, resetUpdateForm } = useUserForms()
  const [messageApi, messageContext] = message.useMessage()
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null)
  const { t } = useTranslation('dashboard')

  const normalizeMessage = useCallback(
    (value: string) =>
      value.includes('ERR_PERMISSION') ? t('dashboard:permissions.description') : value,
    [t]
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
          : (error as Error).message ?? t('dashboard:messages.createErrorFallback')
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
          : (error as Error).message ?? t('dashboard:messages.updateErrorFallback')
      messageApi.error(normalizeMessage(messageText))
    }
  })

  const columns = useMemo<ColumnsType<UserDTO>>(
    () => [
      { title: t('dashboard:table.username'), dataIndex: 'username', key: 'username' },
      { title: t('dashboard:table.displayName'), dataIndex: 'displayName', key: 'displayName' },
      {
        title: t('dashboard:table.roles'),
        dataIndex: 'roles',
        key: 'roles',
        render: (roles: RoleName[]) => (
          <Space size={4} wrap>
            {roles.map((role) => (
              <Tag key={role} color="blue">
                {t(`dashboard:roles.${role}`, { defaultValue: role })}
              </Tag>
            ))}
          </Space>
        )
      },
      {
        title: t('dashboard:table.status'),
        dataIndex: 'isActive',
        key: 'isActive',
        render: (isActive: boolean) => (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? t('dashboard:status.active') : t('dashboard:status.inactive')}
          </Tag>
        )
      },
      {
        title: t('dashboard:table.actions'),
        key: 'actions',
        render: (_value: unknown, record: UserDTO) => (
          <Button size="small" onClick={() => openEditModal(record)}>
            {t('dashboard:actions.edit')}
          </Button>
        )
      }
    ],
    [openEditModal, t]
  )

  return {
    users,
    columns,
    error,
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
    isAdmin
  }
}
