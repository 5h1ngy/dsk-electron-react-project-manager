import { Button, Card, Col, Row, Space, Tag, Typography, theme } from 'antd'
import { ArrowRightOutlined, DownloadOutlined } from '@ant-design/icons'
import gsap from 'gsap'
import type { FC } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { heroContent } from '../data/site'
import { HeroGallery } from './HeroGallery'
import type { ThemeMode } from '../theme/foundations/palette'

interface HeroStageProps {
  accent: string
  mode: ThemeMode
}

export const HeroStage: FC<HeroStageProps> = ({ accent, mode }) => {
  const { token } = theme.useToken()
  const isLight = mode === 'light'
  const [highlightedTile, setHighlightedTile] = useState<string | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const mockupRef = useRef<HTMLDivElement | null>(null)
  const titleRef = useRef<HTMLHeadingElement | null>(null)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)

  useLayoutEffect(() => {
    const elements = [titleRef.current, descriptionRef.current].filter(
      (el): el is HTMLElement => Boolean(el)
    )
    if (!elements.length) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12
        }
      )
    })
    return () => ctx.revert()
  }, [])

  const animateTile = (label: string, entering: boolean) => {
    const node = cardRefs.current[label]
    if (!node) return
    gsap.to(node, {
      y: entering ? -10 : 0,
      scale: entering ? 1.04 : 1,
      duration: entering ? 0.35 : 0.4,
      ease: entering ? 'power3.out' : 'power3.inOut'
    })
  }

  const animateMockup = (entering: boolean) => {
    if (!mockupRef.current) return
    gsap.to(mockupRef.current, {
      y: entering ? -12 : 0,
      rotateX: entering ? 2 : 0,
      rotateY: entering ? -2 : 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.6)'
    })
  }

  const layeredBackground = isLight
    ? `radial-gradient(circle at 15% 25%, ${accent}24, transparent 45%),
       radial-gradient(circle at 90% 0%, ${accent}20, transparent 55%),
       repeating-linear-gradient(120deg, rgba(15,23,42,0.05), rgba(15,23,42,0.05) 2px, transparent 2px, transparent 16px),
       linear-gradient(135deg, #eef2ff 0%, #ffffff 55%, #e9ecff 100%)`
    : `radial-gradient(circle at 20% 20%, ${accent}33, transparent 52%),
       radial-gradient(circle at 80% 0%, ${accent}29, transparent 48%),
       repeating-linear-gradient(125deg, rgba(148,163,184,0.12), rgba(148,163,184,0.12) 2px, transparent 2px, transparent 18px),
       linear-gradient(130deg, #040814 0%, #050b1b 50%, #020307 100%)`

  return (
    <Card
      data-motion="hero"
      bordered={false}
      style={{
        minHeight: '100vh',
        borderRadius: token.borderRadiusXL,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: layeredBackground,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
      bodyStyle={{ padding: `${token.paddingXL * 2}px ${token.paddingXL * 2.5}px` }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: token.borderRadiusXL,
          background: isLight
            ? `linear-gradient(135deg, rgba(15,23,42,0.08), rgba(148,163,184,0.12), transparent)`
            : `linear-gradient(125deg, ${accent}40, rgba(4,6,12,0.65), transparent 75%)`,
          mixBlendMode: isLight ? 'multiply' : 'screen',
          boxShadow: isLight
            ? '0 0 80px rgba(15,23,42,0.25)'
            : `0 0 140px ${accent}33`,
          pointerEvents: 'none'
        }}
      />
      <Row
        align="middle"
        gutter={[48, 48]}
        style={{ minHeight: 'calc(100vh - 96px)', position: 'relative', zIndex: 1 }}
      >
        <Col xs={24} lg={9}>
          <Space direction="vertical" size="large">
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
                color: isLight ? '#020617' : '#f8fafc',
                fontSize: 72,
                marginBottom: 0,
                marginTop: -token.marginLG,
                lineHeight: 1
              }}
            >
              {heroContent.title}
            </Typography.Title>
            <Typography.Paragraph
              ref={descriptionRef}
              style={{
                color: isLight ? '#0f172a' : 'rgba(255,255,255,0.82)',
                fontSize: 18,
                maxWidth: 520,
                marginTop: token.marginSM
              }}
            >
              {heroContent.description}
            </Typography.Paragraph>
            <Space size="large" wrap>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                style={{ minWidth: 180 }}
              >
                {heroContent.primaryCta}
              </Button>
              <Button size="large" icon={<ArrowRightOutlined />} ghost>
                {heroContent.secondaryCta}
              </Button>
            </Space>
            <div
              style={{
                width: '100%',
                marginTop: token.marginXXL * 1.6,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: token.margin
              }}
            >
              {heroContent.stats.map((stat) => {
                const active = highlightedTile === stat.label
                return (
                  <Card
                    key={stat.label}
                    bordered={false}
                    hoverable
                    ref={(node) => {
                      cardRefs.current[stat.label] = node
                    }}
                    onMouseEnter={() => {
                      setHighlightedTile(stat.label)
                      animateTile(stat.label, true)
                    }}
                    onMouseLeave={() => {
                      setHighlightedTile(null)
                      animateTile(stat.label, false)
                    }}
                    style={{
                      borderRadius: token.borderRadiusLG,
                      background: active
                        ? `linear-gradient(135deg, ${accent}c4, ${accent}7d)`
                        : isLight
                          ? 'rgba(255,255,255,0.85)'
                          : 'rgba(4,6,17,0.78)',
                      border: active
                        ? `1px solid ${accent}`
                        : `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'}`,
                      boxShadow: active
                        ? `0 20px 50px ${accent}40`
                        : isLight
                          ? '0 10px 30px rgba(15,23,42,0.08)'
                          : '0 20px 40px rgba(0,0,0,0.45)',
                      transform: active ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
                      transition:
                        'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, background 0.3s ease, border 0.3s ease',
                      cursor: 'pointer'
                    }}
                    bodyStyle={{ padding: token.paddingLG }}
                  >
                    <Typography.Text
                      style={{
                        textTransform: 'uppercase',
                        letterSpacing: 1.2,
                        fontSize: 12,
                        color: active ? '#fff' : isLight ? '#475569' : '#cbd5f5'
                      }}
                    >
                      {stat.label}
                    </Typography.Text>
                    <Typography.Title
                      level={4}
                      style={{ marginBottom: 0, color: active ? '#fff' : isLight ? '#020617' : '#f8fafc' }}
                    >
                      {stat.value}
                    </Typography.Title>
                  </Card>
                )
              })}
            </div>
          </Space>
        </Col>
        <Col xs={24} lg={15}>
          <Card
            bordered
            ref={mockupRef}
            style={{
              width: '100%',
              maxWidth: 960,
              marginLeft: 'auto',
              borderRadius: token.borderRadiusXXL,
              background:
                mode === 'dark'
                  ? 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(5,6,17,0.95))'
                  : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(241,245,255,0.9))',
              borderColor: accent,
              boxShadow: mode === 'dark'
                ? '0 30px 80px rgba(0,0,0,0.5)'
                : '0 30px 60px rgba(15,23,42,0.2)'
            }}
            bodyStyle={{ padding: token.padding, overflow: 'hidden' }}
            onMouseEnter={() => animateMockup(true)}
            onMouseLeave={() => animateMockup(false)}
          >
            <HeroGallery />
          </Card>
        </Col>
      </Row>
    </Card>
  )
}
