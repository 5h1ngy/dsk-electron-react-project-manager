import {
  ApiOutlined,
  CloudUploadOutlined,
  LayoutOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { Avatar, Card, Flex, Typography, theme } from 'antd'
import { useState } from 'react'
import { featureHighlights } from '../../data/site'
import { SectionHeading } from '../common/SectionHeading'
import { SectionShell } from '../common/SectionShell'

const iconMap: Record<string, JSX.Element> = {
  ThunderboltOutlined: <ThunderboltOutlined />,
  ApiOutlined: <ApiOutlined />,
  LayoutOutlined: <LayoutOutlined />,
  CloudUploadOutlined: <CloudUploadOutlined />
}

interface FeatureOrbitProps {
  accent: string
}

export const FeatureOrbit = ({ accent }: FeatureOrbitProps) => {
  const { token } = theme.useToken()
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const isDark = token.colorBgBase === '#040614'

  return (
    <SectionShell motionKey="features">
      <Flex vertical gap="large" style={{ width: '100%' }}>
        <SectionHeading title="Feature orbit" accent={accent} />
        <Flex wrap gap={28} style={{ width: '100%' }}>
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
                  flex: '1 1 260px',
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
                <Flex vertical gap="middle">
                  <Flex justify="center">
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
                  </Flex>
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
                </Flex>
              </Card>
            )
          })}
        </Flex>
      </Flex>
    </SectionShell>
  )
}
