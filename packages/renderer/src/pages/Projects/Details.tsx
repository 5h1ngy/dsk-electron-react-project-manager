import { Button, Empty, Space, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { ProjectDetailsCard } from './components/ProjectDetailsCard'
import { ProjectTasksTable } from './components/ProjectTasksTable'
import { ProjectBoard } from './components/ProjectBoard'
import { TaskDetailDrawer } from './components/TaskDetailDrawer'
import { useProjectDetails } from './hooks/useProjectDetails'
import type { TaskDetails } from '@renderer/store/slices/tasks'

const ProjectDetailsPage = (): JSX.Element => {
  const { t } = useTranslation('projects')
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null)

  useEffect(() => {
    setSelectedTask(null)
  }, [projectId])

  const { project, tasks, tasksStatus, projectLoading, refresh, canManageTasks, messageContext } =
    useProjectDetails(projectId)

  const tasksLoading = tasksStatus === 'loading'

  if (!projectId) {
    return <Empty description={t('details.missingId')} />
  }

  if (!project && !projectLoading) {
    return (
      <Empty
        description={t('details.notFound')}
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        style={{ marginTop: 64 }}
      >
        <Button type="primary" onClick={() => navigate('/projects')}>
          {t('details.backToList')}
        </Button>
      </Empty>
    )
  }

  return (
    <Space direction="vertical" size={24} style={{ width: '100%' }}>
      {messageContext}
      <Space
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography.Title level={3} style={{ marginBottom: 0 }}>
          {project?.name ?? t('details.loading')}
        </Typography.Title>
        <Button icon={<ReloadOutlined />} onClick={refresh}>
          {t('details.refresh')}
        </Button>
      </Space>
      <ProjectDetailsCard project={project ?? null} loading={projectLoading && !project} />
      <div>
        <Typography.Title level={4}>{t('details.tasksTitle')}</Typography.Title>
        <ProjectTasksTable
          tasks={tasks}
          loading={tasksLoading}
          onSelect={(task) => setSelectedTask(task)}
        />
      </div>
      <div>
        <Typography.Title level={4}>{t('details.kanbanTitle')}</Typography.Title>
        <ProjectBoard
          project={project ?? null}
          canManageTasks={canManageTasks}
          onTaskSelect={(task) => setSelectedTask(task)}
        />
      </div>
      <TaskDetailDrawer
        task={selectedTask}
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      />
    </Space>
  )
}

export default ProjectDetailsPage
