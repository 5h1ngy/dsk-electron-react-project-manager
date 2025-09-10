import { Empty, Space, Spin, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ProjectBoard } from '@renderer/pages/Projects/components/ProjectBoard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'

const ProjectBoardPage = () => {
  const { project, projectLoading, canManageTasks } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const navigate = useNavigate()

  if (projectLoading) {
    return (
      <Space
        align="center"
        style={{ width: '100%', justifyContent: 'center', padding: '48px 0' }}
      >
        <Spin />
      </Space>
    )
  }

  if (!project) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      />
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Typography.Title level={4}>{t('details.kanbanTitle')}</Typography.Title>
      <ProjectBoard
        project={project}
        canManageTasks={canManageTasks}
        onTaskSelect={(task) => navigate(`/tasks/${task.id}`)}
      />
    </Space>
  )
}

export default ProjectBoardPage
