import type { JSX } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Breadcrumb, Button, Modal, Space, Typography } from 'antd'
import { ROLE_NAMES } from '@main/services/auth/constants'
import { DeleteOutlined } from '@ant-design/icons'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'
import { CreateUserModal } from '@renderer/pages/Dashboard/components/CreateUserModal'
import { EditUserModal } from '@renderer/pages/Dashboard/components/EditUserModal'
import { UserCardsGrid } from '@renderer/pages/Dashboard/components/UserCardsGrid'
import {
  UserFilters,
  type UserFiltersValue
} from '@renderer/pages/Dashboard/components/UserFilters'
import { UserListView } from '@renderer/pages/Dashboard/components/UserListView'
import { UserTable } from '@renderer/pages/Dashboard/components/UserTable'
import { useUserManagement } from '@renderer/pages/Dashboard/hooks/useUserManagement'
import {
  OPTIONAL_USER_COLUMNS,
  OptionalUserColumn,
  UserColumnVisibilityControls
} from '@renderer/pages/Dashboard/components/UserColumnVisibilityControls'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser, selectToken } from '@renderer/store/slices/auth/selectors'
import { forceLogout } from '@renderer/store/slices/auth'
import { handleResponse, isSessionExpiredError } from '@renderer/store/slices/auth/helpers'
import type { UserDTO } from '@main/services/auth'

const USER_CARD_PAGE_SIZE = 8
const USER_LIST_PAGE_SIZE = 12

