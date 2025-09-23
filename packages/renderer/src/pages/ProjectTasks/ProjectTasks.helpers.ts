import type { TFunction } from 'i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import type { TaskStatusItem } from '@renderer/store/slices/taskStatuses'
import type { SelectOption, TaskFilters } from '@renderer/pages/ProjectTasks/ProjectTasks.types'

export const buildStatusOptions = (
  t: TFunction<'projects'>,
  statuses: TaskStatusItem[]
): SelectOption[] => [
  { value: 'all', label: t('details.filters.statusOptions.all') },
  ...statuses.map((status) => ({ value: status.key, label: status.label }))
]

export const buildPriorityOptions = (t: TFunction<'projects'>): SelectOption[] => [
  { value: 'all', label: t('details.filters.priorityOptions.all') },
  { value: 'low', label: t('details.priority.low') },
  { value: 'medium', label: t('details.priority.medium') },
  { value: 'high', label: t('details.priority.high') },
  { value: 'critical', label: t('details.priority.critical') }
]

export const buildAssigneeOptions = (tasks: TaskDetails[], t: TFunction<'projects'>): SelectOption[] => {
  const entries = new Map<string, string>()
  tasks.forEach((task) => {
    if (task.assignee) {
      entries.set(task.assignee.id, task.assignee.displayName ?? task.assignee.username)
    }
  })
  return [
    { value: 'all', label: t('details.filters.assigneeOptions.all') },
    { value: 'unassigned', label: t('details.filters.assigneeOptions.unassigned') },
    ...Array.from(entries.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([id, label]) => ({ value: id, label }))
  ]
}

export const resolveEffectiveTitle = (projectName: string | undefined, t: TFunction<'projects'>): string =>
  projectName ?? t('details.tasksTitle')

export const filterTasks = (tasks: TaskDetails[], filters: TaskFilters): TaskDetails[] => {
  const needle = filters.searchQuery.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchesSearch =
      needle.length === 0 ||
      [task.key, task.title, task.description ?? '', task.assignee?.displayName ?? '']
        .some((value) => value.toLowerCase().includes(needle))

    if (!matchesSearch) {
      return false
    }

    const matchesStatus = filters.status === 'all' || task.status === filters.status
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority
    const matchesAssignee =
      filters.assignee === 'all'
        ? true
        : filters.assignee === 'unassigned'
          ? !task.assignee
          : task.assignee?.id === filters.assignee
    const matchesDueDate =
      !filters.dueDateRange ||
      (() => {
        const [start, end] = filters.dueDateRange
        if (!start && !end) {
          return true
        }
        if (!task.dueDate) {
          return false
        }
        const dueTime = new Date(task.dueDate).getTime()
        if (start && dueTime < new Date(start).getTime()) {
          return false
        }
        if (end && dueTime > new Date(end).getTime()) {
          return false
        }
        return true
      })()

    return matchesStatus && matchesPriority && matchesAssignee && matchesDueDate
  })
}


