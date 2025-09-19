import type { JSX } from 'react'
import { Form, Input, Modal, Space, Typography } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
import type { TaskFilters } from '@renderer/pages/ProjectTasks/ProjectTasks.types'
import { TaskFiltersBar } from '@renderer/pages/ProjectTasks/components/TaskFiltersBar'
import { ProjectTasksCardGrid } from '@renderer/pages/ProjectTasks/components/ProjectTasksCardGrid'

import TaskSavedViewsControls from '@renderer/pages/ProjectTasks/components/TaskSavedViewsControls'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  fetchViews,
  createView,
  deleteView,
  selectProjectSavedViews,
  selectProjectViewsStatus,
  selectSelectedViewId,
  selectViewsMutationStatus,
  selectSavedView
} from '@renderer/store/slices/views'
import type { SavedView } from '@renderer/store/slices/views/types'
import type { LoadStatus } from '@renderer/store/slices/tasks/types'
import { VIEW_COLUMN_VALUES } from '@main/services/view/schemas'

const ProjectTasksPage = (): JSX.Element => {
  const {
    projectId,
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
    dueDateRange: null,
    showCommentColumn: false
  })
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [tablePage, setTablePage] = useState(1)
  const [cardPage, setCardPage] = useState(1)
  const dispatch = useAppDispatch()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [viewForm] = Form.useForm<{ name: string }>()
  const lastAppliedViewId = useRef<string | null>(null)
  const isApplyingViewRef = useRef(false)
  const savedViewsSelector = useMemo(
    () => (projectId ? selectProjectSavedViews(projectId) : () => []),
    [projectId]
  )
  const savedViews = useAppSelector(savedViewsSelector)

  const viewsStatusSelector = useMemo(
    () =>
      projectId
        ? selectProjectViewsStatus(projectId)
        : (() => 'idle' as LoadStatus),
    [projectId]
  )
  const viewsStatus = useAppSelector(viewsStatusSelector)

  const selectedViewSelector = useMemo(
    () => (projectId ? selectSelectedViewId(projectId) : () => null),
    [projectId]
  )
  const selectedViewId = useAppSelector(selectedViewSelector)
  const mutationStatus = useAppSelector(selectViewsMutationStatus)
  const TABLE_PAGE_SIZE = 10
  const CARD_PAGE_SIZE = 8

  const effectiveTitle = useMemo(() => resolveEffectiveTitle(project?.name, t), [project?.name, t])

  const statusOptions = useMemo(() => buildStatusOptions(t), [t])

  const priorityOptions = useMemo(() => buildPriorityOptions(t), [t])
  const assigneeOptions = useMemo(() => buildAssigneeOptions(tasks, t), [tasks, t])

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])

  const applyFiltersFromView = useCallback(
    (view: SavedView) => {
      isApplyingViewRef.current = true
      setFilters(view.filters)
      setTablePage(1)
      setCardPage(1)
      if (projectId) {
        dispatch(selectSavedView({ projectId, viewId: view.id }))
      }
      lastAppliedViewId.current = view.id
      isApplyingViewRef.current = false
    },
    [dispatch, projectId]
  )

  const handleViewSelect = useCallback(
    (viewId: string | null) => {
      if (!projectId) {
        return
      }
      if (!viewId) {
        dispatch(selectSavedView({ projectId, viewId: null }))
        lastAppliedViewId.current = null
        return
      }
      const view = savedViews.find((candidate) => candidate.id === viewId)
      if (view) {
        applyFiltersFromView(view)
      }
    },
    [dispatch, projectId, savedViews, applyFiltersFromView]
  )

  const handleOpenSaveModal = useCallback(() => {
    viewForm.resetFields()
    setIsSaveModalOpen(true)
  }, [viewForm])

  const handleSaveView = useCallback(async () => {
    if (!projectId) {
      return
    }
    try {
      const { name } = await viewForm.validateFields()
      const payload = {
        projectId,
        name: name.trim(),
        filters,
        sort: null,
        columns: Array.from(VIEW_COLUMN_VALUES)
      }
      const created = await dispatch(createView(payload)).unwrap()
      applyFiltersFromView(created)
      setIsSaveModalOpen(false)
      viewForm.resetFields()
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
    }
  }, [projectId, viewForm, filters, dispatch, applyFiltersFromView])

  const handleDeleteView = useCallback(
    async (viewId: string) => {
      if (!projectId) {
        return
      }
      await dispatch(deleteView({ projectId, viewId })).unwrap()
    },
    [dispatch, projectId]
  )

  const loading = tasksStatus === 'loading'

  const handleFiltersChange = useCallback(
    (patch: Partial<TaskFilters>) => {
      setFilters((prev) => ({ ...prev, ...patch }))
      setTablePage(1)
      setCardPage(1)
      if (!isApplyingViewRef.current && projectId && selectedViewId) {
        dispatch(selectSavedView({ projectId, viewId: null }))
        lastAppliedViewId.current = null
      }
    },
    [dispatch, projectId, selectedViewId]
  )

  useEffect(() => {
    if (!projectId || viewsStatus !== 'idle') {
      return
    }
    void dispatch(fetchViews({ projectId }))
  }, [dispatch, projectId, viewsStatus])

  useEffect(() => {
    if (!projectId || !selectedViewId) {
      return
    }
    if (selectedViewId === lastAppliedViewId.current) {
      return
    }
    const selected = savedViews.find((view) => view.id === selectedViewId)
    if (selected) {
      applyFiltersFromView(selected)
    }
  }, [projectId, selectedViewId, savedViews, applyFiltersFromView])

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

  if (!project && !projectLoading) {
    return (
      <div style={{ marginTop: 64 }}>
        <EmptyState title={t('details.notFound')} />
      </div>
    )
  }

  return (
    <>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>
          {effectiveTitle}
        </Typography.Title>
        <TaskFiltersBar
        filters={filters}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions}
        assigneeOptions={assigneeOptions}
        onChange={handleFiltersChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreate={canManageTasks ? () => openTaskCreate() : undefined}
        canCreate={canManageTasks}
        secondaryActions={
          projectId ? (
            <TaskSavedViewsControls
              views={savedViews}
              selectedViewId={selectedViewId}
              onSelect={handleViewSelect}
              onCreate={handleOpenSaveModal}
              onDelete={handleDeleteView}
              loadingStatus={viewsStatus}
              mutationStatus={mutationStatus}
            />
          ) : null
        }
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
          showCommentColumn={filters.showCommentColumn}
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
      <Modal
        open={isSaveModalOpen}
        title={t('tasks.savedViews.modalTitle')}
        onCancel={() => {
          setIsSaveModalOpen(false)
          viewForm.resetFields()
        }}
        onOk={handleSaveView}
        confirmLoading={mutationStatus === 'loading'}
        destroyOnClose
      >
        <Form form={viewForm} layout="vertical">
          <Form.Item
            label={t('tasks.savedViews.nameLabel')}
            name="name"
            rules={[{ required: true, message: t('tasks.savedViews.nameRequired') }]}
          >
            <Input maxLength={80} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

ProjectTasksPage.displayName = 'ProjectTasksPage'

export { ProjectTasksPage }
export default ProjectTasksPage
