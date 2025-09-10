import { Button, Card, Space, Spin, Tag, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useMemo } from 'react'
import { useHealthStatus } from '@renderer/components/HealthStatusCard/hooks/useHealthStatus'

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) {
    return 'Data non disponibile'
  }
  return date.toLocaleString()
}

export const HealthStatusCard = () => {
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

  if (loading && !data && !error) {
    return (
      <Card style={{ width: 360 }}>
        <Spin />
      </Card>
    )
  }

  return (
    <Card
      title="Stato applicazione"
      extra={
        <Button type="text" icon={<ReloadOutlined />} onClick={refresh} aria-label="Aggiorna stato">
          Aggiorna
        </Button>
      }
      style={{ width: 360 }}
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
