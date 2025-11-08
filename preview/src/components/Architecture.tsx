import { Timeline, Typography, theme } from 'antd'
import type { FC } from 'react'
import { workflowTimeline, releaseStats } from '../data/site'

export const Architecture: FC = () => {
  const { token } = theme.useToken()

  return (
    <section className="section architecture">
      <Typography.Title level={2}>Architecture in four movements</Typography.Title>
      <Typography.Paragraph type="secondary">
        Desktop, backend, renderer, and tooling share the same schema, tokens, and logging strategy.
      </Typography.Paragraph>
      <Timeline
        mode="left"
        items={workflowTimeline.map((step) => ({
          color: token.colorPrimary,
          children: (
            <div
              style={{
                padding: `${token.paddingSM}px ${token.paddingLG}px`,
                borderRadius: token.borderRadiusLG,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`
              }}
            >
              <Typography.Title level={4}>{step.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{step.details}</Typography.Paragraph>
            </div>
          )
        }))}
      />

      <div className="stats">
        {releaseStats.map((stat) => (
          <div
            key={stat.label}
            className="stat"
            style={{
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer
            }}
          >
            <Typography.Text type="secondary">{stat.label}</Typography.Text>
            <Typography.Title level={4}>{stat.value}</Typography.Title>
          </div>
        ))}
      </div>
    </section>
  )
}
