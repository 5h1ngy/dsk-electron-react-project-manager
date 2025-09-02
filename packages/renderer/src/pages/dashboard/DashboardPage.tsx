import type { JSX } from 'react'
import { Space } from 'antd'
import { HealthStatusCard } from '../health/components/HealthStatusCard'
import { UserManagementPanel } from '../auth/components/UserManagementPanel'

export const DashboardPage = (): JSX.Element => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <HealthStatusCard />
      <UserManagementPanel />
    </Space>
  )
}
