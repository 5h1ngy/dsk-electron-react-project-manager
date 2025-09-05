import { Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'

import type { ProjectSummary } from '@renderer/store/slices/projects'

type ProjectRow = ProjectSummary

export interface ProjectListProps {
  projects: ProjectRow[]
  loading: boolean
  onSelect: (projectId: string) => void
}

const formatDate = (value: Date | string, locale: string): string => {
  const date = value instanceof Date ? value : new Date(value)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const DEFAULT_PAGE_SIZE = 10

export const ProjectList = ({ projects, loading, onSelect }: ProjectListProps) => {
  const { t, i18n } = useTranslation('projects')
  const [pagination, setPagination] = useState<Required<Pick<TablePaginationConfig, 'current' | 'pageSize'>>>({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE
  })

  const paginationConfig: TablePaginationConfig = useMemo(
    () => ({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: projects.length,
      showSizeChanger: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total: number, range?: [number, number]) =>
        `${range?.[0] ?? 0}-${range?.[1] ?? 0} / ${total}`,
      onChange: (page, pageSize) => {
        setPagination({
          current: page,
          pageSize: pageSize ?? DEFAULT_PAGE_SIZE
        })
      }
    }),
    [pagination.current, pagination.pageSize, projects.length]
  )

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
    }
  ]

  return (
    <Table<ProjectRow>
      rowKey="id"
      columns={columns}
      dataSource={projects}
      loading={loading}
      pagination={paginationConfig}
      size="middle"
      scroll={{ x: 1024 }}
      onRow={(record) => ({
        onClick: () => onSelect(record.id),
        style: { cursor: 'pointer' }
      })}
      locale={{
        emptyText: loading ? t('list.loading') : t('list.empty')
      }}
    />
  )
}
