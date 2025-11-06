import { Card, Collapse, List, Skeleton, Space, Tag, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { CSSProperties, JSX } from 'react'

import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { ProjectDetails } from '@renderer/store/slices/projects'

export interface ProjectDetailsCardProps {
  project: ProjectDetails | null
  loading: boolean
  style?: CSSProperties
}

const roleColors: Record<string, string> = {
  admin: 'red',
  edit: 'blue',
  view: 'green'
}

export const ProjectDetailsCard = ({
  project,
  loading,
  style
}: ProjectDetailsCardProps): JSX.Element => {
  const { t, i18n } = useTranslation('projects')
  const showSkeleton = useDelayedLoading(loading)
  const cardStyle: CSSProperties = {
    minHeight: 260,
    ...style
  }

  if (showSkeleton) {
    return (
      <Card title={t('details.summary.title')} style={cardStyle}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  if (!project) {
    return (
      <Card title={t('details.summary.title')} style={cardStyle}>
        <Typography.Paragraph type="secondary">{t('details.summary.empty')}</Typography.Paragraph>
      </Card>
    )
  }

  const formattedCreatedAt = new Intl.DateTimeFormat(i18n.language, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(project.createdAt))
  const ownerName = project.owner?.displayName ?? project.owner?.username ?? project.createdBy
  const ownerUsername = project.owner?.username ?? project.createdBy

  return (
    <Card title={`${project.name} (${project.key})`} style={cardStyle}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Typography.Text type="secondary">{t('details.summary.owner')}</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 4 }}>
            {ownerName}
            {ownerUsername && ownerUsername !== ownerName ? (
              <Typography.Text type="secondary" style={{ marginLeft: 6 }}>
                ({ownerUsername})
              </Typography.Text>
            ) : null}
          </Typography.Paragraph>
        </div>
        <div>
          <Typography.Text type="secondary">{t('details.summary.createdOn')}</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {t('details.summary.createdBy', { date: formattedCreatedAt, user: ownerName })}
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
        <Collapse
          defaultActiveKey={[]}
          bordered={false}
          items={[
            {
              key: 'members',
              label: <Typography.Text strong>{t('details.summary.members')}</Typography.Text>,
              children: (
                <List
                  dataSource={project.members ?? []}
                  locale={{ emptyText: t('details.summary.noMembers') }}
                  style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}
                  renderItem={(member) => (
                    <List.Item style={{ paddingInline: 0 }}>
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>{member.displayName}</Typography.Text>
                        <Space size={6}>
                          <Tag color={roleColors[member.role] ?? 'blue'}>
                            {t(`list.role.${member.role}`)}
                          </Tag>
                          <Typography.Text type="secondary">{member.username}</Typography.Text>
                        </Space>
                      </Space>
                    </List.Item>
                  )}
                />
              )
            }
          ]}
          expandIconPosition="end"
          style={{ background: 'transparent' }}
        />
      </Space>
    </Card>
  )
}
