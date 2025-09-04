import { Card, List, Skeleton, Space, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import type { ProjectDetails } from '@renderer/store/slices/projects'

export interface ProjectDetailsCardProps {
  project: ProjectDetails | null
  loading: boolean
}

const roleColors: Record<string, string> = {
  admin: 'red',
  edit: 'blue',
  view: 'green'
}

export const ProjectDetailsCard = ({ project, loading }: ProjectDetailsCardProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')

  if (loading) {
    return (
      <Card title={t('details.summary.title')} style={{ minHeight: 320 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  if (!project) {
    return (
      <Card title={t('details.summary.title')} style={{ minHeight: 320 }}>
        <Typography.Paragraph type="secondary">
          {t('details.summary.empty')}
        </Typography.Paragraph>
      </Card>
    )
  }

  const formattedCreatedAt = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(project.createdAt))

  return (
    <Card title={`${project.name} (${project.key})`} style={{ minHeight: 320 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Text type="secondary">{t('details.summary.createdOn')}</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('details.summary.createdBy', { date: formattedCreatedAt, user: project.createdBy })}
          </Typography.Paragraph>
        </div>
        <div>
          <Typography.Text type="secondary">{t('details.summary.description')}</Typography.Text>
          <Typography.Paragraph>
            {project.description ?? t('details.summary.noDescription')}
          </Typography.Paragraph>
        </div>
        <div>
          <Typography.Text type="secondary">{t('details.summary.tags')}</Typography.Text>
          <Space size={6} wrap style={{ marginTop: 8 }}>
            {(project.tags ?? []).length > 0 ? (
              project.tags!.map((tag) => (
                <Tag key={tag} bordered={false} color="default">
                  {tag}
                </Tag>
              ))
            ) : (
              <Typography.Text type="secondary">{t('details.summary.noTags')}</Typography.Text>
            )}
          </Space>
        </div>
        <div>
          <Typography.Text type="secondary">{t('details.summary.members')}</Typography.Text>
          <List
            style={{ marginTop: 8 }}
            dataSource={project.members ?? []}
            locale={{ emptyText: t('details.summary.noMembers') }}
            renderItem={(member) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>{member.displayName}</Typography.Text>
                  <Space size={6}>
                    <Tag color={roleColors[member.role] ?? 'blue'}>{t(`list.role.${member.role}`)}</Tag>
                    <Typography.Text type="secondary">{member.username}</Typography.Text>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Space>
    </Card>
  )
}
