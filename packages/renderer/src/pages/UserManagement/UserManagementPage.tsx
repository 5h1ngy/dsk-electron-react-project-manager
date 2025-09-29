import type { JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Alert, Breadcrumb, Button, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
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
import { useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'

const USER_CARD_PAGE_SIZE = 8
const USER_LIST_PAGE_SIZE = 12

const UserManagementPage = (): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const currentUser = useAppSelector(selectCurrentUser)

  if (!currentUser.roles.includes('Admin')) {
    return <Navigate to="/" replace />
  }

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
  } = useUserManagement()

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

  const availableRoles = useMemo(() => {
    const set = new Set<string>()
    users.forEach((user) => {
      user.roles.forEach((role) => set.add(role))
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [users])

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

  const breadcrumbItems = usePrimaryBreadcrumb([
    {
      title: t('appShell.navigation.dashboard', { ns: 'common' }),
      onClick: () => navigate('/')
    },
    {
      title: t('appShell.navigation.userManagement', { ns: 'common' })
    }
  ])

  return (
    <>
      <ShellHeaderPortal>
        <Space align="center" size={12} wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshUsers}
            loading={loading}
            disabled={loading}
          >
            {t('dashboard:actionBar.refresh')}
          </Button>
          <Breadcrumb items={breadcrumbItems} />
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
        />
        <EditUserModal
          user={editingUser}
          open={Boolean(editingUser)}
          onCancel={closeEditModal}
          onSubmit={submitUpdate}
          form={updateForm}
        />
      </Space>
    </>
  )
}

UserManagementPage.displayName = 'UserManagementPage'

export { UserManagementPage }
export default UserManagementPage
