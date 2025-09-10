import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { message } from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  createTask,
  fetchTasks,
  moveTask,
  type TaskDetails,
  type TaskStatus,
  type LoadStatus
} from '@renderer/store/slices/tasks'
import type { ProjectDetails } from '@renderer/store/slices/projects'
import { createTaskSchema, type CreateTaskValues } from '@renderer/pages/Projects/schemas/taskSchemas'

export interface KanbanColumn {
  status: TaskStatus
  label: string
  tasks: TaskDetails[]
}

export interface UseProjectBoardResult {
  messageContext: ReactNode
  columns: KanbanColumn[]
  boardStatus: LoadStatus
  createTaskForm: UseFormReturn<CreateTaskValues>
  handleCreateTask: () => void
  handleMoveTask: (taskId: string, nextStatus: TaskStatus) => Promise<void>
}

export const useProjectBoard = (
  project: ProjectDetails | null,
  canManageTasks: boolean
): UseProjectBoardResult => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation('projects')
  const [messageApi, messageContext] = message.useMessage()
  const projectId = project?.id ?? null

  const createTaskForm = useForm<CreateTaskValues>({
    resolver: zodResolver(createTaskSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: null,
      dueDate: undefined,
      priority: 'medium'
    }
  })

  const tasksState = useAppSelector((state) =>
    projectId ? state.tasks.byProjectId[projectId] ?? undefined : undefined
  )

  const projectTasks: TaskDetails[] = useMemo(() => {
    if (!tasksState) {
      return []
    }
    return tasksState.ids
      .map((id) => tasksState.entities[id])
      .filter((task): task is TaskDetails => Boolean(task))
  }, [tasksState])

  const boardStatus: LoadStatus = tasksState?.status ?? 'idle'

  const columns = useMemo<KanbanColumn[]>(() => {
    const columnDefinitions: Array<{ status: TaskStatus; label: string }> = [
      { status: 'todo', label: t('board.columns.todo') },
      { status: 'in_progress', label: t('board.columns.inProgress') },
      { status: 'blocked', label: t('board.columns.blocked') },
      { status: 'done', label: t('board.columns.done') }
    ]

    return columnDefinitions.map(({ status, label }) => ({
      status,
      label,
      tasks: projectTasks.filter((task) => task.status === status)
    }))
  }, [projectTasks, t])

  useEffect(() => {
    if (projectId) {
      void dispatch(fetchTasks(projectId))
    }
  }, [dispatch, projectId])

  useEffect(() => {
    createTaskForm.reset({
      title: '',
      description: null,
      dueDate: undefined,
      priority: 'medium'
    })
  }, [projectId, createTaskForm])

  const handleCreateTask = createTaskForm.handleSubmit(async (values: CreateTaskValues) => {
    if (!projectId) {
      return
    }
    if (!canManageTasks) {
      messageApi.warning(t('permissions.tasksCreateDenied'))
      return
    }
    try {
      await dispatch(
        createTask({
          projectId,
          parentId: null,
          title: values.title,
          description: values.description,
          status: 'todo',
          priority: values.priority,
          dueDate: values.dueDate ?? null,
          assigneeId: null
        })
      ).unwrap()
      messageApi.success(t('notifications.taskCreated'))
      createTaskForm.reset({
        title: '',
        description: null,
        dueDate: undefined,
        priority: 'medium'
      })
    } catch (error) {
      const text =
        typeof error === 'string'
          ? error
          : error instanceof Error
            ? error.message
            : t('errors.generic')
      messageApi.error(text)
    }
  })

  const handleMoveTask = useCallback(
    async (taskId: string, nextStatus: TaskStatus) => {
      if (!canManageTasks) {
        messageApi.warning(t('permissions.tasksUpdateDenied'))
        return
      }
      try {
        await dispatch(moveTask({ taskId, input: { status: nextStatus } })).unwrap()
        messageApi.success(t('notifications.taskUpdated'))
      } catch (error) {
        const text =
          typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : t('errors.generic')
        messageApi.error(text)
      }
    },
    [canManageTasks, dispatch, messageApi, t]
  )

  return {
    messageContext,
    columns,
    boardStatus,
    createTaskForm,
    handleCreateTask,
    handleMoveTask
  }
}
