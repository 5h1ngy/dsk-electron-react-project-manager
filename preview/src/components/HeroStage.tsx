import { Card, Col, Flex, Row, theme } from 'antd'
import { useMemo, type ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { FALLBACK_LANGUAGE_LABELS, SUPPORTED_LANGUAGES, isSupportedLanguage } from '../i18n/language'
import type { SupportedLanguage } from '../i18n/language'
import type { ControlCopy, GalleryContent, HeroContent, LanguageOption } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'
import { darken, lighten, transparentize } from '../theme/utils'

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

  const layeredBackground = useMemo(() => {
    const base = mode === 'dark' ? token.colorBgBase : token.colorBgContainer
    const overlay =
      mode === 'dark' ? darken(token.colorBgElevated, 0.12) : lighten(token.colorBgElevated, 0.12)
    const accentGlow = mode === 'dark' ? darken(accent, 0.12) : lighten(accent, 0.3)
    const accentMist = mode === 'dark' ? darken(accent, 0.2) : lighten(accent, 0.45)
    const gridColor =
      mode === 'dark'
        ? transparentize(token.colorTextLightSolid ?? '#ffffff', 0.08)
        : transparentize(token.colorTextBase, 0.04)
    const gridAngle = mode === 'dark' ? 125 : 120
    const gridEnd = mode === 'dark' ? 18 : 16
    const gridTint = `repeating-linear-gradient(${gridAngle}deg, ${gridColor}, ${gridColor} 2px, transparent 2px, transparent ${gridEnd}px)`
    return `
      radial-gradient(circle at 18% 28%, ${accentGlow}, transparent 55%),
      radial-gradient(circle at 82% 8%, ${accentMist}, transparent 50%),
      ${gridTint},
      linear-gradient(135deg, ${base} 0%, ${overlay} 100%)`
  }, [
    accent,
    mode,
    token.colorBgBase,
    token.colorBgContainer,
    token.colorBgElevated,
    token.colorTextBase,
    token.colorTextLightSolid
  ])

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
        backgroundImage: layeredBackground,
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
            <HeroMockupCard accent={accent} mode={mode} gallery={galleryContent} />
          </Col>
        </Row>
        <Flex justify="flex-end" style={{ width: '100%' }}>
          <Flex
            style={{
              background:
                mode === 'dark'
                  ? darken(token.colorBgElevated, 0.15)
                  : lighten(token.colorBgElevated, 0.05),
              borderRadius: token.borderRadiusOuter * 2,
              padding: `${token.padding}px ${token.paddingXL}px`,
              border: `1px solid ${
                mode === 'dark' ? token.colorBorder : token.colorBorderSecondary
              }`,
              backdropFilter: 'blur(12px)',
              boxShadow: mode === 'dark' ? token.boxShadowSecondary : token.boxShadow
            }}
          >
            <HeroControls
              accent={accent}
              setAccent={setAccent}
              mode={mode}
              toggleMode={toggleMode}
              controlsCopy={controlsCopy}
            />
          </Flex>
        </Flex>
      </Flex>
    </Card>
  )
}
