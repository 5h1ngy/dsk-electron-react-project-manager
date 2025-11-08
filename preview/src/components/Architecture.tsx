import { Timeline, Typography } from 'antd'
import type { FC } from 'react'
import { workflowTimeline, releaseStats } from '../data/site'

export const Architecture: FC = () => (
  <section className="section architecture">
    <Typography.Title level={2}>Architecture in four movements</Typography.Title>
    <Typography.Paragraph type="secondary">
      Desktop, backend, renderer, and tooling share the same schema, tokens, and logging strategy.
    </Typography.Paragraph>
    <Timeline
      mode="left"
      items={workflowTimeline.map((step) => ({
        children: (
          <div>
            <Typography.Title level={4}>{step.title}</Typography.Title>
            <Typography.Paragraph type="secondary">{step.details}</Typography.Paragraph>
          </div>
        )
      }))}
    />

    <div className="stats">
      {releaseStats.map((stat) => (
        <div key={stat.label} className="stat">
          <Typography.Text type="secondary">{stat.label}</Typography.Text>
          <Typography.Title level={4}>{stat.value}</Typography.Title>
        </div>
      ))}
    </div>
  </section>
)
