import { ConfigProvider, FloatButton, Layout, theme as antdTheme } from 'antd'
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
    const root = document.documentElement
    root.style.setProperty('--app-bg', token.colorBgLayout ?? '#05070d')
    root.style.setProperty('--app-surface', token.colorBgContainer ?? '#111b2d')
    root.style.setProperty('--app-elevated', token.colorBgElevated ?? '#1f2937')
    root.style.setProperty('--app-border', token.colorBorderSecondary ?? 'rgba(255,255,255,0.08)')
    root.style.setProperty('--app-text', token.colorTextBase ?? '#e2e8f0')
    root.style.setProperty('--app-text-secondary', token.colorTextSecondary ?? '#94a3b8')
    root.style.setProperty('--app-accent', token.colorPrimary ?? '#6366f1')
    root.style.setProperty('--app-shadow', token.boxShadow ?? '0 20px 50px rgba(15,23,42,.35)')
  }, [
    token.colorBgContainer,
    token.colorBgElevated,
    token.colorBgLayout,
    token.colorBorderSecondary,
    token.colorPrimary,
    token.colorTextBase,
    token.colorTextSecondary,
    token.boxShadow
  ])

  return (
    <Layout className={`app app-${mode}`}>
      <Header className="app-header">
        <span className="brand-dot" />
        <span>DSK Project Manager</span>
      </Header>
      <Content className="app-content">
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
      <Footer className="app-footer">
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
