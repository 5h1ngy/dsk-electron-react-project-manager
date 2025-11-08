import { Card, Typography } from 'antd'

export const Showcase = () => (
  <section className="section" id="showcase">
    <Typography.Title level={2}>Unified experience</Typography.Title>
    <Typography.Paragraph type="secondary">
      Dashboards, kanban, wiki, seed orchestration, and admin panels all share the same Ant Design
      token system.
    </Typography.Paragraph>
    <Card className="showcase-card" bordered={false}>
      <img src="/preview.png" alt="DSK Project Manager preview" />
    </Card>
  </section>
)
