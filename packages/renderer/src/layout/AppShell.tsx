import { Layout, Typography } from 'antd'
import { ThemeToggle } from '../components/ThemeToggle'
import { HealthStatusCard } from '../features/health/components/HealthStatusCard'
import { JSX } from 'react'

const { Header, Content } = Layout

export const AppShell = (): JSX.Element => {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Typography.Title level={4} style={{ margin: 0 }}>
          DSK Project Manager
        </Typography.Title>
        <ThemeToggle />
      </Header>
      <Content className="app-content">
        <HealthStatusCard />
      </Content>
    </Layout>
  )
}
