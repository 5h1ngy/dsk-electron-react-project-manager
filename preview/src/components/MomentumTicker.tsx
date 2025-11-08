import { Card, Space, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { momentumTags } from '../data/site'

export const MomentumTicker: FC = () => {
  const { token } = theme.useToken()

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: token.borderRadiusLG * 1.4,
        background: `linear-gradient(90deg, ${token.colorPrimary}22, ${token.colorInfo}22, ${token.colorPrimary}22)`,
        border: `1px solid ${token.colorBorder}`,
        animation: 'shimmerSweep 12s linear infinite',
        backgroundSize: '200% 200%'
      }}
      bodyStyle={{ padding: `${token.paddingLG}px ${token.paddingXL}px` }}
      data-motion="ticker"
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text type="secondary">Signal feed</Typography.Text>
        <Space wrap size="middle">
          {momentumTags.map((tag) => (
            <Tag
              key={tag}
              color={token.colorPrimary}
              style={{ borderRadius: 999, padding: '6px 16px', fontWeight: 600 }}
            >
              {tag}
            </Tag>
          ))}
        </Space>
      </Space>
    </Card>
  )
}
