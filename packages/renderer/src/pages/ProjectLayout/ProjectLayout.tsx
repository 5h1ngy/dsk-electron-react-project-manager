import { ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Skeleton, Space, Tabs, Typography } from 'antd'
import { useEffect, useMemo, useState, type JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { EmptyState } from '@renderer/components/DataStates'
import TaskSearchDrawer from '@renderer/components/TaskSearch/TaskSearchDrawer'
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
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import type { TaskDetails } from '@renderer/store/slices/tasks'

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
    projectLoading,
    refresh,
    canManageTasks,
    notes,
    notesStatus,
    canManageNotes,
    refreshNotes,
    messageContext
  } = useProjectDetails(projectId)

  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const taskModals = useTaskModals({
    project: project ?? null,
    tasks,
    projectId: projectId ?? null,
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

  const emphasizedBreadcrumbItems = usePrimaryBreadcrumb(breadcrumbItems)

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
      case 'board':
        navigate(`${basePath}/board`)
        break
      case 'notes':
        navigate(`${basePath}/notes`)
        break
      default:
        navigate(`${basePath}`)
        break
    }
  }

  const handleSearchSelect = (task: TaskDetails) => {
    setIsSearchOpen(false)
    if (task.projectId !== projectId) {
      const params = new URLSearchParams()
      params.set('task', task.id)
      navigate(`/projects/${task.projectId}?${params.toString()}`)
      return
    }
    taskModals.openDetail(task.id)
  }

  return (
    <>
      <ShellHeaderPortal>
        <Breadcrumb items={emphasizedBreadcrumbItems} />
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
          <Space size={12}>
            <Button
              icon={<ReloadOutlined />}
              onClick={refresh}
              loading={projectLoading}
              disabled={projectLoading}
            >
              {t('details.refresh')}
            </Button>
            <Button icon={<SearchOutlined />} onClick={() => setIsSearchOpen(true)}>
              {t('search.button')}
            </Button>
          </Space>
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
        deleting={
          taskModals.deletingTaskId !== null &&
          taskModals.deletingTaskId === taskModals.detailTask?.id
        }
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
      <TaskSearchDrawer
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={handleSearchSelect}
      />
    </>
  )
}

ProjectLayout.displayName = 'ProjectLayout'

export { ProjectLayout }
export default ProjectLayout
