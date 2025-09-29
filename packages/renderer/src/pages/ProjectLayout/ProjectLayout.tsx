import { ReloadOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Space, Tabs } from 'antd'
import { useCallback, useEffect, useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@renderer/components/DataStates'
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
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'

const ProjectLayout = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation('projects')

  const {
    project,
    tasks,
    tasksStatus,
    taskStatuses,
    taskStatusesStatus,
    projectLoading,
    refresh,
    refreshTasks,
    refreshTaskStatuses,
    canManageTasks,
    notes,
    notesStatus,
    canManageNotes,
    refreshNotes,
    messageContext
  } = useProjectDetails(projectId)

  const taskModals = useTaskModals({
    project: project ?? null,
    tasks,
    projectId: projectId ?? null,
    statuses: taskStatuses,
    canManageTasks
  })

  useEffect(() => {
    if (!projectId) {
      return
    }

    const taskToFocus = searchParams.get('task')
    if (!taskToFocus) {
      return
    }

    const located = tasks.find((task) => task.id === taskToFocus)
    if (located) {
      taskModals.openDetail(located.id)
      const next = new URLSearchParams(searchParams)
      next.delete('task')
      setSearchParams(next, { replace: true })
      return
    }

    if (tasksStatus === 'succeeded') {
      const next = new URLSearchParams(searchParams)
      next.delete('task')
      setSearchParams(next, { replace: true })
    }
  }, [projectId, searchParams, setSearchParams, taskModals, tasks, tasksStatus])

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

  const emphasizedBreadcrumbItems = usePrimaryBreadcrumb(breadcrumbItems)

  const refreshLoading = useMemo(() => {
    switch (activeKey) {
      case 'tasks':
        return tasksStatus === 'loading'
      case 'notes':
        return notesStatus === 'loading'
      default:
        return projectLoading
    }
  }, [activeKey, projectLoading, tasksStatus, notesStatus])

  const handleRefreshClick = useCallback(() => {
    if (!projectId) {
      return
    }
    switch (activeKey) {
      case 'tasks':
        refreshTasks()
        break
      case 'notes':
        refreshNotes()
        break
      default:
        refresh()
        break
    }
  }, [activeKey, projectId, refresh, refreshNotes, refreshTasks])

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
    taskStatuses,
    taskStatusesStatus,
    projectLoading,
    refresh,
    refreshTasks,
    refreshTaskStatuses,
    canManageTasks,
    openTaskDetails: taskModals.openDetail,
    openTaskCreate: (options) => taskModals.openCreate(options),
    openTaskEdit: taskModals.openEdit,
    deleteTask: taskModals.deleteTask,
    deletingTaskId: taskModals.deletingTaskId,
    notes,
    notesStatus,
    canManageNotes,
    refreshNotes
  }

  const handleTabChange = (key: string): void => {
    const tabKey = key as ProjectTabKey
    switch (tabKey) {
      case 'tasks':
        navigate(`${basePath}/tasks`)
        break
      case 'notes':
        navigate(`${basePath}/notes`)
        break
      default:
        navigate(`${basePath}`)
        break
    }
  }

  return (
    <>
      <ShellHeaderPortal>
        <Space align="center" size={12} wrap style={{ width: '100%' }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshClick}
            loading={refreshLoading}
            disabled={refreshLoading || !projectId}
          >
            {t('details.refresh')}
          </Button>
          <Breadcrumb items={emphasizedBreadcrumbItems} />
        </Space>
      </ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {messageContext}
        {taskModals.taskMessageContext ? (
          <div key="task-message-context" style={{ display: 'contents' }}>
            {taskModals.taskMessageContext}
          </div>
        ) : null}
        <Tabs activeKey={activeKey} items={tabItems} onChange={handleTabChange} destroyOnHidden />
        <Outlet context={contextValue} />
      </Space>
      <TaskDetailsModal
        open={taskModals.isDetailOpen}
        task={taskModals.detailTask}
        allowManage={canManageTasks}
        onClose={taskModals.closeDetail}
        onDelete={(task) => taskModals.deleteTask(task.id)}
        deleting={
          taskModals.deletingTaskId !== null &&
          taskModals.deletingTaskId === taskModals.detailTask?.id
        }
        assigneeOptions={taskModals.assigneeOptions}
        statusOptions={taskModals.statusOptions}
      />
      <TaskFormModal
        open={taskModals.isEditorOpen}
        mode={taskModals.editorMode ?? 'create'}
        onCancel={taskModals.closeEditor}
        onSubmit={taskModals.submitEditor}
        form={taskModals.editorForm}
        submitting={taskModals.submitting}
        assigneeOptions={taskModals.assigneeOptions}
        statusOptions={taskModals.statusOptions}
        taskTitle={taskModals.editorTask?.title}
      />
    </>
  )
}

ProjectLayout.displayName = 'ProjectLayout'

export { ProjectLayout }
export default ProjectLayout
