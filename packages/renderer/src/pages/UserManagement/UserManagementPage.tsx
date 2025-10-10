import type { JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Breadcrumb, Button, Space } from 'antd'
import { ROLE_NAMES } from '@main/services/auth/constants'
import { ReloadOutlined } from '@ant-design/icons'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

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
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser, selectToken } from '@renderer/store/slices/auth/selectors'
import { forceLogout } from '@renderer/store/slices/auth'
import { handleResponse, isSessionExpiredError } from '@renderer/store/slices/auth/helpers'

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
    role: 'all',
    status: 'all'
  })
  const [userViewMode, setUserViewMode] = useState<'table' | 'list' | 'cards'>('table')
  const [userTablePage, setUserTablePage] = useState(1)
  const [userTablePageSize, setUserTablePageSize] = useState(10)
  const [userCardPage, setUserCardPage] = useState(1)
  const [userListPage, setUserListPage] = useState(1)

  const {
    users,
    error,
    loading,
    hasLoaded,
    messageContext,
    columns,
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
    removeUser
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
    const needle = userFilters.search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        needle.length === 0 ||
        [user.username, user.displayName]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(needle))

      if (!matchesSearch) {
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

      return true
    })
  }, [userFilters.role, userFilters.search, userFilters.status, users])

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
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshUsers}
            loading={loading}
            disabled={loading}
          >
            {t('dashboard:actionBar.refresh')}
          </Button>
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
          <UserTable
            columns={columns}
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
          />
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
            onDelete={removeUser}
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
            onDelete={removeUser}
          />
        ) : null}
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
