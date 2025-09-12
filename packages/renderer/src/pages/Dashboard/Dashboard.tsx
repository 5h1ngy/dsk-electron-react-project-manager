import type { JSX } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Card, Space, Tag, Typography } from 'antd'

import { LoadingSkeleton } from '@renderer/components/DataStates'
import { HealthStatusCard } from '@renderer/components/HealthStatusCard'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import { fetchProjects, selectProjects, selectProjectsStatus } from '@renderer/store/slices/projects'
import { CreateUserModal } from '@renderer/pages/Dashboard/components/CreateUserModal'
import { EditUserModal } from '@renderer/pages/Dashboard/components/EditUserModal'
import { UserTable } from '@renderer/pages/Dashboard/components/UserTable'
import { ActionBar } from '@renderer/pages/Dashboard/components/ActionBar'
import { UserFilters, type UserFiltersValue } from '@renderer/pages/Dashboard/components/UserFilters'
import { UserCardsGrid } from '@renderer/pages/Dashboard/components/UserCardsGrid'
import { useUserManagement } from '@renderer/pages/Dashboard/hooks/useUserManagement'
import {
  mapRoleTags,
  selectRecentProjects,
  renderProjectsList
} from '@renderer/pages/Dashboard/Dashboard.helpers'
import type { DashboardProps, RoleTagDescriptor } from '@renderer/pages/Dashboard/Dashboard.types'
import type { RoleName } from '@main/services/auth/constants'

const renderRoleTags = (tags: RoleTagDescriptor[]): JSX.Element => (
  <Space size={4} wrap>
    {tags.map((tag) => (
      <Tag key={tag.key}>{tag.label}</Tag>
    ))}
  </Space>
)

const Dashboard = ({}: DashboardProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectCurrentUser)
  const projects = useAppSelector(selectProjects)
  const projectsStatus = useAppSelector(selectProjectsStatus)
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
    closeEditModal,
    submitCreate,
    submitUpdate,
    createForm,
    updateForm,
    refreshUsers,
    clearError,
    isAdmin
  } = useUserManagement()

  const isFetchingProjects = projectsStatus === 'loading'
  const projectListSkeleton = useDelayedLoading(isFetchingProjects)
  const [userFilters, setUserFilters] = useState<UserFiltersValue>({
    search: '',
    role: 'all',
    status: 'all'
  })
  const [userViewMode, setUserViewMode] = useState<'table' | 'cards'>('table')
  const [userCardPage, setUserCardPage] = useState(1)
  const USER_CARD_PAGE_SIZE = 8

  const availableRoles = useMemo<RoleName[]>(() => {
    const set = new Set<RoleName>()
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
    setUserCardPage(1)
  }

  useEffect(() => {
    setUserCardPage(1)
  }, [userViewMode])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredUsers.length / USER_CARD_PAGE_SIZE))
    if (userCardPage > maxPage) {
      setUserCardPage(maxPage)
    }
  }, [filteredUsers.length, userCardPage])

  useEffect(() => {
    if (!isAdmin && projectsStatus === 'idle') {
      void dispatch(fetchProjects())
    }
  }, [dispatch, isAdmin, projectsStatus])

  if (!isAdmin) {
    const roleTags = mapRoleTags(currentUser?.roles, t)
    const recentProjects = selectRecentProjects(projects)
    const roleTagElements = renderRoleTags(roleTags)

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {messageContext}
        <Typography.Title level={3}>{t('personal.heading')}</Typography.Title>
        <Space direction="horizontal" size="large" wrap style={{ width: '100%' }}>
          <Card title={t('personal.profileTitle')} style={{ flex: 1, minWidth: 260 }}>
            <Space direction="vertical" size={8}>
              <Typography.Text>
                {t('personal.username', { username: currentUser?.username })}
              </Typography.Text>
              {roleTagElements}
            </Space>
          </Card>
          <Card title={t('personal.projectsTitle')} style={{ flex: 2, minWidth: 320 }}>
            {projectListSkeleton ? (
              <LoadingSkeleton variant="list" />
            ) : (
              renderProjectsList(recentProjects, t)
            )}
          </Card>
        </Space>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {messageContext}
      <HealthStatusCard />
      <ActionBar onCreate={openCreateModal} onRefresh={refreshUsers} isRefreshing={loading} />
      <UserFilters
        value={userFilters}
        onChange={handleUserFiltersChange}
        roleOptions={availableRoles}
        viewMode={userViewMode}
        onViewModeChange={(mode) => setUserViewMode(mode)}
        aria-label={t('filters.users.ariaLabel')}
      />
      {error && (
        <Alert
          type="error"
          message={t('dashboard:error.title')}
          description={error}
          onClose={clearError}
          closable
        />
      )}
      {userViewMode === 'table' ? (
        <UserTable
          columns={columns}
          users={filteredUsers}
          loading={loading}
          hasLoaded={hasLoaded}
        />
      ) : (
        <UserCardsGrid
          users={filteredUsers}
          loading={loading}
          page={userCardPage}
          pageSize={USER_CARD_PAGE_SIZE}
          onPageChange={setUserCardPage}
        />
      )}
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
  )
}

Dashboard.displayName = 'Dashboard'

export { Dashboard }
export default Dashboard
