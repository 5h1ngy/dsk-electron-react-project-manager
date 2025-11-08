import { Timeline, Typography, theme } from 'antd'
import type { FC } from 'react'
import { workflowTimeline, releaseStats } from '../data/site'

export const Architecture: FC = () => {
  const { token } = theme.useToken()

  return (
    <section style={{ marginTop: token.marginXL * 2.5 }}>
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
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadow
              }}
            >
              <Typography.Title level={4}>{step.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{step.details}</Typography.Paragraph>
            </div>
          )
        }))}
      />

      <div
        style={{
          marginTop: token.marginXL,
          display: 'grid',
          gap: token.marginLG,
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))'
        }}
      >
        {releaseStats.map((stat) => (
          <div
            key={stat.label}
            style={{
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
              padding: `${token.paddingSM}px ${token.paddingLG}px`
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
