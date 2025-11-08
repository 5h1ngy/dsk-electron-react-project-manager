import { Card, Col, Row, Space, Timeline, Typography, theme } from 'antd'
import type { FC } from 'react'
import { workflowTimeline, releaseStats } from '../data/site'

export const Architecture: FC = () => {
  const { token } = theme.useToken()

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ marginTop: token.marginXL * 2.5, width: '100%' }}
      data-motion="architecture"
    >
      <Typography.Title level={2}>Architecture in four movements</Typography.Title>
      <Typography.Paragraph type="secondary">
        Desktop, backend, renderer, and tooling share the same schema, tokens, and logging strategy.
      </Typography.Paragraph>
      <Timeline
        mode="left"
        items={workflowTimeline.map((step) => ({
          color: token.colorPrimary,
          children: (
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadow
              }}
              bodyStyle={{ padding: `${token.paddingSM}px ${token.paddingLG}px` }}
              data-hover-tilt
              data-shadow={token.boxShadow ?? ''}
            >
              <Typography.Title level={4}>{step.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{step.details}</Typography.Paragraph>
            </Card>
          )
        }))}
      />

      <Row gutter={[token.marginLG, token.marginLG]}>
        {releaseStats.map((stat) => (
          <Col key={stat.label} xs={24} sm={12} md={12} lg={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorBgContainer
              }}
              data-hover-tilt
              data-shadow={token.boxShadow ?? ''}
            >
              <Typography.Text type="secondary">{stat.label}</Typography.Text>
              <Typography.Title level={4}>{stat.value}</Typography.Title>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  )
}
