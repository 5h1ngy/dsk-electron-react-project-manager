import { useCallback, useMemo, type ReactNode } from 'react'
import { message } from 'antd'
import { useTranslation } from 'react-i18next'

import { useAppDispatch } from '@renderer/store/hooks'
import { moveTask, type TaskDetails, type TaskStatus } from '@renderer/store/slices/tasks'

export interface KanbanColumn {
  status: TaskStatus
  label: string
  tasks: TaskDetails[]
}

export interface UseProjectBoardResult {
  messageContext: ReactNode
  columns: KanbanColumn[]
  handleMoveTask: (taskId: string, nextStatus: TaskStatus) => Promise<void>
}

export const useProjectBoard = (
  projectId: string | null,
  tasks: TaskDetails[],
  canManageTasks: boolean
): UseProjectBoardResult => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation('projects')
  const [messageApi, messageContext] = message.useMessage()

  const columns = useMemo<KanbanColumn[]>(() => {
    const definitions: Array<{ status: TaskStatus; label: string }> = [
      { status: 'todo', label: t('board.columns.todo') },
      { status: 'in_progress', label: t('board.columns.inProgress') },
      { status: 'blocked', label: t('board.columns.blocked') },
      { status: 'done', label: t('board.columns.done') }
    ]

    const source = projectId ? tasks : []

    return definitions.map(({ status, label }) => ({
      status,
      label,
      tasks: source.filter((task) => task.status === status)
    }))
  }, [projectId, tasks, t])

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
    handleMoveTask
  }
}
