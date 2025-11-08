import { BulbOutlined } from '@ant-design/icons'
import { Avatar, Card, Segmented, Space, Switch, Tag, Typography, theme } from 'antd'
import type { FC } from 'react'
import { ACCENT_OPTIONS } from '../theme'
import type { ThemeMode } from '../theme/foundations/palette'

interface TokenPlaygroundProps {
  mode: ThemeMode
  onModeChange: (mode: ThemeMode) => void
  accent: string
  onAccentChange: (accent: string) => void
}

export const TokenPlayground: FC<TokenPlaygroundProps> = ({
  mode,
  onModeChange,
  accent,
  onAccentChange
}) => {
  const { token } = theme.useToken()

  return (
    <Space
      direction="vertical"
      style={{ marginTop: token.marginXL * 2, width: '100%' }}
      data-motion="token"
    >
      <Card
        bordered={false}
        style={{
          borderRadius: token.borderRadiusLG * 1.3,
          background: token.colorBgElevated,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: token.boxShadowSecondary ?? token.boxShadow
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Space align="center" size="middle">
            <BulbOutlined style={{ fontSize: 28, color: token.colorPrimary }} />
            <Space direction="vertical" size={4}>
              <Typography.Title level={3} style={{ marginBottom: 0 }}>
                Live token customizer
              </Typography.Title>
              <Typography.Text type="secondary">
                Toggle theme + accent to see how Ant Design tokens adapt instantly.
              </Typography.Text>
            </Space>
          </Space>

          <Space
            wrap
            align="center"
            style={{ width: '100%', justifyContent: 'space-between', gap: token.marginLG }}
          >
            <Space align="center">
                <Typography.Text strong>Mode</Typography.Text>
                <Switch
                checkedChildren="Dark"
                unCheckedChildren="Light"
                checked={mode === 'dark'}
                onChange={(checked) => onModeChange(checked ? 'dark' : 'light')}
                style={{ marginLeft: token.marginSM }}
              />
            </Space>
            <Space align="center">
                <Typography.Text strong>Accent</Typography.Text>
                <Segmented
                  style={{ marginLeft: token.marginSM }}
                  options={ACCENT_OPTIONS.map((color) => ({
                  label: (
                    <Avatar
                      size={28}
                      shape="circle"
                      style={{ backgroundColor: color, border: '2px solid rgba(255,255,255,0.4)' }}
                    />
                  ),
                  value: color
                }))}
                value={accent}
                onChange={(value) => onAccentChange(value as string)}
              />
            </Space>
          </Space>

          <Space direction="vertical" style={{ width: '100%' }}>
            <Card
              bordered={false}
              style={{
                borderRadius: token.borderRadiusLG,
                background: token.colorBgContainer,
                border: `1px dashed ${token.colorBorderSecondary}`
              }}
            >
              <Typography.Title level={4}>Primary surface</Typography.Title>
              <Typography.Paragraph type="secondary">
                Buttons, modals, tables, and menus reuse the same palette + spacing tokens you see
                in the core product.
              </Typography.Paragraph>
              <Space wrap>
                {['brandPrimary', 'brandSecondary', 'radiusLG', 'shadowSurface'].map((badge) => (
                  <Tag
                    key={badge}
                    style={{
                      borderRadius: 999,
                      background: `${token.colorPrimary}12`,
                      border: 'none',
                      color: token.colorTextSecondary,
                      letterSpacing: '0.04em'
                    }}
                  >
                    {badge}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Space>
        </Space>
      </Card>
    </Space>
  )
}
