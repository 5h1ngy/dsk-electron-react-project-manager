import { Card, Col, Flex, Row, Typography, theme } from 'antd'
import { useState, type ReactElement } from 'react'

import type { HeroStat } from '../types/content'

interface HeroStatsGridProps {
  accent: string
  stats: HeroStat[]
}

export const HeroStatsGrid = ({ accent, stats }: HeroStatsGridProps): ReactElement => {
  const { token } = theme.useToken()
  const badgeSize = token.sizeUnit * 4
  const gutter: [number, number] = [token.marginLG, token.marginLG]
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const accentShadowHex = accent.startsWith('#') && accent.length === 7 ? `${accent}55` : accent
  const hoverShadow = `0 ${token.sizeUnit * 4}px ${token.sizeUnit * 12}px ${accentShadowHex}`
  const cardMinHeight = token.sizeUnit * 38
  const cardPadding = token.paddingLG
  const labelSpacing = token.sizeUnit * 0.3
  const cardGap = token.marginLG

  return (
    <Row gutter={gutter} style={{ width: '100%' }}>
      {stats.map((stat) => {
        const valueItems = stat.value
          .split('/')
          .map((item) => item.trim())
          .filter(Boolean)
        const showValueList = valueItems.length > 1

        return (
          <Col key={stat.label} xs={24} sm={12} xl={8} style={{ display: 'flex' }}>
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG,
                background: token.colorBgContainer,
                border: `1px solid ${hoveredStat === stat.label ? accent : token.colorBorderSecondary}`,
                boxShadow: hoveredStat === stat.label ? hoverShadow : token.boxShadow,
                transition: 'transform 0.25s ease, opacity 0.25s ease',
                transformOrigin: 'left center',
                width: '100%',
                transform: hoveredStat === stat.label ? 'translateY(-6px)' : 'translateY(0)',
                opacity: hoveredStat === stat.label ? 0.75 : 1,
                minHeight: cardMinHeight,
                display: 'flex'
              }}
              bodyStyle={{ padding: cardPadding, width: '100%' }}
              hoverable
              onMouseEnter={() => setHoveredStat(stat.label)}
              onMouseLeave={() => setHoveredStat(null)}
            >
              <Flex vertical justify="space-between" gap={cardGap} style={{ width: '100%' }}>
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
                      letterSpacing: labelSpacing,
                      fontSize: token.fontSizeSM,
                      color: token.colorTextSecondary,
                      fontWeight: 600
                    }}
                  >
                    {stat.label}
                  </Typography.Text>
                </Flex>
                {showValueList ? (
                  <Flex vertical gap={token.marginXS}>
                    {valueItems.map((valueItem) => (
                      <Typography.Title
                        key={valueItem}
                        level={3}
                        style={{
                          margin: 0,
                          color: token.colorTextBase,
                          fontWeight: 600,
                          fontSize: token.fontSizeHeading4 * 1.05,
                          lineHeight: 1.15
                        }}
                      >
                        {valueItem}
                      </Typography.Title>
                    ))}
                  </Flex>
                ) : (
                  <Typography.Title
                    level={2}
                    style={{
                      margin: 0,
                      color: token.colorTextBase,
                      fontWeight: 600,
                      fontSize: token.fontSizeHeading2 * 0.9,
                      lineHeight: 1.1
                    }}
                  >
                    {stat.value}
                  </Typography.Title>
                )}
              </Flex>
            </Card>
          </Col>
        )
      })}
    </Row>
  )
}
