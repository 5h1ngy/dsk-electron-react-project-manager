import type { JSX } from 'react'
import { Empty, Space, Spin, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ProjectBoard } from '@renderer/pages/Projects/components/ProjectBoard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import {
  BOARD_CONTAINER_STYLE,
  EMPTY_STATE_STYLE,
  LOADING_SECTION_STYLE
} from '@renderer/pages/ProjectBoard/ProjectBoard.helpers'
import type { ProjectBoardPageProps } from '@renderer/pages/ProjectBoard/ProjectBoard.types'

const ProjectBoardPage = ({}: ProjectBoardPageProps): JSX.Element => {
  const { project, projectLoading, canManageTasks } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const navigate = useNavigate()

  if (projectLoading) {
    return (
      <Space align="center" style={LOADING_SECTION_STYLE}>
        <Spin />
      </Space>
    )
  }

  if (!project) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={EMPTY_STATE_STYLE}
      />
    )
  }

  return (
    <Space direction="vertical" size={24} style={BOARD_CONTAINER_STYLE}>
      <Typography.Title level={4}>{t('details.kanbanTitle')}</Typography.Title>
      <ProjectBoard
        project={project}
        canManageTasks={canManageTasks}
        onTaskSelect={(task) => navigate(`/tasks/${task.id}`)}
      />
    </Space>
  )
}

ProjectBoardPage.displayName = 'ProjectBoardPage'

export { ProjectBoardPage }
export default ProjectBoardPage
