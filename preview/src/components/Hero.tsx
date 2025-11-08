import { GithubOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Space, Tag, Typography } from 'antd'

const repoUrl = 'https://github.com/dsk-labs/dsk-electron-react-project-manager'

export const Hero = () => (
  <div className="hero">
    <Tag color="geekblue" style={{ borderRadius: 999 }}>
      Open Source · MIT License
    </Tag>
    <Typography.Title level={1}>Manage complex delivery fully offline</Typography.Title>
    <Typography.Paragraph type="secondary">
      DSK Project Manager bundles an Electron desktop app, a React SPA, and a SQLite-first REST API
      so product, engineering, and delivery teams can collaborate without depending on cloud
      connectivity.
    </Typography.Paragraph>
    <Space size="middle" wrap>
      <Button
        size="large"
        type="primary"
        icon={<PlayCircleOutlined />}
        href="#showcase"
        className="hero-cta"
      >
        View Experience
      </Button>
      <Button size="large" icon={<GithubOutlined />} href={repoUrl} target="_blank">
        Go to Repository
      </Button>
    </Space>
  </div>
)
