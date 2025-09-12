import type { JSX } from 'react'
import { Button, Space, Typography } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PlusOutlined } from '@ant-design/icons'

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
import { ProjectTasksCardGrid } from '@renderer/pages/ProjectTasks/components/ProjectTasksCardGrid'

const ProjectTasksPage = ({}: ProjectTasksPageProps): JSX.Element => {
  const {
    project,
    projectLoading,
    tasks,
    tasksStatus,
    canManageTasks,
    openTaskDetails,
    openTaskCreate,
    openTaskEdit,
    deleteTask,
    deletingTaskId
  } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const [filters, setFilters] = useState<TaskFilters>({
    searchQuery: '',
    status: 'all',
    priority: 'all',
    assignee: 'all',
    dueDateRange: null
  })
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [tablePage, setTablePage] = useState(1)
  const [cardPage, setCardPage] = useState(1)
  const TABLE_PAGE_SIZE = 10
  const CARD_PAGE_SIZE = 8

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
    setTablePage(1)
    setCardPage(1)
  }

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTasks.length / CARD_PAGE_SIZE))
    if (cardPage > maxPage) {
      setCardPage(maxPage)
    }
  }, [filteredTasks.length, cardPage])

  useEffect(() => {
    setTablePage(1)
    setCardPage(1)
  }, [viewMode])

  const handleTaskSelect = (taskId: string) => {
    openTaskDetails(taskId)
  }

  const handleTaskEdit = (taskId: string) => {
    openTaskEdit(taskId)
  }

  const handleTaskDelete = (taskId: string) => deleteTask(taskId)

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Space align="center" style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>{effectiveTitle}</Typography.Title>
        {canManageTasks ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => openTaskCreate()}>
            {t('tasks.actions.create')}
          </Button>
        ) : null}
      </Space>
      <TaskFiltersBar
        filters={filters}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        assigneeOptions={assigneeOptions}
        onChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === 'table' ? (
        <ProjectTasksTable
          tasks={filteredTasks}
          loading={loading || projectLoading}
          onSelect={(task) => handleTaskSelect(task.id)}
          onEdit={(task) => handleTaskEdit(task.id)}
          onDelete={(task) => handleTaskDelete(task.id)}
          canManage={canManageTasks}
          deletingTaskId={deletingTaskId}
          pagination={{
            current: tablePage,
            pageSize: TABLE_PAGE_SIZE,
            onChange: (page) => setTablePage(page)
          }}
        />
      ) : (
        <ProjectTasksCardGrid
          tasks={filteredTasks}
          loading={loading || projectLoading}
          page={cardPage}
          pageSize={CARD_PAGE_SIZE}
          onPageChange={setCardPage}
          onSelect={(task) => handleTaskSelect(task.id)}
          onEdit={(task) => handleTaskEdit(task.id)}
          onDelete={(task) => handleTaskDelete(task.id)}
          canManage={canManageTasks}
          deletingTaskId={deletingTaskId}
        />
      )}
    </Space>
  )
}

ProjectTasksPage.displayName = 'ProjectTasksPage'

export { ProjectTasksPage }
export default ProjectTasksPage
