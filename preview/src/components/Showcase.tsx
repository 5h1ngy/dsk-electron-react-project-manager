import { Card, Typography, theme } from 'antd'

export const Showcase = () => {
  const { token } = theme.useToken()
  return (
    <section className="section" id="showcase">
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
        <img
          src="/preview.png"
          alt="DSK Project Manager preview"
          style={{
            width: '100%',
            borderRadius: token.borderRadiusLG,
            border: `1px solid ${token.colorBorderSecondary}`
          }}
        />
      </Card>
    </section>
  )
}
