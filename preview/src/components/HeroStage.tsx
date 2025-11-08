import {
  Button,
  Card,
  Col,
  Image,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  theme
} from 'antd'
import { ArrowRightOutlined, DownloadOutlined } from '@ant-design/icons'
import type { FC } from 'react'
import { heroContent } from '../data/site'
import type { ThemeMode } from '../theme/foundations/palette'

interface HeroStageProps {
  accent: string
  mode: ThemeMode
}

export const HeroStage: FC<HeroStageProps> = ({ accent, mode }) => {
  const { token } = theme.useToken()
  const isLight = mode === 'light'

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
        backgroundImage: layeredBackground,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
      bodyStyle={{ padding: token.paddingXL }}
    >
      <Row align="middle" gutter={[48, 48]} style={{ minHeight: 'calc(100vh - 96px)' }}>
        <Col xs={24} lg={12}>
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
              style={{
                color: isLight ? '#020617' : '#f8fafc',
                fontSize: 72,
                marginBottom: 0,
                lineHeight: 1
              }}
            >
              {heroContent.title}
            </Typography.Title>
            <Typography.Paragraph
              style={{
                color: isLight ? '#0f172a' : 'rgba(255,255,255,0.82)',
                fontSize: 18,
                maxWidth: 520
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
            <Row gutter={[24, 24]}>
              {heroContent.stats.map((stat) => (
                <Col xs={24} sm={12} key={stat.label}>
                  <Card
                    bordered={false}
                    style={{
                      background: isLight ? 'rgba(255,255,255,0.8)' : 'rgba(4,6,17,0.8)',
                      borderRadius: token.borderRadiusLG,
                      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'}`
                    }}
                  >
                    <Statistic
                      title={
                        <Typography.Text style={{ color: isLight ? '#334155' : '#cbd5f5' }}>
                          {stat.label}
                        </Typography.Text>
                      }
                      value={stat.value}
                      valueStyle={{
                        fontSize: 20,
                        color: isLight ? '#020617' : '#f8fafc'
                      }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </Space>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            bordered
            style={{
              width: '100%',
              maxWidth: 520,
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
            bodyStyle={{ padding: token.padding }}
          >
            <Image
              src={heroContent.heroShot}
              alt="Kanban board preview"
              preview={false}
              style={{
                borderRadius: token.borderRadiusLG,
                width: '100%',
                filter: mode === 'dark' ? 'drop-shadow(0 20px 45px rgba(0,0,0,0.45))' : 'none'
              }}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  )
}
