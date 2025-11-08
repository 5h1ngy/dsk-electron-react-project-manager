import { Card, Flex, Typography, theme } from 'antd'
import { useState, type ReactElement } from 'react'

import type { HeroStat } from '../types/content'
import { darken, lighten } from '../theme/utils'

interface HeroStatsGridProps {
  accent: string
  stats: HeroStat[]
}

export const HeroStatsGrid = ({ accent, stats }: HeroStatsGridProps): ReactElement => {
  const { token } = theme.useToken()
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const surfaceTextInverse = token.colorTextLightSolid ?? '#ffffff'
  const flexBasis = `${token.sizeUnit * 55}px`
  const hoverOffset = token.marginXS

  return (
    <Flex wrap gap={token.margin} style={{ width: '100%' }}>
      {stats.map((stat) => {
        const active = activeCard === stat.label
        const gradientStart = lighten(accent, 0.2)
        const gradientEnd = darken(accent, 0.1)
        return (
          <Card
            key={stat.label}
            bordered={false}
            hoverable
            onMouseEnter={() => setActiveCard(stat.label)}
            onMouseLeave={() => setActiveCard(null)}
            style={{
              flex: `1 1 ${flexBasis}`,
              borderRadius: token.borderRadiusLG,
              background: active
                ? `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})`
                : token.colorBgElevated,
              border: `1px solid ${active ? accent : token.colorBorderSecondary}`,
              boxShadow: active ? token.boxShadowSecondary : token.boxShadow,
              transform: active ? `translateY(-${hoverOffset}px) scale(1.02)` : 'translateY(0)',
              transition:
                'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, background 0.3s ease'
            }}
            bodyStyle={{ padding: token.paddingLG }}
          >
            <Typography.Text
              style={{
                textTransform: 'uppercase',
                letterSpacing: token.sizeUnit * 0.3,
                fontSize: token.fontSizeSM,
                color: active ? surfaceTextInverse : token.colorTextSecondary
              }}
            >
              {stat.label}
            </Typography.Text>
            <Typography.Title
              level={4}
              style={{ marginBottom: 0, color: active ? surfaceTextInverse : token.colorTextBase }}
            >
              {stat.value}
            </Typography.Title>
          </Card>
        )
      })}
    </Flex>
  )
}
