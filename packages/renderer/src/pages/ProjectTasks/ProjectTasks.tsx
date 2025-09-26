import type { JSX } from 'react'
import { Form, Input, Modal, Space } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EmptyState } from '@renderer/components/DataStates'
import { ProjectTasksTable } from '@renderer/pages/Projects/components/ProjectTasksTable'
import { ProjectBoard } from '@renderer/pages/Projects/components/ProjectBoard'
import { useProjectRouteContext } from '@renderer/pages/ProjectLayout'
import {
  buildPriorityOptions,
  buildStatusOptions,
  buildAssigneeOptions,
  filterTasks
} from '@renderer/pages/ProjectTasks/ProjectTasks.helpers'
import type { TaskFilters } from '@renderer/pages/ProjectTasks/ProjectTasks.types'
import { TaskFiltersBar } from '@renderer/pages/ProjectTasks/components/TaskFiltersBar'
import { ProjectTasksCardGrid } from '@renderer/pages/ProjectTasks/components/ProjectTasksCardGrid'
import { ProjectTasksList } from '@renderer/pages/Projects/components/ProjectTasksList'

import TaskSavedViewsControls from '@renderer/pages/ProjectTasks/components/TaskSavedViewsControls'
import TaskColumnVisibilityControls, {
  OPTIONAL_TASK_COLUMNS,
  type OptionalTaskColumn
} from '@renderer/pages/ProjectTasks/components/TaskColumnVisibilityControls'
import TaskStatusManager from '@renderer/pages/ProjectTasks/components/TaskStatusManager'
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

const getColumnsForView = (selected: ReadonlyArray<OptionalTaskColumn>) =>
  VIEW_COLUMN_VALUES.filter((column) =>
    column === 'commentCount' ? selected.includes('commentCount') : true
  )

const extractOptionalColumns = (columns: ReadonlyArray<string>): OptionalTaskColumn[] =>
  OPTIONAL_TASK_COLUMNS.filter((column) => columns.includes(column))

