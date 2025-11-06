import { useCallback, useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn, type Resolver } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { createTask, updateTask, deleteTask, type TaskDetails } from '@renderer/store/slices/tasks'
import {
  fetchSprints,
  selectSprintList,
  selectSprintsForProject
} from '@renderer/store/slices/sprints'
import type { ProjectDetails } from '@renderer/store/slices/projects'
import { taskFormSchema, type TaskFormValues } from '@renderer/pages/Projects/schemas/taskSchemas'
import type { TaskStatusItem } from '@renderer/store/slices/taskStatuses'
import { selectCurrentUser } from '@renderer/store/slices/auth/selectors'

export interface TaskModalsState {
  detailTask: TaskDetails | null
  isDetailOpen: boolean
  openDetail: (taskId: string) => void
  closeDetail: () => void
  isEditorOpen: boolean
  editorMode: 'create' | 'edit' | null
  openCreate: (defaults?: Partial<Pick<TaskFormValues, 'status' | 'priority'>>) => void
  openEdit: (taskId: string) => void
  closeEditor: () => void
  editorForm: UseFormReturn<TaskFormValues>
  submitEditor: () => void
  submitting: boolean
  editorTask: TaskDetails | null
  deletingTaskId: string | null
  deleteConfirmTask: TaskDetails | null
  openDeleteConfirm: (taskId: string) => void
  closeDeleteConfirm: () => void
  confirmDelete: () => Promise<void>
  assigneeOptions: Array<{ label: string; value: string }>
  ownerOptions: Array<{ label: string; value: string }>
  statusOptions: Array<{ label: string; value: string }>
  sprintOptions: Array<{ label: string; value: string }>
  taskMessageContext: React.ReactNode
}

export interface UseTaskModalsOptions {
  project: ProjectDetails | null
  tasks: TaskDetails[]
  projectId: string | null
  statuses: TaskStatusItem[]
  canManageTasks: boolean
  canDeleteTask: (task: TaskDetails) => boolean
}

