import { Card, Col, Empty, Row, Space, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import type { ProjectSummary } from '@renderer/store/slices/projects'

export interface ProjectCardsGridProps {
  projects: ProjectSummary[]
  loading: boolean
  onSelect: (projectId: string) => void
}

export const ProjectCardsGrid = ({
  projects,
  loading,
  onSelect
}: ProjectCardsGridProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')

  if (!loading && projects.length === 0) {
    return <Empty description={t('list.empty')} />
  }

  return (
    <Row gutter={[16, 16]}>
      {projects.map((project) => (
        <Col key={project.id} xs={24} sm={12} lg={8} xl={6}>
          <Card
            hoverable
            onClick={() => onSelect(project.id)}
            title={
              <Space direction="vertical" size={4}>
                <Typography.Text strong>{project.name}</Typography.Text>
                <Tag color="blue">{project.key}</Tag>
              </Space>
            }
            extra={<Typography.Text>{t(`list.role.${project.role}`)}</Typography.Text>}
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Typography.Paragraph type="secondary" style={{ minHeight: 48 }}>
                {project.description ?? t('cards.noDescription')}
              </Typography.Paragraph>
              <Space size={4} wrap>
                {(project.tags ?? []).length > 0 ? (
                  project.tags!.map((tag) => (
                    <Tag key={tag} bordered={false} color="default">
                      {tag}
                    </Tag>
                  ))
                ) : (
                  <Typography.Text type="secondary">{t('list.noTags')}</Typography.Text>
                )}
              </Space>
              <Typography.Text type="secondary">
                {t('list.memberCount', { count: project.memberCount })}
              </Typography.Text>
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
          </Card>
        </Col>
      ))}
    </Row>
  )
}
