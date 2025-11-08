import { Button, Card, Typography, Space, theme } from 'antd'

const repoUrl = 'https://github.com/dsk-labs/dsk-electron-react-project-manager'

export const CallToAction = () => {
  const { token } = theme.useToken()

  return (
    <Space
      direction="vertical"
      style={{ marginTop: token.marginXL * 2, width: '100%' }}
      data-motion="cta"
    >
      <Card
        bordered={false}
        style={{
          borderRadius: token.borderRadiusLG * 1.2,
          textAlign: 'center',
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: token.boxShadow
        }}
        data-hover-tilt
        data-shadow={token.boxShadow ?? ''}
      >
        <Typography.Title level={3}>Ready to explore the code?</Typography.Title>
        <Typography.Paragraph type="secondary">
          Clone the repository, run the seed scripts, and you will have a fully offline workspace in
          minutes. Contributions are welcome!
        </Typography.Paragraph>
        <Button type="primary" size="large" href={repoUrl} target="_blank">
          Star on GitHub
        </Button>
      </Card>
    </Space>
  )
}
