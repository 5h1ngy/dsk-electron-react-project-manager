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

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Tag
        style={{
          borderRadius: 999,
          padding: '6px 18px',
          fontWeight: 600,
          letterSpacing: 1,
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
          fontSize: 72,
          marginBottom: 0,
          lineHeight: 1
        }}
      >
        {content.title}
      </Typography.Title>
      <Typography.Paragraph
        ref={descriptionRef}
        style={{
          color: token.colorTextSecondary,
          fontSize: 18,
          maxWidth: 520,
          marginBottom: token.marginSM
        }}
      >
        {content.description}
      </Typography.Paragraph>
      <Space size="large" wrap>
        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          style={{ minWidth: 180 }}
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
