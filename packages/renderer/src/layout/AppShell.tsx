import { Layout, Typography, Space, Button, Tag } from 'antd'
import type { JSX, ReactNode } from 'react'
import type { UserDTO } from '@main/auth/authService'
import { ThemeToggle } from '../components/ThemeToggle'

const { Header, Content } = Layout

interface AppShellProps {
  currentUser: UserDTO
  onLogout: () => void
  children: ReactNode
}

export const AppShell = ({ currentUser, onLogout, children }: AppShellProps): JSX.Element => {
  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div>
            <Typography.Title level={4} style={{ margin: 0 }}>
              DSK Project Manager
            </Typography.Title>
            <Typography.Text type="secondary">Benvenuto, {currentUser.displayName}</Typography.Text>
          </div>
          <Space size="middle" align="center">
            <Tag color="blue">{currentUser.roles.join(', ')}</Tag>
            <Button onClick={onLogout}>Logout</Button>
            <ThemeToggle />
          </Space>
        </div>
      </Header>
      <Content className="app-content">{children}</Content>
    </Layout>
  )
}