export const useTaskModals = ({
  project,
  tasks,
  projectId,
  statuses,
  canManageTasks,
  canDeleteTask
}: UseTaskModalsOptions): TaskModalsState => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation('projects')
  const [messageApi, taskMessageContext] = message.useMessage()
  const currentUser = useAppSelector(selectCurrentUser)

  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<{
    mode: 'create' | 'edit'
    taskId?: string
  } | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TaskDetails | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const statusMap = useMemo(
    () => new Map(statuses.map((status) => [status.key, status])),
    [statuses]
  )
  const statusOptions = useMemo(
    () =>
      statuses.map((status) => ({
        value: status.key,
        label: status.label
      })),
    [statuses]
  )
  const defaultStatusKey = useMemo(() => statusOptions[0]?.value ?? 'todo', [statusOptions])

  const activeMembers = useMemo(
    () => (project?.members ?? []).filter((member) => member.isActive),
    [project?.members]
  )

  const detailTask = useMemo(
    () => (detailTaskId ? (tasks.find((task) => task.id === detailTaskId) ?? null) : null),
    [detailTaskId, tasks]
  )

  const editorTask = useMemo(
    () =>
      editorState?.mode === 'edit' && editorState.taskId
        ? (tasks.find((task) => task.id === editorState.taskId) ?? null)
        : null,
    [editorState, tasks]
  )

  const assigneeOptions = useMemo(
    () =>
      activeMembers.map((member) => ({
        label: member.displayName ?? member.username,
        value: member.userId
      })),
    [activeMembers]
  )

  const ownerOptions = useMemo(() => {
    const options = activeMembers.map((member) => ({
      label: member.displayName ?? member.username,
      value: member.userId
    }))
    if (currentUser?.id) {
      const exists = options.some((option) => option.value === currentUser.id)
      if (!exists) {
        options.push({
          label: currentUser.displayName ?? currentUser.username ?? currentUser.id,
          value: currentUser.id
        })
      }
    }
    return options
  }, [activeMembers, currentUser?.displayName, currentUser?.id, currentUser?.username])

  const sprintState = useAppSelector((state) =>
    projectId ? selectSprintsForProject(projectId)(state) : undefined
  )
  const sprintList = useAppSelector((state) =>
    projectId ? selectSprintList(projectId)(state) : []
  )

  const sprintStatus = sprintState?.status ?? 'idle'

  useEffect(() => {
    if (projectId && sprintStatus === 'idle') {
      dispatch(fetchSprints(projectId))
    }
  }, [dispatch, projectId, sprintStatus])

  const sprintOptions = useMemo(
    () =>
      sprintList.map((sprint) => ({
        label: sprint.name,
        value: sprint.id
      })),
    [sprintList]
  )

  const defaultOwnerId = useMemo(() => {
    if (currentUser?.id && ownerOptions.some((option) => option.value === currentUser.id)) {
      return currentUser.id
    }
    return ownerOptions[0]?.value ?? ''
  }, [currentUser?.id, ownerOptions])

  const editorForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as unknown as Resolver<TaskFormValues>,
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: null,
      status: defaultStatusKey,
      priority: 'medium',
      dueDate: null,
      assigneeId: null,
      ownerId: defaultOwnerId,
      sprintId: null,
      estimatedMinutes: null
    }
  })

  const openDetail = useCallback((taskId: string) => {
    setDetailTaskId(taskId)
  }, [])

  const closeDetail = useCallback(() => {
    setDetailTaskId(null)
  }, [])

  const openCreate = useCallback(
    (defaults?: Partial<Pick<TaskFormValues, 'status' | 'priority'>>) => {
      if (!canManageTasks) {
        messageApi.warning(t('permissions.tasksCreateDenied'))
        return
      }
      setEditorState({ mode: 'create' })
      const resolvedStatus =
        defaults?.status && statusMap.has(defaults.status) ? defaults.status : defaultStatusKey
      editorForm.reset({
        title: '',
        description: null,
        status: resolvedStatus,
        priority: defaults?.priority ?? 'medium',
        dueDate: null,
        assigneeId: null,
        ownerId: defaultOwnerId,
        sprintId: null,
        estimatedMinutes: null
      })
    },
    [canManageTasks, defaultOwnerId, defaultStatusKey, editorForm, messageApi, statusMap, t]
  )

  const openEdit = useCallback(
    (taskId: string) => {
      if (!canManageTasks) {
        messageApi.warning(t('permissions.tasksUpdateDenied'))
        return
      }
      const task = tasks.find((item) => item.id === taskId)
      if (!task) {
        messageApi.error(t('tasks.messages.notFound', { defaultValue: 'Task non trovato' }))
        return
      }
      setEditorState({ mode: 'edit', taskId })
      const resolvedStatus = statusMap.has(task.status) ? task.status : defaultStatusKey
      editorForm.reset({
        title: task.title,
        description: task.description ?? null,
        status: resolvedStatus,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : null,
        assigneeId: task.assignee?.id ?? null,
        ownerId: task.owner?.id ?? defaultOwnerId,
        sprintId: task.sprint?.id ?? null,
        estimatedMinutes: task.estimatedMinutes ?? null
      })
    },
    [canManageTasks, defaultOwnerId, defaultStatusKey, editorForm, messageApi, statusMap, t, tasks]
  )

  const closeEditor = useCallback(() => {
    setEditorState(null)
    editorForm.reset({
      title: '',
      description: null,
      status: defaultStatusKey,
      priority: 'medium',
      dueDate: null,
      assigneeId: null,
      ownerId: defaultOwnerId,
      sprintId: null,
      estimatedMinutes: null
    })
  }, [defaultOwnerId, defaultStatusKey, editorForm])

  const handleEditorSubmit = editorForm.handleSubmit(async (values) => {
    if (!projectId || !editorState) {
      return
    }
    setSubmitting(true)
    try {
      if (editorState.mode === 'create') {
        await dispatch(
          createTask({
            projectId,
            parentId: null,
            title: values.title,
            description: values.description,
            status: values.status,
            priority: values.priority,
            dueDate: values.dueDate,
            assigneeId: values.assigneeId,
            ownerId: values.ownerId,
            sprintId: values.sprintId,
            estimatedMinutes: values.estimatedMinutes
          })
        ).unwrap()
        messageApi.success(t('tasks.messages.createSuccess'))
      } else if (editorState.mode === 'edit' && editorState.taskId) {
        await dispatch(
          updateTask({
            taskId: editorState.taskId,
            input: {
              title: values.title,
              description: values.description,
              status: values.status,
              priority: values.priority,
              dueDate: values.dueDate,
              assigneeId: values.assigneeId,
              ownerId: values.ownerId,
              sprintId: values.sprintId,
              estimatedMinutes: values.estimatedMinutes
            }
          })
        ).unwrap()
        messageApi.success(t('tasks.messages.updateSuccess'))
      }
      closeEditor()
    } catch (error) {
      const messageText =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
      messageApi.error(messageText)
    } finally {
      setSubmitting(false)
    }
  })

  const performDeleteTask = useCallback(
    async (task: TaskDetails): Promise<boolean> => {
      if (!projectId) {
        return false
      }
      setDeletingTaskId(task.id)
      try {
        await dispatch(deleteTask({ projectId, taskId: task.id })).unwrap()
        messageApi.success(t('tasks.messages.deleteSuccess'))
        if (detailTaskId === task.id) {
          setDetailTaskId(null)
        }
        return true
      } catch (error) {
        const messageText =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : t('errors.generic', { defaultValue: 'Operazione non riuscita' })
        messageApi.error(messageText)
        return false
      } finally {
        setDeletingTaskId(null)
      }
    },
    [detailTaskId, dispatch, messageApi, projectId, t]
  )

  const openDeleteConfirm = useCallback(
    (taskId: string) => {
      const target = tasks.find((item) => item.id === taskId)
      if (!target) {
        messageApi.error(t('tasks.messages.notFound', { defaultValue: 'Task non trovato' }))
        return
      }
      if (!canDeleteTask(target)) {
        messageApi.warning(
          t('permissions.tasksDeleteDenied', {
            defaultValue: 'Non hai i permessi per eliminare questo task.'
          })
        )
        return
      }
      setDeleteTarget(target)
    },
    [canDeleteTask, messageApi, t, tasks]
  )

  const closeDeleteConfirm = useCallback(() => {
    if (deletingTaskId) {
      return
    }
    setDeleteTarget(null)
  }, [deletingTaskId])

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) {
      return
    }
    const success = await performDeleteTask(deleteTarget)
    if (success) {
      setDeleteTarget(null)
    }
  }, [deleteTarget, performDeleteTask])

  const submitEditor = useCallback(() => {
    void handleEditorSubmit()
  }, [handleEditorSubmit])

  return {
    detailTask,
    isDetailOpen: Boolean(detailTask),
    openDetail,
    closeDetail,
    isEditorOpen: Boolean(editorState),
    editorMode: editorState?.mode ?? null,
    openCreate,
    openEdit,
    closeEditor,
    editorForm,
    submitEditor,
    submitting,
    editorTask,
    deletingTaskId,
    deleteConfirmTask: deleteTarget,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    assigneeOptions,
    ownerOptions,
    statusOptions,
    sprintOptions,
    taskMessageContext
  }
}
