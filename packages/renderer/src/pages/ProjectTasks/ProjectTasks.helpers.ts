import type { TFunction } from 'i18next'

import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import type { SelectOption, TaskFilters } from '@renderer/pages/ProjectTasks/ProjectTasks.types'

export const buildStatusOptions = (t: TFunction<'projects'>): SelectOption[] => [
  { value: 'all', label: t('details.filters.statusOptions.all') },
  { value: 'todo', label: t('details.status.todo') },
  { value: 'in_progress', label: t('details.status.in_progress') },
  { value: 'blocked', label: t('details.status.blocked') },
  { value: 'done', label: t('details.status.done') }
]

export const buildPriorityOptions = (t: TFunction<'projects'>): SelectOption[] => [
  { value: 'all', label: t('details.filters.priorityOptions.all') },
  { value: 'low', label: t('details.priority.low') },
  { value: 'medium', label: t('details.priority.medium') },
  { value: 'high', label: t('details.priority.high') },
  { value: 'critical', label: t('details.priority.critical') }
]

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

    return matchesStatus && matchesPriority
  })
}
