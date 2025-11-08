import { Card, Col, Image, Row, Space, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { experienceDeck } from '../data/site'

export const ExperienceShowcase: FC = () => {
  const { token } = theme.useToken()

  return (
    <Card
      data-motion="showcase"
      bordered={false}
      style={{ background: 'transparent', marginTop: token.marginXXL }}
      bodyStyle={{ padding: 0 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title
          level={2}
          style={{ color: token.colorTextBase, marginBottom: token.margin, textAlign: 'center' }}
        >
          Delivery tapestries
        </Typography.Title>
        <Space direction="vertical" size={token.marginXL} style={{ width: '100%' }}>
          {experienceDeck.map((experience, index) => {
            const content = (
              <Card
                bordered={false}
                style={{
                  borderRadius: token.borderRadiusXL,
                  height: '100%',
                  background: token.colorBgContainer,
                  boxShadow: modeAwareShadow(token.colorBgBase)
                }}
                bodyStyle={{ padding: token.paddingXL }}
              >
                <Space direction="vertical" size="middle">
                  <Tag bordered={false} color="purple">
                    {experience.badge}
                  </Tag>
                  <Typography.Title level={3} style={{ marginBottom: 0 }}>
                    {experience.title}
                  </Typography.Title>
                  <Typography.Paragraph style={{ color: token.colorTextSecondary }}>
                    {experience.summary}
                  </Typography.Paragraph>
                  <Space wrap>
                    {experience.highlights.map((highlight) => (
                      <Tag key={highlight} color="default">
                        {highlight}
                      </Tag>
                    ))}
                  </Space>
                </Space>
              </Card>
            )

            const mockup = (
              <Card
                bordered={false}
                style={{
                  borderRadius: token.borderRadiusXXL,
                  background: 'transparent',
                  boxShadow: modeAwareShadow(token.colorBgBase)
                }}
                bodyStyle={{ padding: token.padding }}
              >
                <Image
                  src={experience.image}
                  alt={experience.title}
                  width="100%"
                  preview={false}
                  style={{ borderRadius: token.borderRadiusLG }}
                />
              </Card>
            )

            const columns = [
              <Col xs={24} lg={12} key="content">
                {content}
              </Col>,
              <Col xs={24} lg={12} key="mockup">
                {mockup}
              </Col>
            ]

            const ordered = index % 2 === 0 ? columns : columns.reverse()

            return (
              <Row gutter={[32, 32]} align="middle" key={experience.title}>
                {ordered}
              </Row>
            )
          })}
        </Space>
      </Space>
    </Card>
  )
}

const modeAwareShadow = (colorBgBase: string) =>
  `0 30px 80px rgba(15,23,42,${colorBgBase === '#040614' ? '0.45' : '0.18'})`
