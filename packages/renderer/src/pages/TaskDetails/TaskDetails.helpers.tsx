import type { TaskDetails } from '@renderer/store/slices/tasks/types'
import type { TagDescriptor } from '@renderer/pages/TaskDetails/TaskDetails.types'

export const formatDate = (
  value: string | Date | null,
  locale: string,
  fallback = 'N/A'
): string => {
  if (!value) {
    return fallback
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

export const buildTags = (
  task: TaskDetails | null,
  translate: (key: string) => string
): TagDescriptor[] => {
  if (!task) {
    return []
  }
  return [
    {
      label: translate(`details.status.${task.status}`),
      color: 'blue'
    },
    {
      label: translate(`details.priority.${task.priority}`),
      color: task.priority === 'critical' ? 'red' : task.priority === 'high' ? 'orange' : 'green'
    }
  ]
}
