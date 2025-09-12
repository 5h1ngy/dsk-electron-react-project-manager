import type { JSX } from 'react'
import { Empty, Input, Select, Space, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { ProjectTasksTable } from '@renderer/pages/Projects/components/ProjectTasksTable'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import {
  buildPriorityOptions,
  buildStatusOptions,
  filterTasks,
  resolveEffectiveTitle
} from '@renderer/pages/ProjectTasks/ProjectTasks.helpers'
import type {
  ProjectTasksPageProps,
  TaskFilters
} from '@renderer/pages/ProjectTasks/ProjectTasks.types'

const ProjectTasksPage = ({}: ProjectTasksPageProps): JSX.Element => {
  const { project, projectLoading, tasks, tasksStatus } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const navigate = useNavigate()
  const [filters, setFilters] = useState<TaskFilters>({
    searchQuery: '',
    status: 'all',
    priority: 'all'
  })

  const effectiveTitle = useMemo(
    () => resolveEffectiveTitle(project?.name, t),
    [project?.name, t]
  )

  if (!project && !projectLoading) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      />
    )
  }

  const statusOptions = useMemo(() => buildStatusOptions(t), [t])

  const priorityOptions = useMemo(() => buildPriorityOptions(t), [t])

  const filteredTasks = useMemo(
    () => filterTasks(tasks, filters),
    [tasks, filters]
  )

  const loading = tasksStatus === 'loading'

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value as TaskFilters['status'] }))
  }

  const handlePriorityChange = (value: string) => {
    setFilters((prev) => ({ ...prev, priority: value as TaskFilters['priority'] }))
  }

  const handleTaskNavigate = (taskId: string) => {
    navigate(`/tasks/${taskId}`)
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Typography.Title level={4}>{effectiveTitle}</Typography.Title>
      <Space size="middle" wrap>
        <Input.Search
          allowClear
          placeholder={t('details.tasksSearchPlaceholder')}
          value={filters.searchQuery}
          onChange={(event) => handleSearch(event.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 320 }}
        />
        <Select
          value={filters.status}
          options={statusOptions}
          onChange={handleStatusChange}
          style={{ width: 200 }}
        />
        <Select
          value={filters.priority}
          options={priorityOptions}
          onChange={handlePriorityChange}
          style={{ width: 200 }}
        />
      </Space>
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
