import { Button, Card, Space, Spin, Tag, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useMemo, type CSSProperties, type JSX } from 'react'

import { useHealthStatus } from '@renderer/components/HealthStatusCard.hooks'
import type { HealthStatusCardProps } from '@renderer/components/HealthStatusCard.types'
import { formatTimestamp } from '@renderer/components/HealthStatusCard.helpers'

export const HealthStatusCard = ({ className, cardStyle }: HealthStatusCardProps): JSX.Element => {
  const { loading, data, error, refresh } = useHealthStatus()

  const uptimeLabel = useMemo(() => {
    if (!data) {
      return '0s'
    }

    const totalSeconds = Math.floor(data.uptimeSeconds)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }, [data])

  const mergedCardStyle = useMemo<CSSProperties>(() => ({ width: 360, ...cardStyle }), [cardStyle])

  if (loading && !data && !error) {
    return (
      <Card className={className} style={mergedCardStyle}>
        <Spin />
      </Card>
    )
  }

  return (
    <Card
      className={className}
      title="Stato applicazione"
      extra={
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={() => {
            void refresh()
          }}
          aria-label="Aggiorna stato"
        >
          Aggiorna
        </Button>
      }
      style={mergedCardStyle}
    >
      <Space direction="vertical" size="middle">
        {data ? (
          <>
            <Space>
              <Typography.Text strong>Versione:</Typography.Text>
              <Typography.Text>{data.version}</Typography.Text>
            </Space>
            <Space>
              <Typography.Text strong>Uptime:</Typography.Text>
              <Typography.Text>{uptimeLabel}</Typography.Text>
            </Space>
            <Space>
              <Typography.Text strong>Aggiornato:</Typography.Text>
              <Typography.Text>{formatTimestamp(data.timestamp)}</Typography.Text>
            </Space>
            <Tag color="success">{data.status}</Tag>
          </>
        ) : (
          <Typography.Text type="danger">
            {error ?? 'Impossibile recuperare lo stato.'}
          </Typography.Text>
        )}
        {loading && (
          <Space>
            <Spin size="small" />
            <Typography.Text>Verifica in corso...</Typography.Text>
          </Space>
        )}
      </Space>
    </Card>
  )
}
