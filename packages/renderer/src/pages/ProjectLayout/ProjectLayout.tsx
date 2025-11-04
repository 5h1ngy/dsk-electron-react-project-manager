import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Space, Tabs, message } from 'antd'
import { useCallback, useEffect, useMemo, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@renderer/components/DataStates'
import { useProjectDetails } from '@renderer/pages/Projects/hooks/useProjectDetails'
import { useTaskModals } from '@renderer/pages/Projects/hooks/useTaskModals'
import { TaskFormModal } from '@renderer/pages/Projects/components/TaskFormModal'
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
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { useAppSelector } from '@renderer/store/hooks'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'

const ProjectLayout = (): JSX.Element => {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation('projects')
  const currentUser = useAppSelector(selectCurrentUser)
  const currentUserId = currentUser?.id ?? null

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
    canManageWiki,
    refreshWiki,
    messageContext
  } = useProjectDetails(projectId)

  const canDeleteTask = useCallback(
    (task: TaskDetails) => {
      if (canManageTasks) {
        return true
      }
      if (!currentUserId) {
        return false
      }
      return task.owner.id === currentUserId
    },
    [canManageTasks, currentUserId]
  )

  const taskModals = useTaskModals({
    project: project ?? null,
    tasks,
    projectId: projectId ?? null,
    statuses: taskStatuses,
    canManageTasks,
    canDeleteTask
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
      const next = new URLSearchParams(searchParams)
      next.delete('task')
      setSearchParams(next, { replace: true })
      navigate(`/projects/${projectId}/tasks/${located.id}`)
      return
    }

    if (tasksStatus === 'succeeded') {
      const next = new URLSearchParams(searchParams)
      next.delete('task')
      setSearchParams(next, { replace: true })
    }
  }, [navigate, projectId, searchParams, setSearchParams, tasks, tasksStatus])

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
  const breadcrumbStyle = useBreadcrumbStyle(emphasizedBreadcrumbItems)

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

  const handleOpenTaskDetails = useCallback(
    (taskId: string) => {
      if (!projectId) {
        return
      }
      navigate(`/projects/${projectId}/tasks/${taskId}`)
    },
    [navigate, projectId]
  )

  const handleOpenTaskEdit = useCallback(
    (taskId: string) => {
      if (!projectId) {
        return
      }
      if (!canManageTasks) {
        message.warning(
          t('permissions.tasksUpdateDenied', {
            defaultValue: 'Non hai i permessi per modificare questo task.'
          })
        )
        return
      }
      navigate(`/projects/${projectId}/tasks/${taskId}?mode=edit`)
    },
    [canManageTasks, navigate, projectId, t]
  )

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
      case 'wiki':
        refreshWiki()
        break
      default:
        refresh()
        break
    }
  }, [activeKey, projectId, refresh, refreshNotes, refreshTasks, refreshWiki])

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
    canManageWiki,
    canDeleteTask,
    openTaskDetails: handleOpenTaskDetails,
    openTaskCreate: (options) => taskModals.openCreate(options),
    openTaskEdit: handleOpenTaskEdit,
    deleteConfirmTask: taskModals.deleteConfirmTask,
    openDeleteConfirm: taskModals.openDeleteConfirm,
    closeDeleteConfirm: taskModals.closeDeleteConfirm,
    confirmDelete: taskModals.confirmDelete,
    deletingTaskId: taskModals.deletingTaskId,
    notes,
    notesStatus,
    canManageNotes,
    refreshNotes,
    refreshWiki
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
      case 'wiki':
        navigate(`${basePath}/wiki`)
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
            {t('details.backToList')}
          </Button>
          <Breadcrumb items={emphasizedBreadcrumbItems} style={breadcrumbStyle} />
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
      <TaskFormModal
        open={taskModals.isEditorOpen}
        mode={taskModals.editorMode ?? 'create'}
        onCancel={taskModals.closeEditor}
        onSubmit={taskModals.submitEditor}
        form={taskModals.editorForm}
        submitting={taskModals.submitting}
        assigneeOptions={taskModals.assigneeOptions}
        ownerOptions={taskModals.ownerOptions}
        statusOptions={taskModals.statusOptions}
        taskTitle={taskModals.editorTask?.title}
      />
    </>
  )
}

ProjectLayout.displayName = 'ProjectLayout'

export { ProjectLayout }
export default ProjectLayout






