import type { JSX } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Card, Space, Tag, Typography } from 'antd'

import { HealthStatusCard } from '@renderer/components/HealthStatusCard'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import { fetchProjects, selectProjects, selectProjectsStatus } from '@renderer/store/slices/projects'
import { CreateUserModal } from '@renderer/pages/Dashboard/components/CreateUserModal'
import { EditUserModal } from '@renderer/pages/Dashboard/components/EditUserModal'
import { UserTable } from '@renderer/pages/Dashboard/components/UserTable'
import { ActionBar } from '@renderer/pages/Dashboard/components/ActionBar'
import { useUserManagement } from '@renderer/pages/Dashboard/hooks/useUserManagement'
import {
  mapRoleTags,
  selectRecentProjects,
  renderProjectsList
} from '@renderer/pages/Dashboard/Dashboard.helpers'
import type { DashboardProps, RoleTagDescriptor } from '@renderer/pages/Dashboard/Dashboard.types'

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
            {renderProjectsList(recentProjects, t, isFetchingProjects)}
          </Card>
        </Space>
      </Space>
    )
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {messageContext}
      <HealthStatusCard />
      <ActionBar onCreate={openCreateModal} onRefresh={refreshUsers} />
      {error && (
        <Alert
          type="error"
          message={t('dashboard:error.title')}
          description={error}
          onClose={clearError}
          closable
        />
      )}
      <UserTable columns={columns} users={users} />
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