const ProjectTasksPage = (): JSX.Element => {
  const {
    projectId,
    project,
    projectLoading,
    tasks,
    tasksStatus,
    taskStatuses,
    taskStatusesStatus,
    refreshTasks,
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
  const [visibleColumns, setVisibleColumns] = useState<OptionalTaskColumn[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'list' | 'cards' | 'board'>('board')
  const [tablePage, setTablePage] = useState(1)
  const [cardPage, setCardPage] = useState(1)
  const [listPage, setListPage] = useState(1)
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
  const LIST_PAGE_SIZE = 12

  const statusOptions = useMemo(() => buildStatusOptions(t, taskStatuses), [t, taskStatuses])
  const statusLabelMap = useMemo(() => {
    const labels: Record<string, string> = {}
    taskStatuses.forEach((status) => {
      labels[status.key] = status.label
    })
    return labels
  }, [taskStatuses])

  const priorityOptions = useMemo(() => buildPriorityOptions(t), [t])
  const assigneeOptions = useMemo(() => buildAssigneeOptions(tasks, t), [tasks, t])

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters])
  const tableColumns = useMemo(
    () => getColumnsForView(visibleColumns),
    [visibleColumns]
  )

  const applyFiltersFromView = useCallback(
    (view: SavedView) => {
      isApplyingViewRef.current = true
      setFilters(view.filters)
      setVisibleColumns(extractOptionalColumns(view.columns))
      setTablePage(1)
      setCardPage(1)
      setListPage(1)
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
        setVisibleColumns([])
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
        columns: getColumnsForView(visibleColumns)
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
  }, [projectId, viewForm, filters, dispatch, applyFiltersFromView, visibleColumns])

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
      setListPage(1)
      if (!isApplyingViewRef.current && projectId && selectedViewId) {
        dispatch(selectSavedView({ projectId, viewId: null }))
        lastAppliedViewId.current = null
      }
    },
    [dispatch, projectId, selectedViewId]
  )

  const handleVisibleColumnsChange = useCallback(
    (columns: OptionalTaskColumn[]) => {
      setVisibleColumns(columns)
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
    if (filters.status === 'all') {
      return
    }
    if (taskStatusesStatus !== 'succeeded') {
      return
    }
    if (!taskStatuses.some((status) => status.key === filters.status)) {
      setFilters((prev) => ({ ...prev, status: 'all' }))
    }
  }, [filters.status, taskStatuses, taskStatusesStatus])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTasks.length / CARD_PAGE_SIZE))
    if (cardPage > maxPage) {
      setCardPage(maxPage)
    }
  }, [filteredTasks.length, cardPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTasks.length / LIST_PAGE_SIZE))
    if (listPage > maxPage) {
      setListPage(maxPage)
    }
  }, [filteredTasks.length, listPage])

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTasks.length / LIST_PAGE_SIZE))
    if (listPage > maxPage) {
      setListPage(maxPage)
    }
  }, [filteredTasks.length, listPage])

  useEffect(() => {
    if (viewMode === 'table') {
      setTablePage(1)
    }
    if (viewMode === 'cards') {
      setCardPage(1)
    }
    if (viewMode === 'list') {
      setListPage(1)
    }
  }, [viewMode])

  const savedViewsControls = projectId ? (
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

  const secondaryActionsContent = (
    <>
      <TaskColumnVisibilityControls
        columns={OPTIONAL_TASK_COLUMNS}
        selectedColumns={visibleColumns}
        disabled={viewMode !== 'table'}
        onChange={handleVisibleColumnsChange}
      />
      {projectId && canManageTasks ? (
        <TaskStatusManager
          projectId={projectId}
          statuses={taskStatuses}
          onRefreshTasks={refreshTasks}
          disabled={taskStatusesStatus === 'loading'}
        />
      ) : null}
    </>
  )

  const handleTaskSelect = (taskId: string) => {
    openTaskDetails(taskId)
  }

  const handleTaskEdit = (taskId: string) => {
    openTaskEdit(taskId)
  }

  const handleTaskDelete = (taskId: string) => deleteTask(taskId)

  if (!project && !projectLoading) {
    return (
      <Space direction="vertical" align="center" style={{ marginTop: 64, width: '100%' }}>
        <EmptyState title={t('details.notFound')} />
      </Space>
    )
  }

  return (
    <>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <TaskFiltersBar
          filters={filters}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          assigneeOptions={assigneeOptions}
          onChange={handleFiltersChange}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode)
            if (mode === 'cards') {
              setCardPage(1)
            }
            if (mode === 'table') {
              setTablePage(1)
            }
            if (mode === 'list') {
              setListPage(1)
            }
          }}
          onCreate={canManageTasks ? () => openTaskCreate() : undefined}
          canCreate={canManageTasks}
          secondaryActions={secondaryActionsContent}
          savedViewsControls={savedViewsControls}
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
            statusLabels={statusLabelMap}
            columns={tableColumns}
            pagination={{
              current: tablePage,
              pageSize: TABLE_PAGE_SIZE,
              onChange: (page) => setTablePage(page)
            }}
          />
        ) : null}
        {viewMode === 'cards' ? (
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
            statusLabels={statusLabelMap}
          />
        ) : null}
        {viewMode === 'list' ? (
          <ProjectTasksList
            tasks={filteredTasks}
            loading={loading || projectLoading}
            page={listPage}
            pageSize={LIST_PAGE_SIZE}
            onPageChange={setListPage}
            onSelect={(task) => handleTaskSelect(task.id)}
            onEdit={(task) => handleTaskEdit(task.id)}
            onDelete={(task) => handleTaskDelete(task.id)}
            canManage={canManageTasks}
            deletingTaskId={deletingTaskId}
            statusLabels={statusLabelMap}
          />
        ) : null}
        {viewMode === 'board' ? (
          <ProjectBoard
            projectId={projectId}
            statuses={taskStatuses}
            tasks={filteredTasks}
            isLoading={loading || projectLoading}
            canManageTasks={canManageTasks}
            onTaskSelect={(task) => handleTaskSelect(task.id)}
            onTaskEdit={(task) => handleTaskEdit(task.id)}
            onTaskDelete={(task) => handleTaskDelete(task.id)}
            deletingTaskId={deletingTaskId}
          />
        ) : null}
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















