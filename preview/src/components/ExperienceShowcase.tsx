import { Card, Col, Flex, Row, Statistic, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { experienceScenes } from '../data/site'

export const ExperienceShowcase: FC = () => {
  const { token } = theme.useToken()

  return (
    <Flex
      vertical
      gap="large"
      style={{ marginTop: token.marginXL * 2.5, width: '100%' }}
      data-motion="experience"
    >
      <Typography.Title level={2}>Immersive delivery moments</Typography.Title>
      <Typography.Paragraph type="secondary">
        Inspired by experiential studios like Dogstudio, we craft tactile surfaces for engineering
        teams: cinematic yet actionable.
      </Typography.Paragraph>
      <Row gutter={[24, 24]}>
        {experienceScenes.map((scene, index) => (
          <Col key={scene.title} xs={24} md={12} lg={8}>
            <Card
              bordered={false}
              style={{
                minHeight: 260,
                borderRadius: token.borderRadiusLG * 1.2,
                background: `linear-gradient(145deg, ${token.colorBgElevated}, ${token.colorBgContainer})`,
                border: `1px solid ${token.colorBorder}`,
                boxShadow: token.boxShadow
              }}
              bodyStyle={{ display: 'flex', flexDirection: 'column', gap: token.margin }}
              data-hover-tilt
              data-shadow={token.boxShadow ?? ''}
            >
              <Flex justify="space-between" align="center">
                <Tag color={token.colorPrimary} style={{ borderRadius: 999 }}>
                  {scene.badge}
                </Tag>
                <Statistic
                  value={index === 0 ? 'Zero downtime' : index === 1 ? 'Multi-locale' : 'Predictive'}
                  valueStyle={{ fontSize: 16, color: token.colorInfoText ?? token.colorPrimary }}
                />
              </Flex>
              <Typography.Title level={4}>{scene.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{scene.context}</Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Flex>
  )
}
