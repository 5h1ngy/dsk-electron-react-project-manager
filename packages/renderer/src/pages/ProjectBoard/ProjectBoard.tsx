import type { JSX } from 'react'
import { Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
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
  const showSkeleton = useDelayedLoading(projectLoading)

  if (showSkeleton) {
    return (
      <Space align="center" style={LOADING_SECTION_STYLE}>
        <LoadingSkeleton variant="cards" items={4} />
      </Space>
    )
  }

  if (!project) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <EmptyState title={t('details.notFound')} />
      </div>
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
