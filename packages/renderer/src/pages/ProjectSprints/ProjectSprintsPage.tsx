import type { JSX } from 'react'

import ProjectSprintBoard from '@renderer/pages/ProjectTasks/components/ProjectSprintBoard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout/useProjectRouteContext'

const ProjectSprintsPage = (): JSX.Element => {
  const { projectId, canManageTasks } = useProjectRouteContext()

  return <ProjectSprintBoard projectId={projectId} canManage={canManageTasks} />
}

ProjectSprintsPage.displayName = 'ProjectSprintsPage'

export default ProjectSprintsPage
