import { ConfigProvider, Flex, Layout, theme as antdTheme } from 'antd'
import gsap from 'gsap'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { HeroStage } from './components/HeroStage'
import { getLanguageFromUrl, resolveInitialLanguage, syncLanguageQueryParam } from './i18n/language'
import type { SupportedLanguage } from './i18n/language'
import { useGlobalAnimations } from './hooks/useGlobalAnimations'
import { useLenisScroll } from './hooks/useLenisScroll'
import { ACCENT_OPTIONS, createThemeConfig } from './theme'
import type { ThemeMode } from './theme/foundations/palette'

const { Content } = Layout
const DEFAULT_ACCENT = ACCENT_OPTIONS[0]

interface AppShellProps {
  mode: ThemeMode
  toggleMode: () => void
  accent: string
  setAccent: (value: string) => void
  language: SupportedLanguage
  setLanguage: (value: SupportedLanguage) => void
}

const AppShell = ({
  mode,
  toggleMode,
  accent,
  setAccent,
  language,
  setLanguage
}: AppShellProps): ReactElement => {
  const { token } = antdTheme.useToken()
  const contentRef = useRef<HTMLDivElement>(null)
  useGlobalAnimations()

  useLayoutEffect(() => {
    document.body.style.background =
      mode === 'dark'
        ? `radial-gradient(circle at 10% 20%, ${accent}1a, transparent 50%),
           radial-gradient(circle at 90% 0%, ${accent}14, transparent 40%),
           linear-gradient(135deg, #020412, #050b1a 55%, #010106)`
        : `radial-gradient(circle at 15% 25%, ${accent}26, transparent 45%),
           radial-gradient(circle at 85% 10%, ${accent}1f, transparent 45%),
           linear-gradient(135deg, #f0f4ff, #ffffff 55%, #eef1ff)`
    document.body.style.color = mode === 'dark' ? '#f8fafc' : '#0f172a'
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.fontFamily =
      token.fontFamily ?? 'Inter, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
  }, [token.fontFamily, mode, accent])

  useLayoutEffect(() => {
    if (!contentRef.current) return
    const ctx = gsap.context(() => {
      const ids = ['hero']
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
      <Content style={{ width: '100%', padding: 0, overflow: 'hidden' }}>
        <Flex
          ref={contentRef}
          vertical
          gap={token.marginXXL}
          style={{
            minHeight: '100vh',
            padding: `${token.paddingXL * 2}px ${token.paddingXL * 1.5}px`,
            boxSizing: 'border-box'
          }}
        >
          <HeroStage
            mode={mode}
            accent={accent}
            toggleMode={toggleMode}
            setAccent={setAccent}
            language={language}
            onLanguageChange={setLanguage}
          />
        </Flex>
      </Content>
    </Layout>
  )
}

const App = (): ReactElement => {
  const { i18n } = useTranslation()
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [accent, setAccent] = useState<string>(DEFAULT_ACCENT)
  const [language, setLanguage] = useState<SupportedLanguage>(() =>
    resolveInitialLanguage(i18n.language)
  )
  const themeConfig = useMemo(() => createThemeConfig(mode, accent), [mode, accent])

  useLenisScroll()

  useEffect(() => {
    if (language !== i18n.language) {
      void i18n.changeLanguage(language)
    }
  }, [language, i18n])

  useEffect(() => {
    syncLanguageQueryParam(language)
  }, [language])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    const handlePopstate = () => {
      const nextLanguage = getLanguageFromUrl()
      if (nextLanguage && nextLanguage !== language) {
        setLanguage(nextLanguage)
      }
    }
    window.addEventListener('popstate', handlePopstate)
    return () => window.removeEventListener('popstate', handlePopstate)
  }, [language])

  return (
    <ConfigProvider theme={themeConfig}>
      <AppShell
        mode={mode}
        toggleMode={() => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        accent={accent}
        setAccent={setAccent}
        language={language}
        setLanguage={setLanguage}
      />
    </ConfigProvider>
  )
}

export default App
