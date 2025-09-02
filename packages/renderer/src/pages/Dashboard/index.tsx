import { Space } from 'antd'
import { HealthStatusCard } from '../../components/HealthStatusCard'
import { UserManagementPanel } from './components/UserManagementPanel'

const DashboardPage = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <HealthStatusCard />
      <UserManagementPanel />
    </Space>
  )
}

export default DashboardPage
