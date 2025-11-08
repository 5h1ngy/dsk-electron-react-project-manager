import {
  Avatar,
  Card,
  ConfigProvider,
  FloatButton,
  Layout,
  Segmented,
  Space,
  Statistic,
  Tag,
  Typography,
  theme as antdTheme
} from 'antd'
import gsap from 'gsap'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Hero } from './components/Hero'
import { FeatureGrid } from './components/FeatureGrid'
import { Architecture } from './components/Architecture'
import { Showcase } from './components/Showcase'
import { TokenPlayground } from './components/TokenPlayground'
import { CallToAction } from './components/CallToAction'
import { ExperienceShowcase } from './components/ExperienceShowcase'
import { MomentumTicker } from './components/MomentumTicker'
import { createThemeConfig } from './theme'
import type { ThemeMode } from './theme/foundations/palette'
import { useGlobalAnimations } from './hooks/useGlobalAnimations'
import { useLenisScroll } from './hooks/useLenisScroll'

const { Header, Content, Footer } = Layout

const DEFAULT_ACCENT = '#6366F1'

const SURFACE_STATS = {
  Desktop: [
    { label: 'Cold boot', value: '≤ 800ms' },
    { label: 'IPC latency', value: '12ms' },
    { label: 'Battery impact', value: '-18%' }
  ],
  Web: [
    { label: 'First paint', value: '0.9s' },
    { label: 'Bundle size', value: '580kb' },
    { label: 'Locale coverage', value: '12' }
  ],
  API: [
    { label: 'p95 latency', value: '120ms' },
    { label: 'Audit events', value: '24/hr' },
    { label: 'Seed time', value: '3.2s' }
  ]
} as const

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
  const [surface, setSurface] = useState<'Desktop' | 'Web' | 'API'>('Desktop')
  const contentRef = useRef<HTMLDivElement>(null)
  useGlobalAnimations()

  useEffect(() => {
    document.body.style.background = token.colorBgLayout ?? '#05070d'
    document.body.style.color = token.colorTextBase ?? '#e2e8f0'
    document.body.style.fontFamily =
      token.fontFamily ?? 'Inter, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
    document.body.style.transition = 'background 0.4s ease, color 0.4s ease'
  }, [token.colorBgLayout, token.colorTextBase, token.fontFamily])

  useLayoutEffect(() => {
    if (!contentRef.current) {
      return
    }
    const ctx = gsap.context((self) => {
      const baseEase = 'power3.out'
      gsap.from('[data-motion="hero"]', { opacity: 0, y: 40, duration: 1, ease: baseEase })
      gsap.from('[data-motion="spotlight"]', { opacity: 0, y: 30, duration: 1, delay: 0.2, ease: baseEase })
      gsap.from('[data-motion="token"]', { opacity: 0, y: 50, duration: 1, delay: 0.25, ease: baseEase })
      gsap.from('[data-motion="features"] [data-hover-tilt]', {
        opacity: 0,
        y: 40,
        duration: 0.9,
        delay: 0.3,
        stagger: 0.08,
        ease: baseEase
      })
      gsap.from('[data-motion="architecture"]', { opacity: 0, y: 45, duration: 0.9, delay: 0.45, ease: baseEase })
      gsap.from('[data-motion="showcase"]', { opacity: 0, y: 55, duration: 0.9, delay: 0.55, ease: baseEase })
      gsap.from('[data-motion="cta"]', { opacity: 0, y: 50, duration: 0.9, delay: 0.65, ease: baseEase })
      gsap.from('[data-motion="experience"]', { opacity: 0, y: 40, duration: 0.9, delay: 0.35, ease: baseEase })
      gsap.from('[data-motion="ticker"]', { opacity: 0, y: 35, duration: 0.8, delay: 0.4, ease: baseEase })

      gsap.utils.toArray<HTMLElement>('[data-hover-tilt]').forEach((element) => {
        const enter = () => {
          gsap.to(element, {
            y: -12,
            rotateX: 3,
            rotateY: -2,
            duration: 0.5,
            ease: 'power3.out',
            boxShadow: '0 25px 70px rgba(0,0,0,0.25)'
          })
        }
        const leave = () => {
          gsap.to(element, {
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: 'power3.inOut',
            boxShadow: element.dataset.shadow ?? ''
          })
        }
        element.addEventListener('mouseenter', enter)
        element.addEventListener('mouseleave', leave)
        self.add(() => {
          element.removeEventListener('mouseenter', enter)
          element.removeEventListener('mouseleave', leave)
        })
      })
    }, contentRef)

    return () => ctx.revert()
  }, [mode, accent])

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
          <Avatar size={14} style={{ backgroundColor: token.colorPrimary, display: 'inline-flex' }} />
          <Typography.Text strong style={{ letterSpacing: '0.05em' }}>
            DSK Project Manager
          </Typography.Text>
          <Tag color={token.colorInfo} style={{ borderRadius: 999, marginLeft: 16 }}>
            Mode · {mode === 'dark' ? 'Nebula' : 'Aurora'}
          </Tag>
        </Space>
      </Header>
      <Content
        style={{
          padding: '48px 24px 96px',
          maxWidth: 1200,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <div ref={contentRef}>
          <Hero />
          <MomentumTicker />
          <Space
            direction="vertical"
            size="large"
            style={{ width: '100%', marginBottom: token.marginXL * 1.5 }}
            data-motion="spotlight"
          >
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG * 1.2,
                background: `linear-gradient(135deg, ${token.colorPrimary}33, ${token.colorInfo}33)`,
                border: `1px solid ${token.colorBorder}`,
                animation: 'glowPulse 8s ease-in-out infinite'
              }}
              data-hover-tilt
              data-shadow={token.boxShadow ?? ''}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Typography.Text>Explore each surface</Typography.Text>
                  <Segmented value={surface} options={['Desktop', 'Web', 'API']} onChange={(value) => setSurface(value as typeof surface)} />
                </Space>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {surface === 'Desktop' && 'Hyper-secure Electron shell for offline-first teams'}
                  {surface === 'Web' && 'React 19 SPA with Ant Design token orchestration'}
                  {surface === 'API' && 'Sequelize + routing-controllers domain services'}
                </Typography.Title>
                <Space size="large" wrap>
                  {SURFACE_STATS[surface].map((stat) => (
                    <Statistic
                      key={stat.label}
                      title={stat.label}
                      value={stat.value}
                      valueStyle={{ color: token.colorPrimary }}
                    />
                  ))}
                </Space>
              </Space>
            </Card>
          </Space>
          <TokenPlayground mode={mode} onModeChange={setMode} accent={accent} onAccentChange={setAccent} />
          <FeatureGrid />
          <ExperienceShowcase />
          <Architecture />
          <Showcase />
          <CallToAction />
        </div>
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
  useLenisScroll()

  return (
    <ConfigProvider theme={themeConfig}>
      <AppShell mode={mode} setMode={setMode} accent={accent} setAccent={setAccent} />
    </ConfigProvider>
  )
}

export default App