const UserManagementPage = (): JSX.Element | null => {
  const { t } = useTranslation('dashboard')
  const breadcrumbItems = usePrimaryBreadcrumb([
    { title: t('appShell.navigation.userManagement', { ns: 'common' }) }
  ])
  const breadcrumbStyle = useBreadcrumbStyle(breadcrumbItems)
  const currentUser = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const management = useUserManagement()
  const [roleOptions, setRoleOptions] = useState<string[]>(ROLE_NAMES.slice())
  const [userFilters, setUserFilters] = useState<UserFiltersValue>({
    search: '',
    username: '',
    displayName: '',
    role: 'all',
    status: 'all',
    lastLoginRange: null,
    createdRange: null,
    updatedRange: null
  })
  const [userViewMode, setUserViewMode] = useState<'table' | 'list' | 'cards'>('table')
  const [userTablePage, setUserTablePage] = useState(1)
  const [userTablePageSize, setUserTablePageSize] = useState(10)
  const [userCardPage, setUserCardPage] = useState(1)
  const [userListPage, setUserListPage] = useState(1)
  const [visibleUserColumns, setVisibleUserColumns] = useState<OptionalUserColumn[]>(() => [
    ...OPTIONAL_USER_COLUMNS
  ])
  const [optionalFieldsOpen, setOptionalFieldsOpen] = useState(false)

  const {
    users,
    error,
    loading,
    hasLoaded,
    messageContext,
    baseColumns,
    optionalColumns,
    actionsColumn,
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
    isAdmin,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    deleteConfirmUsers,
    deleteLoading,
    isDeletingUser,
    selectedUserIds,
    setSelectedUserIds
  } = management

  const availableRoles = useMemo(() => {
    const set = new Set<string>(roleOptions)
    users.forEach((user) => {
      user.roles.forEach((role) => set.add(role))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [roleOptions, users])

  useEffect(() => {
    if (!isAdmin || !token) {
      setRoleOptions(ROLE_NAMES.slice())
      return
    }
    let cancelled = false
    const loadRoles = async () => {
      try {
        const roleList = await handleResponse(window.api.role.list(token))
        if (!cancelled) {
          const names = Array.from(new Set(roleList.map((role) => role.name))).sort((a, b) =>
            a.localeCompare(b)
          )
          setRoleOptions(names)
        }
      } catch (err) {
        if (isSessionExpiredError(err)) {
          dispatch(forceLogout())
          return
        }
        console.warn('Failed to load roles', err)
      }
    }
    void loadRoles()
    return () => {
      cancelled = true
    }
  }, [dispatch, isAdmin, token])

  const filteredUsers = useMemo(() => {
    const searchNeedle = userFilters.search.trim().toLowerCase()
    const usernameNeedle = userFilters.username.trim().toLowerCase()
    const displayNameNeedle = userFilters.displayName.trim().toLowerCase()

    const normalizeRange = (
      range: UserFiltersValue['lastLoginRange']
    ): { start: dayjs.Dayjs | null; end: dayjs.Dayjs | null } | null => {
      if (!range) {
        return null
      }
      const [start, end] = range
      return {
        start: start ? dayjs(start) : null,
        end: end ? dayjs(end) : null
      }
    }

    const lastLoginRange = normalizeRange(userFilters.lastLoginRange)
    const createdRange = normalizeRange(userFilters.createdRange)
    const updatedRange = normalizeRange(userFilters.updatedRange)

    const matchesRange = (
      value: Date | string | null,
      range: { start: dayjs.Dayjs | null; end: dayjs.Dayjs | null } | null,
      allowEmptyValue = false
    ): boolean => {
      if (!range) {
        return true
      }
      if (!value) {
        return allowEmptyValue && !range.start && !range.end
      }
      const parsed = dayjs(value)
      if (!parsed.isValid()) {
        return false
      }
      if (range.start && parsed.isBefore(range.start)) {
        return false
      }
      if (range.end && parsed.isAfter(range.end)) {
        return false
      }
      return true
    }

    return users.filter((user) => {
      const baseValues = [user.username, user.displayName, user.id].filter(Boolean).map((value) => value.toLowerCase())
      if (searchNeedle.length > 0 && !baseValues.some((value) => value.includes(searchNeedle))) {
        return false
      }

      if (usernameNeedle.length > 0 && !user.username.toLowerCase().includes(usernameNeedle)) {
        return false
      }

      if (
        displayNameNeedle.length > 0 &&
        !(user.displayName ?? '').toLowerCase().includes(displayNameNeedle)
      ) {
        return false
      }

      if (userFilters.role !== 'all' && !user.roles.includes(userFilters.role)) {
        return false
      }

      if (userFilters.status !== 'all') {
        const shouldBeActive = userFilters.status === 'active'
        if (user.isActive !== shouldBeActive) {
          return false
        }
      }

      if (!matchesRange(user.lastLoginAt, lastLoginRange, false)) {
        return false
      }

      if (!matchesRange(user.createdAt, createdRange, true)) {
        return false
      }

      if (!matchesRange(user.updatedAt, updatedRange, true)) {
        return false
      }

      return true
    })
  }, [
    userFilters.createdRange,
    userFilters.displayName,
    userFilters.lastLoginRange,
    userFilters.role,
    userFilters.search,
    userFilters.status,
    userFilters.updatedRange,
    userFilters.username,
    users
  ])

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedUserIds.includes(user.id) && user.id !== currentUser?.id),
    [currentUser?.id, selectedUserIds, users]
  )

  const userTableColumns = useMemo(
    () => [
      ...baseColumns,
      ...visibleUserColumns
        .map((key) => optionalColumns[key])
        .filter(
          (column): column is (typeof baseColumns)[number] =>
            Boolean(column)
        ),
      actionsColumn
    ],
    [actionsColumn, baseColumns, optionalColumns, visibleUserColumns]
  )

  const deleteModalTitle = useMemo(() => {
    if (!deleteConfirmUsers || deleteConfirmUsers.length === 0) {
      return ''
    }
    if (deleteConfirmUsers.length === 1) {
      return t('dashboard:modals.deleteUser.title', {
        username: deleteConfirmUsers[0].username
      })
    }
    return t('dashboard:modals.deleteUser.bulkTitle', {
      count: deleteConfirmUsers.length
    })
  }, [deleteConfirmUsers, t])

  const deleteModalDescription = useMemo(() => {
    if (!deleteConfirmUsers || deleteConfirmUsers.length === 0) {
      return ''
    }
    if (deleteConfirmUsers.length === 1) {
      const target = deleteConfirmUsers[0]
      const label =
        target.displayName && target.displayName.trim().length > 0
          ? `${target.displayName} (@${target.username})`
          : `@${target.username}`
      return t('dashboard:modals.deleteUser.description', {
        user: label
      })
    }
    return t('dashboard:modals.deleteUser.bulkDescription', {
      count: deleteConfirmUsers.length
    })
  }, [deleteConfirmUsers, t])

  const deleteConfirmItems = useMemo(
    () =>
      deleteConfirmUsers?.map((user) => ({
        id: user.id,
        label:
          user.displayName && user.displayName.trim().length > 0
            ? `${user.displayName} (@${user.username})`
            : `@${user.username}`
      })) ?? [],
    [deleteConfirmUsers]
  )

  const handleDeleteUser = useCallback(
    (user: UserDTO) => {
      openDeleteConfirm(user)
    },
    [openDeleteConfirm]
  )

  const handleBulkDelete = useCallback(() => {
    if (selectedUsers.length === 0) {
      return
    }
    openDeleteConfirm(selectedUsers)
  }, [openDeleteConfirm, selectedUsers])

  const bulkDeleteButton = useMemo(() => {
    if (!isAdmin) {
      return null
    }
    return (
      <Button
        key="bulk-delete-users"
        icon={<DeleteOutlined />}
        danger
        onClick={handleBulkDelete}
        disabled={selectedUsers.length === 0 || deleteLoading}
        loading={deleteLoading && selectedUsers.length > 0}
      >
        {t('dashboard:actions.deleteSelected', {
          count: selectedUsers.length
        })}
      </Button>
    )
  }, [deleteLoading, handleBulkDelete, isAdmin, selectedUsers.length, t])

  const handleUserFiltersChange = (patch: Partial<UserFiltersValue>) => {
    setUserFilters((prev) => ({
      ...prev,
      ...patch
    }))
    setUserTablePage(1)
    setUserCardPage(1)
    setUserListPage(1)
  }

  useEffect(() => {
    if (userViewMode === 'table') {
      setUserTablePage(1)
    }
    if (userViewMode === 'cards') {
      setUserCardPage(1)
    }
    if (userViewMode === 'list') {
      setUserListPage(1)
    }
  }, [userViewMode])

  useEffect(() => {
    if (userViewMode !== 'table') {
      setOptionalFieldsOpen(false)
    }
  }, [userViewMode])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / userTablePageSize))
    if (userTablePage > maxPage) {
      setUserTablePage(maxPage)
    }
  }, [filteredUsers.length, userTablePage, userTablePageSize])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / USER_CARD_PAGE_SIZE))
    if (userCardPage > maxPage) {
      setUserCardPage(maxPage)
    }
  }, [filteredUsers.length, userCardPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / USER_LIST_PAGE_SIZE))
    if (userListPage > maxPage) {
      setUserListPage(maxPage)
    }
  }, [filteredUsers.length, userListPage])

  useEffect(() => {
    if (userViewMode !== 'table' && selectedUserIds.length > 0) {
      setSelectedUserIds([])
    }
  }, [selectedUserIds.length, setSelectedUserIds, userViewMode])

  useEffect(() => {
    if (selectedUserIds.length === 0) {
      return
    }
    const validIds = new Set(users.map((user) => user.id))
    const cleaned = selectedUserIds.filter((id) => id !== currentUser?.id && validIds.has(id))
    if (cleaned.length !== selectedUserIds.length) {
      setSelectedUserIds(cleaned)
    }
  }, [currentUser?.id, selectedUserIds, setSelectedUserIds, users])

  if (!currentUser) {
    return null
  }

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
        </Space>
      </ShellHeaderPortal>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {messageContext}
        <UserFilters
          value={userFilters}
          onChange={handleUserFiltersChange}
          roleOptions={availableRoles}
          aria-label={t('filters.users.ariaLabel')}
          onCreate={openCreateModal}
          canCreate={isAdmin}
          viewMode={userViewMode}
          onViewModeChange={(mode) => {
            setUserViewMode(mode)
          }}
          primaryActions={bulkDeleteButton ? [bulkDeleteButton] : []}
          onRefresh={refreshUsers}
          refreshing={loading}
          onOpenOptionalFields={() => setOptionalFieldsOpen(true)}
          hasOptionalFields={OPTIONAL_USER_COLUMNS.length > 0}
          optionalFieldsDisabled={userViewMode !== 'table'}
        />
        {error ? (
          <Alert
            type="error"
            message={t('dashboard:error.title')}
            description={error}
            onClose={clearError}
            closable
          />
        ) : null}
        {userViewMode === 'table' ? (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <UserTable
              columns={userTableColumns}
              users={filteredUsers}
              loading={loading}
              hasLoaded={hasLoaded}
              pagination={{
                current: userTablePage,
                pageSize: userTablePageSize,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: (page, size) => {
                  setUserTablePage(page)
                  if (typeof size === 'number' && size !== userTablePageSize) {
                    setUserTablePageSize(size)
                  }
                }
              }}
              rowSelection={{
                selectedRowKeys: selectedUserIds,
                onChange: (keys) => setSelectedUserIds(keys),
                disabled: deleteLoading,
                disableKeys: currentUser ? [currentUser.id] : []
              }}
            />
          </Space>
        ) : null}
        {userViewMode === 'list' ? (
          <UserListView
            users={filteredUsers}
            loading={loading}
            hasLoaded={hasLoaded}
            page={userListPage}
            pageSize={USER_LIST_PAGE_SIZE}
            onPageChange={setUserListPage}
            onEdit={openEditModal}
            onDelete={handleDeleteUser}
            isDeleting={isDeletingUser}
            deleteDisabled={deleteLoading}
          />
        ) : null}
        {userViewMode === 'cards' ? (
          <UserCardsGrid
            users={filteredUsers}
            loading={loading}
            hasLoaded={hasLoaded}
            page={userCardPage}
            pageSize={USER_CARD_PAGE_SIZE}
            onPageChange={setUserCardPage}
            onEdit={openEditModal}
            onDelete={handleDeleteUser}
            isDeleting={isDeletingUser}
            deleteDisabled={deleteLoading}
          />
        ) : null}
        <Modal
          open={optionalFieldsOpen}
          title={t('dashboard:optionalColumns.modalTitle', { defaultValue: 'Campi opzionali' })}
          onCancel={() => setOptionalFieldsOpen(false)}
          footer={null}
          centered
          destroyOnClose={false}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <UserColumnVisibilityControls
              columns={OPTIONAL_USER_COLUMNS}
              selectedColumns={visibleUserColumns}
              onChange={(next) => setVisibleUserColumns(next.length ? next : [])}
            />
          </Space>
        </Modal>
        <Modal
          open={Boolean(deleteConfirmUsers && deleteConfirmUsers.length > 0)}
          title={deleteModalTitle}
          onCancel={closeDeleteConfirm}
          onOk={() => {
            void confirmDelete()
          }}
          okText={t('dashboard:modals.deleteUser.confirm')}
          cancelText={t('dashboard:modals.deleteUser.cancel')}
          okButtonProps={{
            danger: true,
            loading: deleteLoading,
            disabled: !deleteConfirmUsers || deleteConfirmUsers.length === 0
          }}
          cancelButtonProps={{
            disabled: deleteLoading
          }}
          closable={!deleteLoading}
          maskClosable={false}
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
              {t('dashboard:modals.deleteUser.warning')}
            </Typography.Text>
          </Space>
        </Modal>
        <CreateUserModal
          open={isCreateOpen}
          onCancel={closeCreateModal}
          onSubmit={submitCreate}
          form={createForm}
          roleOptions={availableRoles}
        />
        <EditUserModal
          user={editingUser}
          open={Boolean(editingUser)}
          onCancel={closeEditModal}
          onSubmit={submitUpdate}
          form={updateForm}
          roleOptions={availableRoles}
        />
      </Space>
    </>
  )
}

UserManagementPage.displayName = 'UserManagementPage'

export { UserManagementPage }
export default UserManagementPage
