import { Card, Col, Image, Row, Space, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { useRef } from 'react'
import gsap from 'gsap'
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
  const imageRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const animateImage = (key: string, enter: boolean) => {
    const node = imageRefs.current[key]
    if (!node) return
    gsap.to(node, {
      y: enter ? -12 : 0,
      rotateX: enter ? 2 : 0,
      duration: enter ? 0.5 : 0.4,
      ease: enter ? 'elastic.out(1, 0.5)' : 'power3.inOut'
    })
  }

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
            const imageShift = isEven ? '12%' : '-12%'
            const textAlign = isEven ? 'left' : 'right'
            const alignItems = isEven ? 'flex-start' : 'flex-end'
            const alignSelfValue = isEven ? 'flex-start' : 'flex-end'

            return (
              <Card
                key={experience.title}
                bordered={false}
                style={{
                  borderRadius: token.borderRadiusXXL * 2,
                  border: `1px solid ${accent}33`,
                  background: isDark
                    ? `linear-gradient(140deg, rgba(6,9,20,0.95), rgba(3,4,12,0.9))`
                    : `linear-gradient(140deg, rgba(255,255,255,0.95), rgba(235,240,255,0.92))`,
                  boxShadow: `0 40px 90px rgba(15,23,42,0.35)`,
                  overflow: 'visible'
                }}
                bodyStyle={{
                  padding: `${token.paddingLG}px ${token.paddingXL}px`,
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
                    minHeight: 260
                  }}
                >
                  <div
                    style={{
                      flex: '1 1 320px',
                      padding: `${token.paddingSM}px ${token.paddingXL}px`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: token.marginSM,
                      alignItems,
                      textAlign
                    }}
                  >
                    <Tag
                      bordered={false}
                      style={{
                        borderColor: accent,
                        color: accent,
                        background: `${accent}20`,
                        alignSelf: alignSelfValue
                      }}
                    >
                      {experience.badge}
                    </Tag>
                    <Typography.Title level={3} style={{ marginBottom: 0, color: accent, width: '100%' }}>
                      {experience.title}
                    </Typography.Title>
                    <Typography.Paragraph
                      style={{ color: token.colorTextSecondary, marginBottom: 0, width: '100%' }}
                    >
                      {experience.summary}
                    </Typography.Paragraph>
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: token.marginXS,
                        justifyContent: isEven ? 'flex-start' : 'flex-end'
                      }}
                    >
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
                    </div>
                  </div>
                  <div
                    style={{
                      flex: '1 1 360px',
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        borderRadius: token.borderRadiusXXL * 1.2,
                        background: 'transparent',
                        boxShadow: modeAwareShadow(token.colorBgBase),
                        overflow: 'visible'
                      }}
                      bodyStyle={{
                        padding: token.padding,
                        display: 'flex',
                        justifyContent: 'center',
                        overflow: 'visible'
                      }}
                      ref={(node) => {
                        if (node) {
                          imageRefs.current[experience.title] = node
                        }
                      }}
                      onMouseEnter={() => animateImage(experience.title, true)}
                      onMouseLeave={() => animateImage(experience.title, false)}
                    >
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        preview={false}
                        style={{
                          borderRadius: token.borderRadiusLG,
                          width: '130%',
                          maxWidth: 'none',
                          transform: `translateX(${imageShift})`,
                          boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
                        }}
                      />
                    </Card>
                  </div>
                </div>
              </Card>
            )
          })}
        </Space>
      </Space>
    </Card>
  )
}

const modeAwareShadow = (colorBgBase: string) =>
  `0 30px 80px rgba(15,23,42,${colorBgBase === '#040614' ? '0.45' : '0.18'})`
