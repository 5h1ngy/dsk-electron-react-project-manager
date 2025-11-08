import { Card, Col, Flex, Row, theme } from 'antd'
import { useMemo, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FALLBACK_LANGUAGE_LABELS, SUPPORTED_LANGUAGES, isSupportedLanguage } from '../i18n/language'
import type { SupportedLanguage } from '../i18n/language'
import type { ControlCopy, GalleryContent, HeroContent, LanguageOption } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'

import { HeroControls } from './HeroControls'
import { HeroHeadline } from './HeroHeadline'
import { HeroMockupCard } from './HeroMockupCard'
import { LanguageSwitcher } from './LanguageSwitcher'

interface HeroStageProps {
  accent: string
  mode: ThemeMode
  toggleMode: () => void
  setAccent: (value: string) => void
  language: SupportedLanguage
  onLanguageChange: (value: SupportedLanguage) => void
}

export const HeroStage = ({
  accent,
  mode,
  toggleMode,
  setAccent,
  language,
  onLanguageChange
}: HeroStageProps): ReactElement => {
  const { token } = theme.useToken()
  const { t } = useTranslation()

  const heroContent = useMemo(
    () => t('hero', { returnObjects: true, lng: language }) as HeroContent,
    [t, language]
  )
  const galleryContent = useMemo(
    () => t('gallery', { returnObjects: true, lng: language }) as GalleryContent,
    [t, language]
  )
  const controlsCopy = useMemo(
    () => t('controls', { returnObjects: true, lng: language }) as ControlCopy,
    [t, language]
  )
  const rawLanguageOptions = useMemo(
    () => t('languages', { returnObjects: true, lng: language }) as Array<{ label: string; value: string }>,
    [t, language]
  )

  const fallbackLanguageOptions = useMemo<LanguageOption[]>(
    () =>
      SUPPORTED_LANGUAGES.map((value) => ({
        value,
        label: FALLBACK_LANGUAGE_LABELS[value]
      })),
    []
  )

  const languageOptions = useMemo<LanguageOption[]>(() => {
    const normalized = rawLanguageOptions.filter((option): option is LanguageOption =>
      isSupportedLanguage(option.value)
    )
    return normalized.length ? normalized : fallbackLanguageOptions
  }, [rawLanguageOptions, fallbackLanguageOptions])

  const layeredBackground = useMemo(
    () =>
      mode === 'light'
        ? `radial-gradient(circle at 15% 25%, ${accent}24, transparent 45%),
           radial-gradient(circle at 90% 0%, ${accent}20, transparent 55%),
           repeating-linear-gradient(120deg, rgba(15,23,42,0.05), rgba(15,23,42,0.05) 2px, transparent 2px, transparent 16px),
           linear-gradient(135deg, #eef2ff 0%, #ffffff 55%, #e9ecff 100%)`
        : `radial-gradient(circle at 20% 20%, ${accent}33, transparent 52%),
           radial-gradient(circle at 80% 0%, ${accent}29, transparent 48%),
           repeating-linear-gradient(125deg, rgba(148,163,184,0.12), rgba(148,163,184,0.12) 2px, transparent 2px, transparent 18px),
           linear-gradient(130deg, #040814 0%, #050b1b 50%, #020307 100%)`,
    [accent, mode]
  )

  return (
    <Card
      data-motion="hero"
      bordered={false}
      style={{
        minHeight: '90vh',
        borderRadius: token.borderRadiusXL,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: layeredBackground,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        boxShadow: mode === 'dark' ? '0 0 140px rgba(0,0,0,0.4)' : '0 0 80px rgba(15,23,42,0.15)'
      }}
      bodyStyle={{ padding: `${token.paddingXL * 2}px ${token.paddingXL * 2.5}px` }}
    >
      <div
        style={{
          position: 'absolute',
          top: token.marginXL * 0.5,
          right: token.marginXL * 0.5,
          zIndex: 2
        }}
      >
        <LanguageSwitcher
          language={language}
          options={languageOptions}
          label={controlsCopy.languageLabel}
          onChange={onLanguageChange}
        />
      </div>
      <Flex
        vertical
        gap={token.marginXL}
        justify="space-between"
        style={{ width: '100%', minHeight: '100%' }}
      >
        <Row align="middle" gutter={[48, 48]} style={{ minHeight: '100%', width: '100%' }}>
          <Col xs={24} lg={9}>
            <HeroHeadline accent={accent} content={heroContent} />
          </Col>
          <Col xs={24} lg={15} style={{ overflow: 'visible' }}>
            <HeroMockupCard accent={accent} mode={mode} gallery={galleryContent} />
          </Col>
        </Row>
        <Flex justify="flex-end" style={{ width: '100%' }}>
          <div
            style={{
              background: mode === 'dark' ? 'rgba(4,6,18,0.85)' : 'rgba(255,255,255,0.9)',
              borderRadius: 999,
              padding: '12px 20px',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
              backdropFilter: 'blur(12px)',
              boxShadow:
                mode === 'dark'
                  ? '0 25px 60px rgba(0,0,0,0.35)'
                  : '0 15px 40px rgba(15,23,42,0.2)'
            }}
          >
            <HeroControls
              accent={accent}
              setAccent={setAccent}
              mode={mode}
              toggleMode={toggleMode}
              controlsCopy={controlsCopy}
            />
          </div>
        </Flex>
      </Flex>
    </Card>
  )
}
