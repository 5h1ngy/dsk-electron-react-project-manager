import { Card, List, Skeleton, Space, Tag, Typography } from 'antd'

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

export const ProjectDetailsCard = ({
  project,
  loading
}: ProjectDetailsCardProps): JSX.Element => {
  if (loading) {
    return (
      <Card title="Dettagli progetto" style={{ minHeight: 320 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  if (!project) {
    return (
      <Card title="Dettagli progetto" style={{ minHeight: 320 }}>
        <Typography.Paragraph type="secondary">
          Seleziona un progetto per visualizzare i dettagli
        </Typography.Paragraph>
      </Card>
    )
  }

  const formattedCreatedAt = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(project.createdAt))

  return (
    <Card title={`${project.name} (${project.key})`} style={{ minHeight: 320 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Typography.Text type="secondary">Creato il</Typography.Text>
          <Typography.Paragraph style={{ marginBottom: 0 }}>
            {formattedCreatedAt} da {project.createdBy}
          </Typography.Paragraph>
        </div>
        <div>
          <Typography.Text type="secondary">Descrizione</Typography.Text>
          <Typography.Paragraph>
            {project.description ?? 'Nessuna descrizione disponibile'}
          </Typography.Paragraph>
        </div>
        <div>
          <Typography.Text type="secondary">Membri</Typography.Text>
          <List
            style={{ marginTop: 8 }}
            dataSource={project.members ?? []}
            locale={{ emptyText: 'Nessun membro assegnato' }}
            renderItem={(member) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Space direction="vertical" size={2}>
                  <Typography.Text strong>{member.displayName}</Typography.Text>
                  <Space size={6}>
                    <Tag color={roleColors[member.role] ?? 'blue'}>{member.role}</Tag>
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
