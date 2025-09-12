import type { JSX } from 'react'
import { Space, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@renderer/components/DataStates'
import { ProjectTasksTable } from '@renderer/pages/Projects/components/ProjectTasksTable'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import {
  buildPriorityOptions,
  buildStatusOptions,
  buildAssigneeOptions,
  filterTasks,
  resolveEffectiveTitle
} from '@renderer/pages/ProjectTasks/ProjectTasks.helpers'
import type {
  ProjectTasksPageProps,
  TaskFilters
} from '@renderer/pages/ProjectTasks/ProjectTasks.types'
import { TaskFiltersBar } from '@renderer/pages/ProjectTasks/components/TaskFiltersBar'

const ProjectTasksPage = ({}: ProjectTasksPageProps): JSX.Element => {
  const { project, projectLoading, tasks, tasksStatus } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TaskFilters>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dueDateRange: null
  })

  const effectiveTitle = useMemo(
    () => resolveEffectiveTitle(project?.name, t),
    [project?.name, t]
  )

  if (!project && !projectLoading) {
    return (
      <div style={{ marginTop: 64 }}>
        <EmptyState title={t('details.notFound')} />
      </div>
    )
  }

  const statusOptions = useMemo(() => buildStatusOptions(t), [t])

  const priorityOptions = useMemo(() => buildPriorityOptions(t), [t])
  const assigneeOptions = useMemo(
    () => buildAssigneeOptions(tasks, t),
    [tasks, t]
  )

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters]
  )

  const loading = tasksStatus === 'loading'

  const handleFiltersChange = (patch: Partial<TaskFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }

  const handleTaskNavigate = (taskId: string) => {
    navigate(`/tasks/${taskId}`)
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Typography.Title level={4}>{effectiveTitle}</Typography.Title>
      <TaskFiltersBar
        filters={filters}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        assigneeOptions={assigneeOptions}
        onChange={handleFiltersChange}
      />
      <ProjectTasksTable
        tasks={filteredTasks}
        loading={loading || projectLoading}
        onSelect={(task) => handleTaskNavigate(task.id)}
      />
    </Space>
  )
}

ProjectTasksPage.displayName = 'ProjectTasksPage'

export { ProjectTasksPage }
export default ProjectTasksPage
