import { GithubOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Card, Carousel, Col, Flex, Row, Space, Statistic, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'

const repoUrl = 'https://github.com/dsk-labs/dsk-electron-react-project-manager'

const screenshots = [
  'Screenshot 2025-11-08 115411.png',
  'Screenshot 2025-11-08 115440.png',
  'Screenshot 2025-11-08 115503.png',
  'Screenshot 2025-11-08 115529.png',
  'Screenshot 2025-11-08 115554.png',
  'Screenshot 2025-11-08 115609.png',
  'Screenshot 2025-11-08 115625.png',
  'Screenshot 2025-11-08 115638.png'
]

export const Hero: FC = () => {
  const { token } = theme.useToken()

  return (
    <Flex
      data-motion="hero"
      className="hero-section"
      style={{
        width: '100%',
        padding: `${token.paddingXL}px ${token.paddingXL}px ${token.paddingLG * 3}px`,
        gap: token.marginXL * 2,
        alignItems: 'stretch'
      }}
      wrap
    >
      <Flex vertical gap="large" style={{ flex: 1, minWidth: 320 }}>
        <Tag
          style={{
            borderRadius: 999,
            border: 'none',
            padding: '6px 16px',
            background: token.colorPrimaryBg,
            color: token.colorPrimary,
            alignSelf: 'flex-start'
          }}
        >
          Immersive product studio experience
        </Tag>

        <Typography.Title level={1} style={{ margin: 0 }}>
          This is how offline-first project orchestration should feel.
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ maxWidth: 560 }}>
          We fuse tactile visuals, reliability, and open-source governance into one cinematic
          control room. Think Dogstudio-grade storytelling—but for your delivery program.
        </Typography.Paragraph>

        <Space size="middle" wrap>
          <Button
            type="primary"
            size="large"
            icon={<PlayCircleOutlined />}
            href="#showcase"
            style={{ boxShadow: token.boxShadow }}
          >
            Enter Experience
          </Button>
          <Button size="large" icon={<GithubOutlined />} href={repoUrl} target="_blank">
            Star on GitHub
          </Button>
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`
              }}
            >
              <Statistic title="Release cadence" value="18 deploys / week" />
              <Typography.Text type="secondary">Fully automated CI with Docker.</Typography.Text>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`
              }}
            >
              <Statistic title="Offline resilience" value="120ms p95" />
              <Typography.Text type="secondary">Typed IPC + Sequelize domain.</Typography.Text>
            </Card>
          </Col>
        </Row>
      </Flex>

      <Card
        bordered={false}
        style={{
          flex: 1,
          minWidth: 320,
          borderRadius: token.borderRadiusLG * 1.4,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: token.boxShadow
        }}
        bodyStyle={{ padding: token.paddingSM }}
        data-hover-tilt
        data-shadow={token.boxShadow ?? ''}
      >
        <Carousel autoplay autoplaySpeed={3600} dots>
          {screenshots.map((src) => (
            <div key={src}>
              <img
                src={`/${src}`}
                alt={src}
                style={{
                  width: '100%',
                  borderRadius: token.borderRadiusLG,
                  border: `1px solid ${token.colorBorderSecondary}`
                }}
              />
            </div>
          ))}
        </Carousel>
      </Card>
    </Flex>
  )
}
