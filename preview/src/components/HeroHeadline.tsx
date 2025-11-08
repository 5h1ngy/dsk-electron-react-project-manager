import { DownloadOutlined, GithubOutlined } from '@ant-design/icons'
import { Button, Space, Tag, Typography, theme } from 'antd'
import { useRef, type ReactElement } from 'react'

import { useHeroIntroMotion } from '../hooks/useHeroIntroMotion'
import type { HeroContent } from '../types/content'

import { HeroStatsGrid } from './HeroStatsGrid'

interface HeroHeadlineProps {
  accent: string
  content: HeroContent
}

export const HeroHeadline = ({ accent, content }: HeroHeadlineProps): ReactElement => {
  const { token } = theme.useToken()
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  useHeroIntroMotion(titleRef, descriptionRef)
  const stackSpacing = token.marginXXL
  const eyebrowPadding = `${token.paddingXS}px ${token.paddingLG}px`
  const displaySize = token.fontSizeHeading1 * 2.25
  const paragraphSize = token.fontSizeHeading4
  const actionsGap = token.marginLG
  const descriptionWidth = token.sizeUnit * 130

  return (
    <Space direction="vertical" size={stackSpacing} style={{ width: '100%' }}>
      <Tag
        style={{
          borderRadius: token.borderRadiusOuter,
          padding: eyebrowPadding,
          fontWeight: 600,
          letterSpacing: token.sizeUnit / 2,
          borderColor: accent,
          color: accent
        }}
      >
        {content.eyebrow}
      </Tag>
      <Typography.Title
        level={1}
        ref={titleRef}
        style={{
          color: token.colorTextBase,
          fontSize: displaySize,
          marginBottom: 0,
          lineHeight: token.lineHeightHeading1 * 1.2
        }}
      >
        {content.title}
      </Typography.Title>
      <Typography.Paragraph
        ref={descriptionRef}
        style={{
          color: token.colorTextSecondary,
          fontSize: paragraphSize,
          maxWidth: descriptionWidth,
          marginBottom: token.marginSM
        }}
      >
        {content.description}
      </Typography.Paragraph>
      <Space size={actionsGap} wrap>
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          style={{ minWidth: token.paddingXL * 9 }}
          href={content.primaryCta.href}
          target="_blank"
          rel="noreferrer"
        >
          {content.primaryCta.label}
        </Button>
        <Button
          size="large"
          icon={<GithubOutlined />}
          href={content.secondaryCta.href}
          target="_blank"
          rel="noreferrer"
        >
          {content.secondaryCta.label}
        </Button>
      </Space>
      <HeroStatsGrid accent={accent} stats={content.stats} />
    </Space>
  )
}
