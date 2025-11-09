import { Card, Flex, Typography, theme } from 'antd'
import type { ReactElement } from 'react'

import type { HeroStat } from '../types/content'

interface HeroStatsGridProps {
  accent: string
  stats: HeroStat[]
}

export const HeroStatsGrid = ({ accent, stats }: HeroStatsGridProps): ReactElement => {
  const { token } = theme.useToken()
  const badgeSize = token.sizeUnit * 4

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      {stats.map((stat) => (
        <Card
          key={stat.label}
          bordered={false}
          style={{
            borderRadius: token.borderRadiusLG,
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            boxShadow: token.boxShadow,
            transition: 'transform 0.25s ease',
            transformOrigin: 'left center'
          }}
          bodyStyle={{ padding: token.paddingLG }}
          hoverable
        >
          <Flex align="center" gap={token.margin} wrap>
            <span
              aria-hidden
              style={{
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize,
                background: accent,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: token.boxShadowSecondary
              }}
            >
              <span
                style={{
                  width: badgeSize / 2,
                  height: badgeSize / 2,
                  borderRadius: '50%',
                  background: token.colorBgContainer
                }}
              />
            </span>
            <Typography.Text
              style={{
                textTransform: 'uppercase',
                letterSpacing: token.sizeUnit * 0.3,
                fontSize: token.fontSizeSM,
                color: token.colorTextSecondary
              }}
            >
              {stat.label}
            </Typography.Text>
          </Flex>
          <Typography.Title
            level={3}
            style={{
              marginTop: token.marginSM,
              marginBottom: 0,
              color: token.colorTextBase,
              fontWeight: 600
            }}
          >
            {stat.value}
          </Typography.Title>
        </Card>
      ))}
    </Flex>
  )
}
