import { Card, Col, Divider, List, Row, Space, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { useRef } from 'react'
import { architectureGraph } from '../data/site'
import { useBlurOnScroll } from '../hooks/useBlurOnScroll'

interface ArchitectureGraphProps {
  accent: string
}

export const ArchitectureGraph: FC<ArchitectureGraphProps> = ({ accent }) => {
  const { token } = theme.useToken()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  useBlurOnScroll(headingRef)
  useBlurOnScroll(descriptionRef)

  return (
    <Card
      data-motion="architecture"
      bordered={false}
      style={{ background: 'transparent', marginTop: token.marginXXL * 2 }}
      bodyStyle={{ padding: 0 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title
          ref={headingRef}
          level={2}
          style={{
            color: accent,
            textAlign: 'center',
            marginBottom: token.margin,
            fontSize: 56,
            letterSpacing: 1.3
          }}
        >
          Architecture graph
        </Typography.Title>
        <Typography.Paragraph
          ref={descriptionRef}
          style={{ color: `${accent}cc`, textAlign: 'center', fontSize: 16 }}
        >
          Every workspace surface sits on a shared domain layer; this graph highlights the primary
          nodes that collaborate through IPC, REST, and shared DTOs.
        </Typography.Paragraph>
        <Row gutter={[24, 24]}>
          {architectureGraph.nodes.map((node) => (
            <Col xs={24} md={12} key={node.title}>
              <Card
                bordered={false}
                style={{
                  height: '100%',
                  borderRadius: token.borderRadiusXL,
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorder}`
                }}
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Typography.Title level={4} style={{ marginBottom: 0 }}>
                    {node.title}
                  </Typography.Title>
                  <Typography.Paragraph style={{ color: token.colorTextSecondary }}>
                    {node.description}
                  </Typography.Paragraph>
                  <List
                    dataSource={node.capabilities}
                    renderItem={(cap) => (
                      <List.Item style={{ padding: 0, border: 'none', color: token.colorTextBase }}>
                        <Tag bordered={false}>{cap}</Tag>
                      </List.Item>
                    )}
                  />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
        <Divider dashed>Core orchestrator</Divider>
        <Card
          bordered={false}
          style={{
            borderRadius: token.borderRadiusXXL,
            background: `linear-gradient(135deg, ${token.colorBgContainer}, ${token.colorBgElevated})`,
            border: `1px solid ${token.colorBorder}`,
            textAlign: 'center'
          }}
        >
          <Typography.Title level={4} style={{ marginBottom: token.margin }}>
            {architectureGraph.core.title}
          </Typography.Title>
          <Typography.Paragraph style={{ color: token.colorTextSecondary }}>
            {architectureGraph.core.description}
          </Typography.Paragraph>
          <Space wrap style={{ justifyContent: 'center', width: '100%' }}>
            {architectureGraph.core.capabilities.map((capability) => (
              <Tag key={capability} color="processing">
                {capability}
              </Tag>
            ))}
          </Space>
        </Card>
      </Space>
    </Card>
  )
}
