import { Avatar, Card, Col, Row, Space, Typography, theme } from 'antd'
import {
  ThunderboltOutlined,
  ApiOutlined,
  LayoutOutlined,
  CloudUploadOutlined
} from '@ant-design/icons'
import type { FC } from 'react'
import { featureHighlights } from '../data/site'

const iconMap: Record<string, JSX.Element> = {
  ThunderboltOutlined: <ThunderboltOutlined />,
  ApiOutlined: <ApiOutlined />,
  LayoutOutlined: <LayoutOutlined />,
  CloudUploadOutlined: <CloudUploadOutlined />
}

export const FeatureOrbit: FC = () => {
  const { token } = theme.useToken()
  const isDark = token.colorBgBase === '#040614'

  return (
    <Card
      data-motion="features"
      bordered={false}
      style={{ background: 'transparent', marginTop: token.marginXXL }}
      bodyStyle={{ padding: 0 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title
          level={2}
          style={{ color: token.colorTextBase, marginBottom: token.margin, textAlign: 'center' }}
        >
          Feature orbit
        </Typography.Title>
        <Row gutter={[24, 24]}>
          {featureHighlights.map((feature, index) => (
            <Col xs={24} md={12} key={feature.title}>
              <Card
                bordered={false}
                hoverable
                style={{
                  height: '100%',
                  borderRadius: token.borderRadiusXL,
                  background: isDark
                    ? index % 2 === 0
                      ? 'linear-gradient(135deg, rgba(15,23,42,0.65), rgba(8,10,24,0.9))'
                      : 'linear-gradient(135deg, rgba(8,47,73,0.65), rgba(12,17,43,0.9))'
                    : 'linear-gradient(135deg, #ffffff, #eff3ff)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`
                }}
                bodyStyle={{ padding: token.paddingXL }}
              >
                <Space direction="vertical" size="middle">
                  <Avatar
                    shape="square"
                    size={56}
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
                      color: isDark ? '#fff' : '#0f172a',
                      fontSize: 24
                    }}
                    icon={iconMap[feature.icon]}
                  />
                  <Typography.Title
                    level={3}
                    style={{ color: isDark ? '#fff' : token.colorTextBase, marginBottom: 0 }}
                  >
                    {feature.title}
                  </Typography.Title>
                  <Typography.Paragraph
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.8)' : token.colorTextSecondary,
                      marginBottom: 0
                    }}
                  >
                    {feature.description}
                  </Typography.Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Space>
    </Card>
  )
}
