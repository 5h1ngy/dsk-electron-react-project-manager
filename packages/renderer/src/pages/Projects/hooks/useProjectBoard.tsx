import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { message } from 'antd'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'

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
import { createTaskSchema, type CreateTaskValues } from '../schemas/taskSchemas'

const STATUSES: Array<{ status: TaskStatus; label: string }> = [
  { status: 'todo', label: 'Da fare' },
  { status: 'in_progress', label: 'In corso' },
  { status: 'blocked', label: 'Bloccato' },
  { status: 'done', label: 'Completato' }
]

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
  selectTask: (taskId: string | null) => void
  selectedTask: TaskDetails | null
}

export const useProjectBoard = (
  project: ProjectDetails | null,
  canManageTasks: boolean
): UseProjectBoardResult => {
  const dispatch = useAppDispatch()
  const [messageApi, messageContext] = message.useMessage()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
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

  const boardStatus = tasksState?.status ?? 'idle'

  const columns = useMemo<KanbanColumn[]>(
    () =>
      STATUSES.map(({ status, label }) => ({
        status,
        label,
        tasks: projectTasks.filter((task) => task.status === status)
      })),
    [projectTasks]
  )

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) {
      return null
    }
    return projectTasks.find((task) => task.id === selectedTaskId) ?? null
  }, [projectTasks, selectedTaskId])

  useEffect(() => {
    if (projectId) {
      void dispatch(fetchTasks(projectId))
    }
  }, [dispatch, projectId])

  useEffect(() => {
    setSelectedTaskId(null)
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
    try {
      if (!canManageTasks) {
        messageApi.warning('Permessi insufficienti per creare task in questo progetto.')
        return
      }
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
      messageApi.success('Task creato')
      createTaskForm.reset({
        title: '',
        description: null,
        dueDate: undefined,
        priority: 'medium'
      })
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Operazione non riuscita'
      messageApi.error(text)
    }
  })

  const handleMoveTask = useCallback(
    async (taskId: string, nextStatus: TaskStatus) => {
      try {
        if (!canManageTasks) {
          messageApi.warning('Permessi insufficienti per modificare i task.')
          return
        }
        await dispatch(moveTask({ taskId, input: { status: nextStatus } })).unwrap()
        messageApi.success('Task aggiornato')
      } catch (error) {
        const text = error instanceof Error ? error.message : 'Operazione non riuscita'
        messageApi.error(text)
      }
    },
    [canManageTasks, dispatch, messageApi]
  )

  const selectTask = useCallback((task: string | null) => {
    setSelectedTaskId(task)
  }, [])

  return {
    messageContext,
    columns,
    boardStatus,
    createTaskForm,
    handleCreateTask,
    handleMoveTask,
    selectTask,
    selectedTask
  }
}
