import { CalendarOutlined, DeleteOutlined, EditOutlined, TeamOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography,
  theme
} from 'antd'
import { useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { ProjectSummary } from '@renderer/store/slices/projects'
import { useSemanticBadges, buildBadgeStyle } from '@renderer/theme/hooks/useSemanticBadges'

const CARD_BODY_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: 12,
  height: '100%'
} as const

export interface ProjectCardsGridProps {
  projects: ProjectSummary[]
  loading: boolean
  onSelect: (projectId: string) => void
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit?: (project: ProjectSummary) => void
  onDelete?: (project: ProjectSummary) => void
  deletingProjectId?: string | null
}

export const ProjectCardsGrid = ({
  projects,
  loading,
  onSelect,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  deletingProjectId
}: ProjectCardsGridProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)
  const badgeTokens = useSemanticBadges()
  const { token } = theme.useToken()

  const { items, total } = useMemo(() => {
    const totalCount = projects.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return {
      items: projects.slice(start, end),
      total: totalCount
    }
  }, [page, pageSize, projects])

  if (showSkeleton) {
    return <LoadingSkeleton variant="cards" />
  }

  if (projects.length === 0) {
    return <EmptyState title={t('list.empty')} description={t('filters.searchPlaceholder')} />
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        {items.map((project) => {
          const tagList = project.tags ?? []
          return (
            <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                onClick={() => onSelect(project.id)}
                style={{ height: '100%' }}
                bodyStyle={CARD_BODY_STYLE}
                title={
                  <Space direction="vertical" size={4}>
                    <Typography.Text strong ellipsis>
                      {project.name}
                    </Typography.Text>
                    <Space size={6} wrap>
                      <Tag bordered={false} style={buildBadgeStyle(badgeTokens.projectKey)}>
                        {project.key}
                      </Tag>
                      <Tag
                        bordered={false}
                        style={buildBadgeStyle(badgeTokens.projectRole[project.role])}
                      >
                        {t(`list.role.${project.role}`)}
                      </Tag>
                    </Space>
                  </Space>
                }
                extra={
                  project.role === 'admin' ? (
                    <Space size={4}>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit?.(project)
                        }}
                      >
                        {t('actions.edit')}
                      </Button>
                      <Popconfirm
                        title={t('actions.deleteTitle')}
                        description={t('actions.deleteDescription', { name: project.name })}
                        okText={t('actions.deleteConfirm')}
                        cancelText={t('actions.cancel')}
                        okButtonProps={{ loading: deletingProjectId === project.id }}
                        onConfirm={async () => await onDelete?.(project)}
                        disabled={!onDelete}
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
                    </Space>
                  ) : undefined
                }
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Typography.Paragraph
                    type="secondary"
                    ellipsis={{ rows: 3 }}
                    style={{ marginBottom: 0 }}
                  >
                    {project.description ?? t('cards.noDescription')}
                  </Typography.Paragraph>
                  <Space size={4} wrap>
                    {tagList.length > 0 ? (
                      tagList.map((tag) => (
                        <Tag key={tag} bordered={false} style={buildBadgeStyle(badgeTokens.tag)}>
                          {tag}
                        </Tag>
                      ))
                    ) : (
                      <Typography.Text type="secondary">{t('list.noTags')}</Typography.Text>
                    )}
                  </Space>
                  <Space size={6} align="center">
                    <TeamOutlined style={{ color: token.colorPrimary }} aria-hidden />
                    <Typography.Text type="secondary">
                      {t('list.memberCount', { count: project.memberCount })}
                    </Typography.Text>
                  </Space>
                  <Space size={6} align="center">
                    <CalendarOutlined style={{ color: token.colorInfo }} aria-hidden />
                    <Typography.Text type="secondary">
                      {t('list.createdOn', {
                        date: new Intl.DateTimeFormat(i18n.language, {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }).format(new Date(project.createdAt))
                      })}
                    </Typography.Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          )
        })}
      </Row>
      {total > pageSize ? (
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={onPageChange}
          showSizeChanger={false}
          style={{ alignSelf: 'center' }}
        />
      ) : null}
    </Space>
  )
}

ProjectCardsGrid.displayName = 'ProjectCardsGrid'

export default ProjectCardsGrid
