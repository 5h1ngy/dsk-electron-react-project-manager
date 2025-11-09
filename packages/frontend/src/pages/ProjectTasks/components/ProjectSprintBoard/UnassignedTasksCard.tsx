import { Card, Flex, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { TFunction } from 'i18next'
import type { GlobalToken } from 'antd/es/theme/interface'
import type { JSX } from 'react'

import type { UnassignedTaskRecord } from './types'

interface UnassignedTasksCardProps {
  title: string
  count: number
  description?: string
  data: UnassignedTaskRecord[]
  columns: ColumnsType<UnassignedTaskRecord>
  token: GlobalToken
  t: TFunction<'projects'>
}

const UnassignedTasksCard = ({
  title,
  count,
  description,
  data,
  columns,
  token,
  t
}: UnassignedTasksCardProps): JSX.Element => (
  <Card
    bordered={false}
    style={{
      borderRadius: token.borderRadiusLG,
      background: token.colorBgElevated,
      border: `${token.lineWidth}px solid ${token.colorBorder}`,
      boxShadow: token.boxShadowTertiary
    }}
    bodyStyle={{
      padding: token.paddingLG,
      display: 'flex',
      flexDirection: 'column',
      gap: token.marginMD
    }}
  >
    <Flex align="center" justify="space-between" wrap gap={token.marginSM}>
      <Space size={token.marginSM} align="center">
        <Typography.Title level={5} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        <Tag bordered={false} color={token.colorPrimary} style={{ fontWeight: 600 }}>
          {count}
        </Tag>
      </Space>
      {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
    </Flex>
    <div
      style={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: token.borderRadiusLG,
        border: `${token.lineWidth}px solid ${token.colorBorderSecondary}`
      }}
    >
      <Table<UnassignedTaskRecord>
        size="small"
        rowKey="key"
        columns={columns}
        dataSource={data}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50']
        }}
        scroll={{ x: 'max-content' }}
        locale={{
          emptyText: t('sprints.unassignedTasks.empty', {
            defaultValue: 'Tutti i task sono assegnati a uno sprint.'
          })
        }}
      />
    </div>
  </Card>
)

export default UnassignedTasksCard
