import { Card, Typography, Image, Space, theme } from 'antd'

export const Showcase = () => {
  const { token } = theme.useToken()
  return (
    <Space direction="vertical" size="large" style={{ marginTop: token.marginXL * 2.5, width: '100%' }} id="showcase">
      <Typography.Title level={2}>Unified experience</Typography.Title>
      <Typography.Paragraph type="secondary">
        Dashboards, kanban, wiki, seed orchestration, and admin panels all share the same Ant Design
        token system.
      </Typography.Paragraph>
      <Card
        bordered={false}
        style={{
          borderRadius: token.borderRadiusLG * 1.4,
          padding: token.paddingLG,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: token.boxShadow
        }}
      >
        <Image
          src="/preview.png"
          alt="DSK Project Manager preview"
          preview={false}
          style={{
            borderRadius: token.borderRadiusLG,
            border: `1px solid ${token.colorBorderSecondary}`
          }}
        />
      </Card>
    </Space>
  )
}
