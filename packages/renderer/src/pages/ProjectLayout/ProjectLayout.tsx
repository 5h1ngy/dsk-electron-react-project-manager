import { ReloadOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Skeleton, Space, Tabs, Typography } from 'antd'
import { useMemo } from 'react'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'

import { EmptyState } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import { useProjectDetails } from '@renderer/pages/Projects/hooks/useProjectDetails'
import { useTaskModals } from '@renderer/pages/Projects/hooks/useTaskModals'
import { TaskFormModal } from '@renderer/pages/Projects/components/TaskFormModal'
import { TaskDetailsModal } from '@renderer/pages/Projects/components/TaskDetailsModal'
import {
  buildBreadcrumbItems,
  buildTabItems,
  buildTabLabelMap,
  resolveActiveTab
} from '@renderer/pages/ProjectLayout/ProjectLayout.helpers'
import type {
  ProjectRouteContext,
  ProjectTabKey
} from '@renderer/pages/ProjectLayout/ProjectLayout.types'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'

export const useProjectRouteContext = (): ProjectRouteContext =>
  useOutletContext<ProjectRouteContext>()

const ProjectLayout = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation('projects')

  const {
    project,
    tasks,
    tasksStatus,
    projectLoading,
    refresh,
    canManageTasks,
    messageContext
  } = useProjectDetails(projectId)

  const taskModals = useTaskModals({
    project: project ?? null,
    tasks,
    projectId: projectId ?? null,
    canManageTasks
  })

  const showSkeleton = useDelayedLoading(projectLoading)

  const basePath = `/projects/${projectId ?? ''}`
  const activeKey = projectId ? resolveActiveTab(location.pathname, basePath) : 'overview'

  const tabItems = useMemo(() => buildTabItems(t), [t])

  const tabLabelMap = useMemo(() => buildTabLabelMap(t), [t])

  const breadcrumbItems = useMemo(
    () =>
      buildBreadcrumbItems({
        t,
        project: project ?? null,
        tabLabelMap,
        activeKey,
        navigate
      }),
    [t, project, tabLabelMap, activeKey, navigate]
  )

  if (!projectId) {
    return (
      <div style={{ marginTop: 64 }}>
        <EmptyState title={t('details.missingId')} />
      </div>
    )
  }

  if (!project && !projectLoading) {
    return (
      <div style={{ marginTop: 64 }}>
        <EmptyState
          title={t('details.notFound')}
          action={
            <Button type="primary" onClick={() => navigate('/projects')}>
              {t('details.backToList')}
            </Button>
          }
        />
      </div>
    )
  }

  const contextValue: ProjectRouteContext = {
    projectId: projectId ?? '',
    project: project ?? null,
    tasks,
    tasksStatus,
    projectLoading,
    refresh,
    canManageTasks,
    openTaskDetails: taskModals.openDetail,
    openTaskCreate: (options) => taskModals.openCreate(options),
    openTaskEdit: taskModals.openEdit,
    deleteTask: taskModals.deleteTask,
    deletingTaskId: taskModals.deletingTaskId
  }

  const handleTabChange = (key: string): void => {
    const tabKey = key as ProjectTabKey
    switch (tabKey) {
      case 'tasks':
        navigate(`${basePath}/tasks`)
        break
      case 'board':
        navigate(`${basePath}/board`)
        break
      default:
        navigate(`${basePath}`)
        break
    }
  }

  return (
    <>
      <ShellHeaderPortal>
        <Breadcrumb items={breadcrumbItems} />
      </ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {messageContext}
        {taskModals.taskMessageContext}
        <Space
          align="center"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap'
          }}
        >
        {showSkeleton ? (
          <Space direction="vertical" size={4}>
            <Skeleton.Input active size="large" style={{ width: 240 }} />
            <Skeleton.Input active size="small" style={{ width: 120 }} />
          </Space>
        ) : (
          <div>
            <Typography.Title level={3} style={{ marginBottom: 0 }}>
              {project?.name}
            </Typography.Title>
            {project?.key ? (
              <Typography.Text type="secondary">{project.key}</Typography.Text>
            ) : null}
          </div>
        )}
        <Button
          icon={<ReloadOutlined />}
          onClick={refresh}
          loading={projectLoading}
          disabled={projectLoading}
        >
          {t('details.refresh')}
        </Button>
      </Space>
      <Tabs
        activeKey={activeKey}
        items={tabItems}
        onChange={handleTabChange}
        destroyInactiveTabPane
      />
      <Outlet context={contextValue} />
    </Space>
    <TaskDetailsModal
      open={taskModals.isDetailOpen}
      task={taskModals.detailTask}
      allowManage={canManageTasks}
      onClose={taskModals.closeDetail}
      onEdit={(task) => taskModals.openEdit(task.id)}
      onDelete={(task) => taskModals.deleteTask(task.id)}
      deleting={taskModals.deletingTaskId !== null && taskModals.deletingTaskId === taskModals.detailTask?.id}
    />
    <TaskFormModal
      open={taskModals.isEditorOpen}
      mode={taskModals.editorMode ?? 'create'}
      onCancel={taskModals.closeEditor}
      onSubmit={taskModals.submitEditor}
      form={taskModals.editorForm}
      submitting={taskModals.submitting}
      assigneeOptions={taskModals.assigneeOptions}
      taskTitle={taskModals.editorTask?.title}
    />
    </>
  )
}

ProjectLayout.displayName = 'ProjectLayout'

export { ProjectLayout }
export default ProjectLayout
