import { GithubOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Space, Statistic, Tag, Typography, theme } from 'antd'

const repoUrl = 'https://github.com/dsk-labs/dsk-electron-react-project-manager'

export const Hero = () => {
  const { token } = theme.useToken()
  return (
    <Space
      data-motion="hero"
      direction="vertical"
      align="center"
      size="large"
      style={{ width: '100%', padding: `${token.paddingXL}px ${token.paddingXL}px ${token.paddingLG * 3}px` }}
    >
      <Flex vertical gap="small" align="center">
        <Tag
          style={{
            borderRadius: 999,
            border: 'none',
            padding: '6px 16px',
            background: token.colorPrimaryBg,
            color: token.colorPrimary
          }}
        >
          Dogstudio-inspired immersive release
        </Tag>
        <Typography.Title level={1} style={{ textAlign: 'center' }}>
          A cinematic control room for delivery leaders
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ maxWidth: 720, textAlign: 'center' }}>
          Crafted for architects who need tangible feedback loops. Offline-first infrastructure,
          cinematic UI, and observability woven together.
        </Typography.Paragraph>
      </Flex>
      <Flex
        gap="large"
        wrap
        justify="center"
        style={{ width: '100%', marginTop: token.marginLG }}
      >
        <Space size="middle" wrap>
          <Button
            size="large"
            type="primary"
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
        <Card
          bordered={false}
          style={{
            minWidth: 260,
            borderRadius: token.borderRadiusLG * 1.1,
            background: `linear-gradient(135deg, ${token.colorBgElevated}, ${token.colorBgContainer})`,
            border: `1px solid ${token.colorBorder}`,
            boxShadow: token.boxShadow
          }}
          bodyStyle={{ display: 'flex', flexDirection: 'column', gap: token.margin }}
          data-hover-tilt
          data-shadow={token.boxShadow ?? ''}
        >
          <Typography.Text type="secondary">Impact Pulse</Typography.Text>
          <Flex gap="large">
            <Statistic title="Latency" value="120ms p95" />
            <Statistic title="Deploys/week" value="18" />
          </Flex>
          <Typography.Text type="secondary">
            Observability meets artistry—secure IPC, typed services, and neon-grade visuals.
          </Typography.Text>
        </Card>
      </Flex>
    </Space>
  )
}
