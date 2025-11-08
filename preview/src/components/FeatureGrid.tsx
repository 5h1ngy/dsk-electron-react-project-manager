import { Card, Col, Row, Typography, theme } from 'antd'
import type { FC } from 'react'
import { featureCards } from '../data/site'

export const FeatureGrid: FC = () => {
  const { token } = theme.useToken()

  return (
    <section style={{ marginTop: token.marginXL * 2.5 }}>
      <Typography.Title level={2}>Why teams pick DSK Project Manager</Typography.Title>
      <Typography.Paragraph type="secondary">
        Shared domain logic, hardened IPC, and curated UX patterns keep multi-surface delivery tidy.
      </Typography.Paragraph>
      <Row gutter={[24, 24]}>
        {featureCards.map((card) => (
          <Col key={card.title} xs={24} md={12} lg={8}>
            <Card
              bordered={false}
              style={{
                minHeight: 220,
                borderRadius: token.borderRadiusLG,
                background: token.colorBgElevated,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadowSecondary ?? token.boxShadow,
                display: 'flex',
                flexDirection: 'column',
                gap: token.marginSM
              }}
            >
              <div style={{ fontSize: 28, marginBottom: token.marginXS }}>{card.emoji}</div>
              <Typography.Title level={4}>{card.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{card.description}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}
