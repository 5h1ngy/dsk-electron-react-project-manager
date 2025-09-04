import { Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMemo } from 'react'

import type { ProjectSummary } from '@renderer/store/slices/projects'

export interface ProjectListProps {
  projects: ProjectSummary[]
  selectedProjectId: string | null
  onSelect: (projectId: string) => void
  loading: boolean
}

const formatDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export const ProjectList = ({
  projects,
  selectedProjectId,
  onSelect,
  loading
}: ProjectListProps): JSX.Element => {
  const columns = useMemo<ColumnsType<ProjectSummary>>(
    () => [
      {
        title: 'Key',
        dataIndex: 'key',
        key: 'key',
        width: 120,
        render: (value: string) => <Tag color="blue">{value}</Tag>
      },
      {
        title: 'Nome',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
        render: (value: string, record) => (
          <div>
            <Typography.Text strong>{value}</Typography.Text>
            {record.description ? (
              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {record.description}
              </Typography.Paragraph>
            ) : null}
          </div>
        )
      },
      {
        title: 'Creato da',
        dataIndex: 'createdBy',
        key: 'createdBy',
        width: 160,
        render: (value: string) => <Typography.Text>{value}</Typography.Text>
      },
      {
        title: 'Creato il',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 140,
        render: (value: Date | string) => formatDate(value)
      }
    ],
    []
  )

  return (
    <Table<ProjectSummary>
      rowKey="id"
      columns={columns}
      dataSource={projects}
      loading={loading}
      pagination={false}
      size="middle"
      rowClassName={(record) => (record.id === selectedProjectId ? 'ant-table-row-selected' : '')}
      onRow={(record) => ({
        onClick: () => onSelect(record.id)
      })}
      locale={{
        emptyText: loading ? 'Caricamento...' : 'Nessun progetto disponibile'
      }}
    />
  )
}
