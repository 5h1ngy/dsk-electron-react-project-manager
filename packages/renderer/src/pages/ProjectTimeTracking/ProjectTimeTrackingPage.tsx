import type { JSX } from 'react'

import ProjectTimeTrackingView from '@renderer/pages/ProjectTasks/components/ProjectTimeTrackingView'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout/useProjectRouteContext'

const ProjectTimeTrackingPage = (): JSX.Element => {
  const { projectId, tasks, canManageTasks } = useProjectRouteContext()

  return (
    <ProjectTimeTrackingView
      projectId={projectId}
      tasks={tasks}
      canManage={canManageTasks}
    />
  )
}

ProjectTimeTrackingPage.displayName = 'ProjectTimeTrackingPage'

export default ProjectTimeTrackingPage
