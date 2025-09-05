import { Empty, Space, Spin, Typography } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks'

import { ProjectBoard } from './components/ProjectBoard'
import { TaskDetailDrawer } from './components/TaskDetailDrawer'
import { useProjectRouteContext } from './ProjectLayout'

const ProjectBoardPage = () => {
  const { project, projectLoading, canManageTasks } = useProjectRouteContext()
  const { t } = useTranslation('projects')
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null)

  if (projectLoading) {
    return (
      <Space
        align="center"
        style={{ width: '100%', justifyContent: 'center', padding: '48px 0' }}
      >
        <Spin />
      </Space>
    )
  }

  if (!project) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      />
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      <Typography.Title level={4}>{t('details.kanbanTitle')}</Typography.Title>
      <ProjectBoard
        project={project}
        canManageTasks={canManageTasks}
        onTaskSelect={(task) => setSelectedTask(task)}
      />
      <TaskDetailDrawer
        task={selectedTask}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
    </Space>
  )
}

export default ProjectBoardPage
