import type { JSX } from 'react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Card, List, Space, Tag, Typography } from 'antd'

import { HealthStatusCard } from '@renderer/components/HealthStatusCard'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import { fetchProjects, selectProjects, selectProjectsStatus } from '@renderer/store/slices/projects'

import { CreateUserModal } from './components/CreateUserModal'
import { EditUserModal } from './components/EditUserModal'
import { UserTable } from './components/UserTable'
import { ActionBar } from './components/ActionBar'
import { useUserManagement } from './hooks/useUserManagement'

const Dashboard = (): JSX.Element => {
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
    const roleTags = (currentUser?.roles ?? []).map((role) => (
      <Tag key={role}>{t(`roles.${role}`, { defaultValue: role })}</Tag>
    ))

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
              <Space size={4} wrap>{roleTags}</Space>
            </Space>
          </Card>
          <Card title={t('personal.projectsTitle')} style={{ flex: 2, minWidth: 320 }}>
            <List
              loading={isFetchingProjects}
              dataSource={projects.slice(0, 8)}
              locale={{ emptyText: t('personal.noProjects') }}
              renderItem={(project) => (
                <List.Item>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Typography.Text strong>{project.name}</Typography.Text>
                    <Space size={6} wrap>
                      <Tag color="blue">{project.key}</Tag>
                      <Tag>{t(`roles.${project.role}`, { defaultValue: project.role })}</Tag>
                    </Space>
                    <Typography.Text type="secondary">
                      {project.description ?? t('personal.noDescription')}
                    </Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
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

export default Dashboard
