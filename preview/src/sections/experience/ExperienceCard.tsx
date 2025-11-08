import { Card, Flex, Image, Tag, Typography, theme } from 'antd'
import { useState } from 'react'
import type { ExperienceDeckEntry } from '../../types/experience'

interface ExperienceCardProps {
  accent: string
  entry: ExperienceDeckEntry
  reverse?: boolean
}

export const ExperienceCard = ({ accent, entry, reverse = false }: ExperienceCardProps) => {
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)
  const isDark = token.colorBgBase === '#040614'

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: token.borderRadiusXXL * 2,
        border: `1px solid ${accent}40`,
        background: isDark
          ? 'linear-gradient(145deg, rgba(6,9,20,0.95), rgba(3,4,12,0.9))'
          : 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(236,240,255,0.92))',
        boxShadow: '0 40px 90px rgba(15,23,42,0.35)'
      }}
      bodyStyle={{ padding: `${token.paddingLG}px ${token.paddingXL}px` }}
    >
      <Flex
        wrap
        align="center"
        gap={token.marginXL}
        style={{
          flexDirection: reverse ? 'row-reverse' : 'row',
          minHeight: 260,
          width: '100%'
        }}
      >
        <Flex
          vertical
          gap={token.marginSM}
          style={{
            flex: '1 1 320px',
            padding: `${token.paddingSM}px ${token.paddingXL}px`,
            textAlign: reverse ? 'right' : 'left',
            alignItems: reverse ? 'flex-end' : 'flex-start'
          }}
        >
          <Tag
            bordered={false}
            style={{
              borderColor: accent,
              color: accent,
              background: `${accent}20`
            }}
          >
            {entry.badge}
          </Tag>
          <Typography.Title level={3} style={{ marginBottom: 0, color: accent }}>
            {entry.title}
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary, marginBottom: 0 }}>
            {entry.summary}
          </Typography.Paragraph>
          <Flex wrap gap={token.marginXS} justify={reverse ? 'flex-end' : 'flex-start'}>
            {entry.highlights.map((highlight) => (
              <Tag
                key={highlight}
                bordered={false}
                style={{
                  background: token.colorBgElevated,
                  color: token.colorTextBase,
                  borderRadius: 999,
                  padding: '4px 12px'
                }}
              >
                {highlight}
              </Tag>
            ))}
          </Flex>
        </Flex>
        <Flex
          style={{
            flex: '1 1 360px',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <Card
            bordered={false}
            style={{
              borderRadius: token.borderRadiusXXL * 1.2,
              background: 'transparent',
              boxShadow: '0 30px 80px rgba(0,0,0,0.4)',
              transform: hovered ? 'translateY(-12px) rotateX(2deg)' : 'translateY(0)',
              transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)'
            }}
            bodyStyle={{ padding: token.padding, overflow: 'visible' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Image
              src={entry.image}
              alt={entry.title}
              preview={false}
              style={{
                borderRadius: token.borderRadiusLG,
                width: '130%',
                maxWidth: 'none',
                transform: `translateX(${reverse ? '-12%' : '12%'})`,
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
              }}
            />
          </Card>
        </Flex>
      </Flex>
    </Card>
  )
}
