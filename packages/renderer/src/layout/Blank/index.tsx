import type { JSX, ReactNode } from 'react'
import { Space, Layout } from 'antd'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'

const { Header, Content } = Layout

interface BlankProps {
  children: ReactNode
}

const Blank = ({ children }: BlankProps): JSX.Element => (
  <Layout style={{ minHeight: '100vh' }}>
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingInline: 24
      }}
    >
      <Space align="center" size="middle" style={{ marginLeft: 'auto' }}>
        <LanguageSwitcher />
        <ThemeControls />
      </Space>
    </Header>
    <Content
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 24 }}
    >
      {children}
    </Content>
  </Layout>
)

export default Blank
