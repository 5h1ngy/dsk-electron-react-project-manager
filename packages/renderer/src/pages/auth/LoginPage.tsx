import type { JSX } from 'react'
import { Space } from 'antd'
import { HealthStatusCard } from '../health/components/HealthStatusCard'
import { LoginForm } from './components/LoginForm'

export const LoginPage = (): JSX.Element => {
  return (
    <div className="auth-screen">
      <Space direction="vertical" size="large" style={{ width: '100%', maxWidth: 480 }}>
        <HealthStatusCard />
        <LoginForm />
      </Space>
    </div>
  )
}
