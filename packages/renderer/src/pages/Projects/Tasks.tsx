import { Empty, Space, Typography } from 'antd'
import type { TablePaginationConfig } from 'antd/es/table'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks'

import { ProjectTasksTable } from './components/ProjectTasksTable'
import { TaskDetailDrawer } from './components/TaskDetailDrawer'
import { useProjectRouteContext } from './ProjectLayout'

const DEFAULT_PAGE_SIZE = 10

const ProjectTasksPage = () => {
  const { project, projectLoading, tasks, tasksStatus } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null)
  const [pagination, setPagination] = useState<{ current: number; pageSize: number }>({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE
  })

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

  const loading = tasksStatus === 'loading'
  const paginationConfig: TablePaginationConfig = {
    current: pagination.current,
    pageSize: pagination.pageSize,
    total: tasks.length,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    onChange: (page, pageSize) => {
      setPagination({ current: page, pageSize: pageSize ?? DEFAULT_PAGE_SIZE })
    }
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Typography.Title level={4}>{effectiveTitle}</Typography.Title>
      <ProjectTasksTable
        tasks={tasks}
        loading={loading || projectLoading}
        onSelect={(task) => setSelectedTask(task)}
        pagination={paginationConfig}
      />
      <TaskDetailDrawer
        task={selectedTask}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
    </Space>
  )
}

export default ProjectTasksPage
