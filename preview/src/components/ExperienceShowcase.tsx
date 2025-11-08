import { Card, Col, Image, Row, Space, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { useRef } from 'react'
import { experienceDeck } from '../data/site'
import { useBlurOnScroll } from '../hooks/useBlurOnScroll'

interface ExperienceShowcaseProps {
  accent: string
}

export const ExperienceShowcase: FC<ExperienceShowcaseProps> = ({ accent }) => {
  const { token } = theme.useToken()
  const headingRef = useRef<HTMLHeadingElement>(null)
  useBlurOnScroll(headingRef)
  const isDark = token.colorBgBase === '#040614'

  return (
    <Card
      data-motion="showcase"
      bordered={false}
      style={{ background: 'transparent', marginTop: token.marginXXL * 2 }}
      bodyStyle={{ padding: 0 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title
          ref={headingRef}
          level={2}
          style={{
            color: accent,
            marginBottom: token.margin,
            textAlign: 'center',
            fontSize: 56,
            letterSpacing: 1.3
          }}
        >
          Delivery tapestries
        </Typography.Title>
        <Space direction="vertical" size={token.marginXL} style={{ width: '100%' }}>
          {experienceDeck.map((experience, index) => {
            const isEven = index % 2 === 0
            const imageShift = isEven ? '10%' : '-10%'

            return (
              <div
                key={experience.title}
                style={{
                  borderRadius: token.borderRadiusXXL * 2,
                  border: `1px solid ${accent}33`,
                  background: isDark ? 'rgba(6,9,20,0.72)' : 'rgba(255,255,255,0.9)',
                  boxShadow: `0 40px 90px rgba(15,23,42,0.35)`,
                  padding: `${token.paddingLG}px ${token.paddingXL}px`,
                  backdropFilter: 'blur(20px)',
                  overflow: 'visible'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    flexDirection: isEven ? 'row' : 'row-reverse',
                    gap: token.marginXL,
                    minHeight: 280
                  }}
                >
                  <div
                    style={{
                      flex: '1 1 320px',
                      padding: `${token.paddingSM}px ${token.paddingLG}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: token.marginSM,
                      alignItems: 'flex-start'
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
                      {experience.badge}
                    </Tag>
                    <Typography.Title level={3} style={{ marginBottom: 0, color: accent }}>
                      {experience.title}
                    </Typography.Title>
                    <Typography.Paragraph style={{ color: token.colorTextSecondary, marginBottom: 0 }}>
                      {experience.summary}
                    </Typography.Paragraph>
                    <Space wrap>
                      {experience.highlights.map((highlight) => (
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
                    </Space>
                  </div>
                  <div style={{ flex: '1 1 360px', display: 'flex', justifyContent: 'center' }}>
                    <Card
                      bordered={false}
                      style={{
                        borderRadius: token.borderRadiusXXL,
                        background: 'transparent',
                        boxShadow: modeAwareShadow(token.colorBgBase)
                      }}
                      bodyStyle={{
                        padding: token.padding,
                        display: 'flex',
                        justifyContent: 'center',
                        overflow: 'visible'
                      }}
                    >
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        preview={false}
                        style={{
                          borderRadius: token.borderRadiusLG,
                          width: '120%',
                          maxWidth: 'none',
                          transform: `translateX(${imageShift})`,
                          boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
                        }}
                      />
                    </Card>
                  </div>
                </div>
              </div>
            )
          })}
        </Space>
      </Space>
    </Card>
  )
}

const modeAwareShadow = (colorBgBase: string) =>
  `0 30px 80px rgba(15,23,42,${colorBgBase === '#040614' ? '0.45' : '0.18'})`
