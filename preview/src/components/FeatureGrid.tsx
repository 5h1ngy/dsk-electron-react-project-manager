import { Card, Col, Row, Typography } from 'antd'
import type { FC } from 'react'
import { featureCards } from '../data/site'

export const FeatureGrid: FC = () => (
  <section className="section">
    <Typography.Title level={2}>Why teams pick DSK Project Manager</Typography.Title>
    <Typography.Paragraph type="secondary">
      Shared domain logic, hardened IPC, and curated UX patterns keep multi-surface delivery tidy.
    </Typography.Paragraph>
    <Row gutter={[24, 24]}>
      {featureCards.map((card) => (
        <Col key={card.title} xs={24} md={12} lg={8}>
          <Card className="feature-card" bordered={false}>
            <div className="feature-emoji">{card.emoji}</div>
            <Typography.Title level={4}>{card.title}</Typography.Title>
            <Typography.Paragraph type="secondary">{card.description}</Typography.Paragraph>
          </Card>
        </Col>
      ))}
    </Row>
  </section>
)
