import {
  Avatar,
  Card,
  ConfigProvider,
  FloatButton,
  Layout,
  Segmented,
  Space,
  Switch,
  Typography,
  theme as antdTheme
} from 'antd'
import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import gsap from 'gsap'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { HeroStage } from './components/HeroStage'
import { FeatureOrbit } from './components/FeatureOrbit'
import { ExperienceShowcase } from './components/ExperienceShowcase'
import { ScreensGallery } from './components/ScreensGallery'
import { ArchitectureGraph } from './components/ArchitectureGraph'
import { ACCENT_OPTIONS, createThemeConfig } from './theme'
import type { ThemeMode } from './theme/foundations/palette'
import { useGlobalAnimations } from './hooks/useGlobalAnimations'
import { useLenisScroll } from './hooks/useLenisScroll'

const { Content, Footer } = Layout
const DEFAULT_ACCENT = ACCENT_OPTIONS[0]

interface AppShellProps {
  mode: ThemeMode
  toggleMode: () => void
  accent: string
  setAccent: (value: string) => void
}

const AppShell = ({ mode, toggleMode, accent, setAccent }: AppShellProps) => {
  const { token } = antdTheme.useToken()
  const contentRef = useRef<HTMLDivElement>(null)
  useGlobalAnimations()

  useEffect(() => {
    document.body.style.background =
      mode === 'dark'
        ? `radial-gradient(circle at 10% 20%, ${accent}1a, transparent 50%),
           radial-gradient(circle at 90% 0%, ${accent}14, transparent 40%),
           linear-gradient(135deg, #020412, #050b1a 55%, #010106)`
        : `radial-gradient(circle at 15% 25%, ${accent}26, transparent 45%),
           radial-gradient(circle at 85% 10%, ${accent}1f, transparent 45%),
           linear-gradient(135deg, #f0f4ff, #ffffff 55%, #eef1ff)`
    document.body.style.color = mode === 'dark' ? '#f8fafc' : '#0f172a'
    document.body.style.fontFamily =
      token.fontFamily ?? 'Inter, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
  }, [token.fontFamily, mode, accent])

  useLayoutEffect(() => {
    if (!contentRef.current) return
    const ctx = gsap.context(() => {
      const ids = ['hero', 'features', 'showcase', 'gallery', 'architecture']
      ids.forEach((id, idx) => {
        gsap.from(`[data-motion="${id}"]`, {
          opacity: 0,
          y: 40,
          duration: 0.9,
          delay: idx * 0.2,
          ease: 'power3.out'
        })
      })
    }, contentRef)
    return () => ctx.revert()
  }, [])

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Card
        style={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 10,
          borderRadius: 32,
          padding: 12,
          backdropFilter: 'blur(20px)',
          background: mode === 'dark' ? 'rgba(15,23,42,0.7)' : 'rgba(255,255,255,0.9)'
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Space direction="vertical" size="small">
          <Space size="middle" align="center">
            <Typography.Text style={{ fontWeight: 600 }}>Display</Typography.Text>
            <Switch
              checkedChildren={<MoonOutlined />}
              unCheckedChildren={<BulbOutlined />}
              checked={mode === 'dark'}
              onChange={() => toggleMode()}
            />
          </Space>
          <Segmented
            value={accent}
            onChange={(value) => setAccent(value as string)}
            options={ACCENT_OPTIONS.map((value) => ({
              value,
              label: (
                <Space align="center">
                  <Avatar
                    shape="circle"
                    size={18}
                    style={{ background: value, border: '1px solid rgba(15,23,42,0.15)' }}
                  />
                </Space>
              )
            }))}
          />
        </Space>
      </Card>
      <Content style={{ width: '100%', padding: 0 }}>
        <div ref={contentRef}>
          <div style={{ width: '100%', padding: '32px 24px 0' }}>
            <HeroStage mode={mode} accent={accent} />
          </div>
          <div
            style={{
              maxWidth: 1280,
              width: '100%',
              margin: '0 auto',
              padding: '32px 24px 96px'
            }}
          >
            <Space
              direction="vertical"
              size={token.marginXXL * 1.5}
              style={{ width: '100%' }}
            >
              <FeatureOrbit accent={accent} />
              <ExperienceShowcase accent={accent} />
              <ScreensGallery accent={accent} />
              <ArchitectureGraph accent={accent} />
            </Space>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', background: 'transparent', color: token.colorTextBase }}>
        (c) {new Date().getFullYear()} DSK Project Manager - Offline-first delivery suite
      </Footer>
      <FloatButton.BackTop />
    </Layout>
  )
}

const App = () => {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT)
  const themeConfig = useMemo(() => createThemeConfig(mode, accent), [mode, accent])

  useLenisScroll()

  return (
    <ConfigProvider theme={themeConfig}>
      <AppShell
        mode={mode}
        toggleMode={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        accent={accent}
        setAccent={setAccent}
      />
    </ConfigProvider>
  )
}

export default App
