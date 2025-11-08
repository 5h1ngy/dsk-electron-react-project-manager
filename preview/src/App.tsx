import { ConfigProvider, FloatButton, Layout } from 'antd'
import { useMemo, useState } from 'react'
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

const App = () => {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [accent, setAccent] = useState(DEFAULT_ACCENT)

  const themeConfig = useMemo(() => createThemeConfig(mode, accent), [mode, accent])

  return (
    <ConfigProvider theme={themeConfig}>
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
    </ConfigProvider>
  )
}

export default App
