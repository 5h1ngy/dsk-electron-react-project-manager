import { GithubOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Space, Tag, Typography, theme } from 'antd'

const repoUrl = 'https://github.com/dsk-labs/dsk-electron-react-project-manager'

export const Hero = () => {
  const { token } = theme.useToken()
  return (
    <div
      className="hero"
      style={{
        padding: `${token.paddingXL}px ${token.paddingXL}px ${token.paddingLG * 3}px`,
        gap: token.marginLG
      }}
    >
      <Tag
        style={{
          borderRadius: 999,
          border: 'none',
          padding: '6px 16px',
          background: token.colorPrimaryBg,
          color: token.colorPrimary
        }}
      >
        Open Source · MIT License
      </Tag>
      <Typography.Title level={1} style={{ marginTop: token.marginSM }}>
        Manage complex delivery fully offline
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ maxWidth: 720, margin: '0 auto' }}>
        DSK Project Manager bundles an Electron desktop app, a React SPA, and a SQLite-first REST
        API so product, engineering, and delivery teams can collaborate without depending on cloud
        connectivity.
      </Typography.Paragraph>
      <Space size="middle" wrap>
        <Button
          size="large"
          type="primary"
          icon={<PlayCircleOutlined />}
          href="#showcase"
          style={{ boxShadow: token.boxShadow }}
        >
          View Experience
        </Button>
        <Button size="large" icon={<GithubOutlined />} href={repoUrl} target="_blank">
          Go to Repository
        </Button>
      </Space>
    </div>
  )
}
