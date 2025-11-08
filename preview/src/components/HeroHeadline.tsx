/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ArrowRightOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, Space, Tag, Typography, theme } from 'antd'
import { useRef } from 'react'
import { heroContent } from '../data/site'
import { HeroStatsGrid } from './HeroStatsGrid'
import { useHeroIntroMotion } from '../hooks/useHeroIntroMotion'

interface HeroHeadlineProps {
  accent: string
}

export const HeroHeadline = ({ accent }: HeroHeadlineProps) => {
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
        {heroContent.eyebrow}
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
        {heroContent.title}
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
        {heroContent.description}
      </Typography.Paragraph>
      <Space size="large" wrap>
        <Button type="primary" size="large" icon={<DownloadOutlined />} style={{ minWidth: 180 }}>
          {heroContent.primaryCta}
        </Button>
        <Button size="large" icon={<ArrowRightOutlined />} ghost>
          {heroContent.secondaryCta}
        </Button>
      </Space>
      <HeroStatsGrid accent={accent} />
    </Space>
  )
}
