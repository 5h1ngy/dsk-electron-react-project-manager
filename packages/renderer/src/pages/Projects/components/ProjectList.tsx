import { Button, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { TableProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { ProjectSummary } from '@renderer/store/slices/projects'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

type ProjectRow = ProjectSummary
export type ProjectOptionalColumn = 'owner'

export interface ProjectListProps {
  projects: ProjectRow[]
  loading: boolean
  onSelect: (projectId: string) => void
  onEdit?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  pagination?: TablePaginationConfig
  canManage: boolean
  isDeleting: (projectId: string) => boolean
  deleteDisabled?: boolean
  rowSelection?: TableProps<ProjectRow>['rowSelection']
  visibleOptionalColumns?: ProjectOptionalColumn[]
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
  pagination,
  canManage,
  isDeleting,
  deleteDisabled = false,
  rowSelection,
  visibleOptionalColumns = []
}: ProjectListProps) => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)
  const badgeTokens = useSemanticBadges()
  const includeOwner = visibleOptionalColumns.includes('owner')

  const columns: ColumnsType<ProjectRow> = [
    {
      title: t('list.columns.key'),
      dataIndex: 'key',
      key: 'key',
      width: 120,
      render: (value: string) => (
        <Tag bordered={false} style={buildBadgeStyle(badgeTokens.projectKey)}>
          {value}
        </Tag>
      )
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
              <Tag key={tag} bordered={false} style={buildBadgeStyle(badgeTokens.tag(tag))}>
                {tag}
              </Tag>
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
      render: (value: ProjectRow['role']) => (
        <Tag bordered={false} style={buildBadgeStyle(badgeTokens.projectRole[value])}>
          {t(`list.role.${value}`)}
        </Tag>
      )
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
      width: 160,
      align: 'right',
      render: (_value: unknown, record) => {
        if (!canManage || record.role !== 'admin') {
          return null
        }
        return (
          <Space size={4} wrap style={{ justifyContent: 'flex-end', width: '100%' }}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation()
                onEdit?.(record)
              }}
            >
              {t('actions.edit')}
            </Button>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(event) => {
                event.stopPropagation()
                onDelete?.(record)
              }}
              loading={isDeleting(record.id)}
              disabled={!onDelete || (deleteDisabled && !isDeleting(record.id))}
            >
              {t('actions.delete')}
            </Button>
          </Space>
        )
      }
    }
  ]

  if (includeOwner) {
    columns.splice(2, 0, {
      title: t('list.columns.owner'),
      dataIndex: ['owner', 'displayName'],
      key: 'owner',
      width: 200,
      render: (_value: unknown, record) => {
        const display = record.owner?.displayName ?? record.owner?.username ?? '—'
        const username = record.owner?.username
        return (
          <Space direction="vertical" size={2}>
            <Typography.Text>{display}</Typography.Text>
            {username && username !== display ? (
              <Typography.Text type="secondary">{username}</Typography.Text>
            ) : null}
          </Space>
        )
      }
    })
  }

  if (showSkeleton) {
    return <LoadingSkeleton variant="table" />
  }

  return (
    <Table<ProjectRow>
      rowKey="id"
      columns={columns}
      dataSource={projects}
      rowSelection={rowSelection}
      pagination={
        pagination ?? {
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100']
        }
      }
      size="middle"
      scroll={{ x: 'max-content' }}
      onRow={(record) => ({
        onClick: () => onSelect(record.id),
        style: { cursor: 'pointer' }
      })}
      locale={{
        emptyText: (
          <EmptyState title={t('list.empty')} description={t('filters.searchPlaceholder')} />
        )
      }}
    />
  )
}
