import { Avatar, Card, Space, Typography, theme } from 'antd'
import {
  ThunderboltOutlined,
  ApiOutlined,
  LayoutOutlined,
  CloudUploadOutlined
} from '@ant-design/icons'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import { featureHighlights } from '../data/site'
import { useBlurOnScroll } from '../hooks/useBlurOnScroll'

const iconMap: Record<string, JSX.Element> = {
  ThunderboltOutlined: <ThunderboltOutlined />,
  ApiOutlined: <ApiOutlined />,
  LayoutOutlined: <LayoutOutlined />,
  CloudUploadOutlined: <CloudUploadOutlined />
}

interface FeatureOrbitProps {
  accent: string
}

export const FeatureOrbit: FC<FeatureOrbitProps> = ({ accent }) => {
  const { token } = theme.useToken()
  const isDark = token.colorBgBase === '#040614'
  const headingRef = useRef<HTMLHeadingElement>(null)
  useBlurOnScroll(headingRef)
  const [activeCard, setActiveCard] = useState<string | null>(null)

  return (
    <Card
      data-motion="features"
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
            letterSpacing: 1.4
          }}
        >
          Feature orbit
        </Typography.Title>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 28
          }}
        >
          {featureHighlights.map((feature) => {
            const active = activeCard === feature.title
            return (
              <Card
              key={feature.title}
              bordered={false}
              hoverable
              onMouseEnter={() => setActiveCard(feature.title)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                borderRadius: token.borderRadiusXL,
                background: active
                  ? `radial-gradient(circle at 20% 20%, ${accent}55, ${accent}1a)`
                  : isDark
                    ? 'linear-gradient(140deg, rgba(7,11,24,0.85), rgba(3,6,15,0.85))'
                    : 'linear-gradient(140deg, rgba(255,255,255,0.92), rgba(238,242,255,0.92))',
                border: active
                  ? `1px solid ${accent}`
                  : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.08)'}`,
                boxShadow: active
                  ? `0 30px 70px ${accent}42`
                  : isDark
                    ? '0 25px 60px rgba(0,0,0,0.45)'
                    : '0 20px 45px rgba(15,23,42,0.16)',
                transform: active ? 'translateY(-8px) scale(1.02)' : 'translateY(0)',
                transition:
                  'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, background 0.3s ease, border 0.3s ease'
              }}
              bodyStyle={{ padding: token.paddingXL }}
            >
              <Space direction="vertical" size="middle">
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    shape="square"
                    size={56}
                    style={{
                      background: 'transparent',
                      color: active ? '#fff' : isDark ? '#fff' : '#0f172a',
                      fontSize: 28
                    }}
                    icon={iconMap[feature.icon]}
                  />
                </div>
                <Typography.Title
                  level={3}
                  style={{
                    color: active ? '#fff' : isDark ? '#fff' : token.colorTextBase,
                    marginBottom: 0
                  }}
                >
                  {feature.title}
                </Typography.Title>
                <Typography.Paragraph
                  style={{
                    color: active
                      ? 'rgba(255,255,255,0.9)'
                      : isDark
                        ? 'rgba(255,255,255,0.8)'
                        : token.colorTextSecondary,
                    marginBottom: 0
                  }}
                >
                  {feature.description}
                </Typography.Paragraph>
                </Space>
              </Card>
            )
          })}
        </div>
      </Space>
    </Card>
  )
}
