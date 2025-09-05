import { Empty, Input, Select, Space, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import type { TaskDetails } from '@renderer/store/slices/tasks'

import { ProjectTasksTable } from './components/ProjectTasksTable'
import { useProjectRouteContext } from './ProjectLayout'

const ProjectTasksPage = () => {
  const { project, projectLoading, tasks, tasksStatus } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TaskDetails['status']>('all')
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskDetails['priority']>('all')

  const effectiveTitle = useMemo(
    () => project?.name ?? t('details.tasksTitle'),
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

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: t('details.filters.statusOptions.all') },
      { value: 'todo', label: t('details.status.todo') },
      { value: 'in_progress', label: t('details.status.in_progress') },
      { value: 'blocked', label: t('details.status.blocked') },
      { value: 'done', label: t('details.status.done') }
    ],
    [t]
  )

  const priorityOptions = useMemo(
    () => [
      { value: 'all', label: t('details.filters.priorityOptions.all') },
      { value: 'low', label: t('details.priority.low') },
      { value: 'medium', label: t('details.priority.medium') },
      { value: 'high', label: t('details.priority.high') },
      { value: 'critical', label: t('details.priority.critical') }
    ],
    [t]
  )

  const filteredTasks = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase()
    if (!needle) {
      return tasks
    }
    return tasks.filter((task) => {
      const haystacks = [
        task.key,
        task.title,
        task.description ?? '',
        task.assignee?.displayName ?? ''
      ]
      const matchesSearch = haystacks.some((value) => value.toLowerCase().includes(needle))
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter])

  const loading = tasksStatus === 'loading'

  const handleSearch = (value: string) => {
    setSearchQuery(value)
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
          value={searchQuery}
          onChange={(event) => handleSearch(event.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 320 }}
        />
        <Select
          value={statusFilter}
          options={statusOptions}
          onChange={(value) => setStatusFilter(value as typeof statusFilter)}
          style={{ width: 200 }}
        />
        <Select
          value={priorityFilter}
          options={priorityOptions}
          onChange={(value) => setPriorityFilter(value as typeof priorityFilter)}
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

export default ProjectTasksPage
