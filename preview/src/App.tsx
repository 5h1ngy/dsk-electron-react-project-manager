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
import { buildSurfacePalette } from './theme/surfaces'

const { Content } = Layout
const DEFAULT_ACCENT = ACCENT_OPTIONS[0]

interface AppShellProps {
  mode: ThemeMode
  onModeChange: (value: ThemeMode) => void
  accent: string
  setAccent: (value: string) => void
  language: SupportedLanguage
  setLanguage: (value: SupportedLanguage) => void
}

const AppShell = ({
  mode,
  onModeChange,
  accent,
  setAccent,
  language,
  setLanguage
}: AppShellProps): ReactElement => {
  const { token } = antdTheme.useToken()
  const contentRef = useRef<HTMLDivElement>(null)
  useGlobalAnimations()
  const surfaces = useMemo(() => buildSurfacePalette(token, mode, accent), [token, mode, accent])

  useLayoutEffect(() => {
    document.body.style.background = surfaces.pageSolid
    document.body.style.color = mode === 'dark' ? token.colorTextLightSolid ?? '#f8fafc' : token.colorTextBase
    document.body.style.backgroundAttachment = 'fixed'
    document.body.style.fontFamily =
      token.fontFamily ?? 'Inter, "SF Pro Display", "Segoe UI", system-ui, sans-serif'
  }, [token.fontFamily, mode, token.colorTextBase, token.colorTextLightSolid, surfaces.pageSolid])

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
    <Layout
      style={{
        minHeight: '100vh',
        background: surfaces.pageSolid,
        transition: 'background 0.4s ease'
      }}
    >
      <Content style={{ width: '100%', padding: 0, overflow: 'hidden' }}>
        <Flex
          ref={contentRef}
          vertical
          gap={token.marginXL}
          style={{
            minHeight: '100vh',
            padding: `${token.paddingXL * 1.5}px ${token.paddingXL}px`,
            boxSizing: 'border-box'
          }}
        >
          <HeroStage
            mode={mode}
            accent={accent}
            onModeChange={onModeChange}
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
        onModeChange={(value) => setMode(value)}
        accent={accent}
        setAccent={setAccent}
        language={language}
        setLanguage={setLanguage}
      />
    </ConfigProvider>
  )
}

export default App
