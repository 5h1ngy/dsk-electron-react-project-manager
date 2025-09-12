import { Button, Popconfirm, Space, Table, Tag, Typography, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { ProjectSummary } from '@renderer/store/slices/projects'

type ProjectRow = ProjectSummary

export interface ProjectListProps {
  projects: ProjectRow[]
  loading: boolean
  onSelect: (projectId: string) => void
  onEdit?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  deletingProjectId?: string | null
}

const formatDate = (value: Date | string, locale: string): string => {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export const ProjectList = ({
  projects,
  loading,
  onSelect,
  onEdit,
  onDelete,
  deletingProjectId
}: ProjectListProps) => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)

  const columns: ColumnsType<ProjectRow> = [
    {
      title: t('list.columns.key'),
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (value: string) => <Tag color="blue">{value}</Tag>
    },
    {
      title: t('list.columns.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (_value: string, record) => (
        <div style={{ maxWidth: 360 }}>
          <Typography.Text strong>{record.name}</Typography.Text>
          {record.description ? (
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {record.description}
            </Typography.Paragraph>
          ) : null}
        </div>
      )
    },
    {
      title: t('list.columns.tags'),
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[] | undefined) =>
        tags && tags.length > 0 ? (
          <span>
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </span>
        ) : (
          <Typography.Text type="secondary">{t('list.noTags')}</Typography.Text>
        )
    },
    {
      title: t('list.columns.role'),
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (value: ProjectRow['role']) => <Tag>{t(`list.role.${value}`)}</Tag>
    },
    {
      title: t('list.columns.members'),
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 140,
      render: (value: number) => t('list.memberCount', { count: value })
    },
    {
      title: t('list.columns.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (value: Date | string) => formatDate(value, i18n.language)
    },
    {
      title: t('list.columns.actions'),
      key: 'actions',
      width: 120,
      render: (_value: unknown, record) => {
        if (record.role !== 'admin') {
          return null
        }
        return (
          <Space size={4}>
            <Tooltip title={t('actions.edit')}>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  onEdit?.(record)
                }}
              />
            </Tooltip>
            <Popconfirm
              title={t('actions.deleteTitle')}
              description={t('actions.deleteDescription', { name: record.name })}
              okText={t('actions.deleteConfirm')}
              cancelText={t('actions.cancel')}
              okButtonProps={{ loading: deletingProjectId === record.id }}
              onConfirm={async () => onDelete?.(record)}
              disabled={!onDelete}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={(event) => event.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  if (showSkeleton) {
    return <LoadingSkeleton variant="table" />
  }

  return (
    <Table<ProjectRow>
      rowKey="id"
      columns={columns}
      dataSource={projects}
      size="middle"
      scroll={{ x: 1024 }}
      onRow={(record) => ({
        onClick: () => onSelect(record.id),
        style: { cursor: 'pointer' }
      })}
      locale={{
        emptyText: (
          <EmptyState
            title={t('list.empty')}
            description={t('filters.searchPlaceholder')}
          />
        )
      }}
    />
  )
}
