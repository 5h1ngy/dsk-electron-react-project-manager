import { Card, Flex, Image, Space, Tag, Typography, theme } from 'antd'
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
      duration: enter ? 0.5 : 0.35,
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

        <Space direction="vertical" size={token.marginXXL} style={{ width: '100%' }}>
          {experienceDeck.map((experience, index) => {
            const isEven = index % 2 === 0
            const imageShift = isEven ? '12%' : '-12%'
            const textAlign = isEven ? 'left' : 'right'
            const alignItems = isEven ? 'flex-start' : 'flex-end'
            const justifyHighlights = isEven ? 'flex-start' : 'flex-end'

            return (
              <Card
                key={experience.title}
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
                    flexDirection: isEven ? 'row' : 'row-reverse',
                    minHeight: 260
                  }}
                >
                  <Flex
                    vertical
                    gap={token.marginSM}
                    style={{
                      flex: '1 1 320px',
                      padding: `${token.paddingSM}px ${token.paddingXL}px`,
                      alignItems,
                      textAlign
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
                    <Typography.Title level={3} style={{ marginBottom: 0, color: accent, width: '100%' }}>
                      {experience.title}
                    </Typography.Title>
                    <Typography.Paragraph
                      style={{ color: token.colorTextSecondary, marginBottom: 0, width: '100%' }}
                    >
                      {experience.summary}
                    </Typography.Paragraph>
                    <Flex wrap gap={token.marginXS} justify={justifyHighlights} style={{ width: '100%' }}>
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
                        boxShadow: '0 30px 80px rgba(0,0,0,0.4)'
                      }}
                      bodyStyle={{ padding: token.padding, overflow: 'visible' }}
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
                  </Flex>
                </Flex>
              </Card>
            )
          })}
        </Space>
      </Space>
    </Card>
  )
}
