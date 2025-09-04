import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Space } from 'antd'

import { HealthStatusCard } from '@renderer/components/HealthStatusCard'

import { CreateUserModal } from './components/CreateUserModal'
import { EditUserModal } from './components/EditUserModal'
import { UserTable } from './components/UserTable'
import { ActionBar } from './components/ActionBar'
import { useUserManagement } from './hooks/useUserManagement'

const Dashboard = (): JSX.Element => {
  const { t } = useTranslation('dashboard')
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

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {messageContext}
      <HealthStatusCard />
      {isAdmin ? (
        <>
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
        </>
      ) : (
        <Alert
          type="info"
          showIcon
          message={t('dashboard:permissions.title')}
          description={t('dashboard:permissions.description')}
        />
      )}
    </Space>
  )
}

export default Dashboard
