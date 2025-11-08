import { BulbOutlined } from '@ant-design/icons'
import { Card, Segmented, Space, Switch, Typography, theme } from 'antd'
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
    <section className="section">
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
          <div className="token-heading" style={{ gap: token.marginSM }}>
            <BulbOutlined style={{ fontSize: 28, color: token.colorPrimary }} />
            <div>
              <Typography.Title level={3} style={{ marginBottom: 0 }}>
                Live token customizer
              </Typography.Title>
              <Typography.Text type="secondary">
                Toggle theme + accent to see how Ant Design tokens adapt instantly.
              </Typography.Text>
            </div>
          </div>

          <div className="token-controls" style={{ gap: token.marginLG }}>
            <div>
              <Typography.Text strong>Mode</Typography.Text>
              <Switch
                checkedChildren="Dark"
                unCheckedChildren="Light"
                checked={mode === 'dark'}
                onChange={(checked) => onModeChange(checked ? 'dark' : 'light')}
                style={{ marginLeft: token.marginSM }}
              />
            </div>
            <div>
              <Typography.Text strong>Accent</Typography.Text>
              <Segmented
                style={{ marginLeft: token.marginSM }}
                options={ACCENT_OPTIONS.map((color) => ({
                  label: <span className="accent-dot" style={{ backgroundColor: color }} />,
                  value: color
                }))}
                value={accent}
                onChange={(value) => onAccentChange(value as string)}
              />
            </div>
          </div>

          <div className="token-preview">
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
                <span className="badge">brandPrimary</span>
                <span className="badge">brandSecondary</span>
                <span className="badge">radiusLG</span>
                <span className="badge">shadowSurface</span>
              </Space>
            </Card>
          </div>
        </Space>
      </Card>
    </section>
  )
}
