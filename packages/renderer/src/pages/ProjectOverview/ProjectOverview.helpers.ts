import type { ProjectMetrics } from '@renderer/pages/ProjectOverview/ProjectOverview.types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'

export const calculateProjectMetrics = (tasks: TaskDetails[]): ProjectMetrics => {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  return {
    total,
    active: total - done,
    done
  }
}
