import { Card, Col, Flex, Row, theme } from 'antd'
import { useMemo, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FALLBACK_LANGUAGE_LABELS, SUPPORTED_LANGUAGES, isSupportedLanguage } from '../i18n/language'
import type { SupportedLanguage } from '../i18n/language'
import type { ControlCopy, HeroContent, LanguageOption } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'
import { useSurfacePalette } from '../hooks/useSurfacePalette'

import { HeroControls } from './HeroControls'
import { HeroHeadline } from './HeroHeadline'
import { HeroMockupCard } from './HeroMockupCard'
import { LanguageSwitcher } from './LanguageSwitcher'

interface HeroStageProps {
  accent: string
  mode: ThemeMode
  onModeChange: (value: ThemeMode) => void
  setAccent: (value: string) => void
  language: SupportedLanguage
  onLanguageChange: (value: SupportedLanguage) => void
}

export const HeroStage = ({
  accent,
  mode,
  onModeChange,
  setAccent,
  language,
  onLanguageChange
}: HeroStageProps): ReactElement => {
  const { token } = theme.useToken()
  const { t } = useTranslation()
  const surfaces = useSurfacePalette(mode, accent)

  const heroContent = useMemo(
    () => t('hero', { returnObjects: true, lng: language }) as HeroContent,
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

  const gridGutter: [number, number] = [
    token.marginXXXL + token.margin,
    token.marginXXXL + token.margin
  ]

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
        backgroundImage: surfaces.heroBackdrop,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        boxShadow: mode === 'dark' ? token.boxShadowSecondary : token.boxShadow
      }}
      bodyStyle={{ padding: `${token.paddingXL * 2}px ${token.paddingXL * 2.5}px` }}
    >
      <Flex
        style={{
          position: 'absolute',
          top: token.marginXL,
          right: token.marginXL,
          zIndex: 2
        }}
      >
        <LanguageSwitcher
          language={language}
          options={languageOptions}
          label={controlsCopy.languageLabel}
          onChange={onLanguageChange}
        />
      </Flex>
      <Flex
        vertical
        gap={token.marginXL}
        justify="space-between"
        style={{ width: '100%', minHeight: '100%' }}
      >
        <Row align="middle" gutter={gridGutter} style={{ minHeight: '100%', width: '100%' }}>
          <Col xs={24} lg={9}>
            <HeroHeadline accent={accent} content={heroContent} />
          </Col>
          <Col xs={24} lg={15} style={{ overflow: 'visible' }}>
            <HeroMockupCard
              accent={accent}
              mode={mode}
              heroShot={heroContent.heroShot}
              title={heroContent.title}
            />
          </Col>
        </Row>
        <Flex justify="flex-end" style={{ width: '100%' }}>
          <Flex
            style={{
              background: surfaces.trayBackground,
              borderRadius: token.borderRadiusOuter * 2,
              padding: `${token.padding}px ${token.paddingXL}px`,
              border: `1px solid ${surfaces.trayBorder}`,
              backdropFilter: 'blur(12px)',
              boxShadow: surfaces.trayShadow
            }}
          >
            <HeroControls
              accent={accent}
              setAccent={setAccent}
              mode={mode}
              onModeChange={onModeChange}
              controlsCopy={controlsCopy}
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
