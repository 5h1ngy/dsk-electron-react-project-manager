/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Card, Flex, Typography, theme } from 'antd'
import { useState } from 'react'
import { heroContent } from '../data/site'

interface HeroStatsGridProps {
  accent: string
}

export const HeroStatsGrid = ({ accent }: HeroStatsGridProps) => {
  const { token } = theme.useToken()
  const [activeCard, setActiveCard] = useState<string | null>(null)

  return (
    <Flex wrap gap={token.margin} style={{ width: '100%' }}>
      {heroContent.stats.map((stat) => {
        const active = activeCard === stat.label
        return (
          <Card
            key={stat.label}
            bordered={false}
            hoverable
            onMouseEnter={() => setActiveCard(stat.label)}
            onMouseLeave={() => setActiveCard(null)}
            style={{
              flex: '1 1 220px',
              borderRadius: token.borderRadiusLG,
              background: active
                ? `linear-gradient(135deg, ${accent}cc, ${accent}7d)`
                : token.colorBgElevated,
              border: active ? `1px solid ${accent}` : `1px solid ${token.colorBorderSecondary}`,
              boxShadow: active
                ? `0 20px 50px ${accent}4d`
                : '0 20px 40px rgba(0,0,0,0.15)',
              transform: active ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
              transition:
                'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, background 0.3s ease'
            }}
            bodyStyle={{ padding: token.paddingLG }}
          >
            <Typography.Text
              style={{
                textTransform: 'uppercase',
                letterSpacing: 1.2,
                fontSize: 12,
                color: active ? '#fff' : token.colorTextSecondary
              }}
            >
              {stat.label}
            </Typography.Text>
            <Typography.Title
              level={4}
              style={{ marginBottom: 0, color: active ? '#fff' : token.colorTextBase }}
            >
              {stat.value}
            </Typography.Title>
          </Card>
        )
      })}
    </Flex>
  )
}
