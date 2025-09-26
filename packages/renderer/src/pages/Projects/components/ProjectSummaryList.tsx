import { Button, List, Popconfirm, Space, Tag, Typography, theme } from 'antd'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { ProjectSummary } from '@renderer/store/slices/projects'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

export interface ProjectSummaryListProps {
  projects: ProjectSummary[]
  loading: boolean
  onSelect: (projectId: string) => void
  onEdit?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  deletingProjectId?: string | null
  page: number
  pageSize: number
  onPageChange: (page: number) => void
}

const formatDate = (value: Date | string, locale: string): string =>
  new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(value instanceof Date ? value : new Date(value))

export const ProjectSummaryList = ({
  projects,
  loading,
  onSelect,
  onEdit,
  onDelete,
  deletingProjectId,
  page,
  pageSize,
  onPageChange
}: ProjectSummaryListProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const { token } = theme.useToken()
  const badgeTokens = useSemanticBadges()
  const showSkeleton = useDelayedLoading(loading)

  const pagedData = useMemo(() => {
    const start = (page - 1) * pageSize
    return projects.slice(start, start + pageSize)
  }, [page, pageSize, projects])

  if (showSkeleton) {
    return <LoadingSkeleton variant="list" />
  }

  if (projects.length === 0) {
    return <EmptyState title={t('list.empty')} description={t('filters.searchPlaceholder')} />
  }

  return (
    <List
      dataSource={pagedData}
      itemLayout="vertical"
      split={false}
      style={{ width: '100%' }}
      renderItem={(project) => {
        const roleTag = (
          <Tag bordered={false} style={buildBadgeStyle(badgeTokens.projectRole[project.role])}>
            {t(`list.role.${project.role}`)}
          </Tag>
        )
        const tags =
          project.tags?.map((tag) => (
            <Tag key={tag} bordered={false} style={buildBadgeStyle(badgeTokens.tag(tag))}>
              {tag}
            </Tag>
          )) ?? []

        const handleItemClick = () => onSelect(project.id)

        return (
          <List.Item
            key={project.id}
            onClick={handleItemClick}
            style={{
              cursor: 'pointer',
              background: token.colorBgContainer,
              borderRadius: token.borderRadiusLG,
              padding: token.paddingLG,
              boxShadow: token.boxShadowSecondary,
              marginBottom: token.marginMD
            }}
            actions={
              project.role === 'admin' && (onEdit || onDelete)
                ? [
                    <Button
                      key="edit"
                      type="text"
                      icon={<EditOutlined />}
                      onClick={(event) => {
                        event.stopPropagation()
                        onEdit?.(project)
                      }}
                    >
                      {t('actions.edit')}
                    </Button>,
                    <Popconfirm
                      key="delete"
                      title={t('actions.deleteTitle')}
                      description={t('actions.deleteDescription', { name: project.name })}
                      okText={t('actions.deleteConfirm')}
                      cancelText={t('actions.cancel')}
                      okButtonProps={{ loading: deletingProjectId === project.id }}
                      onConfirm={() => onDelete?.(project)}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(event) => event.stopPropagation()}
                      >
                        {t('actions.delete')}
                      </Button>
                    </Popconfirm>
                  ]
                : undefined
            }
          >
            <Space direction="vertical" size={token.marginXS} style={{ width: '100%' }}>
              <Space align="center" size={token.marginSM} wrap>
                <Typography.Text strong>{project.name}</Typography.Text>
                <Tag bordered={false} style={buildBadgeStyle(badgeTokens.projectKey)}>
                  {project.key}
                </Tag>
                {roleTag}
              </Space>
              {project.description ? (
                <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {project.description}
                </Typography.Paragraph>
              ) : null}
              <Space size={token.marginXS} wrap>
                {tags.length > 0 ? tags : (
                  <Typography.Text type="secondary">{t('list.noTags')}</Typography.Text>
                )}
              </Space>
              <Typography.Text type="secondary">
                {t('list.createdOn', { date: formatDate(project.createdAt, i18n.language) })}
              </Typography.Text>
              <Typography.Text type="secondary">
                {t('list.memberCount', { count: project.memberCount })}
              </Typography.Text>
            </Space>
          </List.Item>
        )
      }}
      pagination={{
        current: page,
        total: projects.length,
        pageSize,
        onChange: onPageChange,
        showSizeChanger: false,
        style: { marginTop: token.marginLG, textAlign: 'center' }
      }}
    />
  )
}

ProjectSummaryList.displayName = 'ProjectSummaryList'

export default ProjectSummaryList

