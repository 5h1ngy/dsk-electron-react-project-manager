import { Avatar, ConfigProvider, FloatButton, Layout, Space, Typography, theme as antdTheme } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { Hero } from './components/Hero'
import { FeatureGrid } from './components/FeatureGrid'
import { Architecture } from './components/Architecture'
import { Showcase } from './components/Showcase'
import { TokenPlayground } from './components/TokenPlayground'
import { CallToAction } from './components/CallToAction'
import { createThemeConfig } from './theme'
import type { ThemeMode } from './theme/foundations/palette'

const { Header, Content, Footer } = Layout

const DEFAULT_ACCENT = '#6366F1'

const AppShell = ({
  mode,
  setMode,
  accent,
  setAccent
}: {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  accent: string
  setAccent: (accent: string) => void
}) => {
  const { token } = antdTheme.useToken()

  useEffect(() => {
    document.body.style.background = token.colorBgLayout ?? '#05070d'
    document.body.style.color = token.colorTextBase ?? '#e2e8f0'
    document.body.style.fontFamily =
      token.fontFamily ?? 'Inter, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
    document.body.style.transition = 'background 0.4s ease, color 0.4s ease'
  }, [token.colorBgLayout, token.colorTextBase, token.fontFamily])

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, ${token.colorBgContainer}20, transparent 55%)`
      }}
    >
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'rgba(5, 7, 13, 0.7)',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          backdropFilter: 'blur(12px)',
          padding: '18px 32px'
        }}
      >
        <Space align="center" size="small">
          <Avatar
            size={14}
            style={{ backgroundColor: token.colorPrimary, display: 'inline-flex' }}
          />
          <Typography.Text strong style={{ letterSpacing: '0.05em' }}>
            DSK Project Manager
          </Typography.Text>
        </Space>
      </Header>
      <Content
        style={{
          padding: '48px 24px 96px',
          maxWidth: 1080,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <Hero />
        <TokenPlayground
          mode={mode}
          onModeChange={setMode}
          accent={accent}
          onAccentChange={setAccent}
        />
        <FeatureGrid />
        <Architecture />
        <Showcase />
        <CallToAction />
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          padding: 32,
          background: 'transparent',
          color: token.colorTextSecondary
        }}
      >
        Crafted with Electron + React · MIT License · Hosted on GitHub Pages
      </Footer>
      <FloatButton.BackTop visibilityHeight={200} />
    </Layout>
  )
}

const App = () => {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [accent, setAccent] = useState(DEFAULT_ACCENT)

  const themeConfig = useMemo(() => createThemeConfig(mode, accent), [mode, accent])

  return (
    <ConfigProvider theme={themeConfig}>
      <AppShell mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} />
    </ConfigProvider>
  )
}

export default App
