import dayjs, { type ConfigType } from 'dayjs'

import type {
  AssigneeWorkloadEntry,
  DistributionItem,
  ProjectInsights,
  ProjectMetricTotals,
  TrendPoint
} from '@renderer/pages/ProjectOverview/ProjectOverview.types'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'

const UPCOMING_WINDOW_DAYS = 7
const TREND_WINDOW_DAYS = 14
const MAX_LIST_ITEMS = 6

const toDistribution = (map: Map<string, number>): DistributionItem[] =>
  Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)

const normalizeDate = (value: string | null): dayjs.Dayjs | null => {
  if (!value) {
    return null
  }
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed : null
}

const buildCompletionTrend = (tasks: TaskDetails[], now: ConfigType): TrendPoint[] => {
  const base = dayjs(now).startOf('day')
  const doneTasks = tasks.filter((task) => task.status === 'done')
  const points: TrendPoint[] = []

  for (let offset = TREND_WINDOW_DAYS - 1; offset >= 0; offset -= 1) {
    const target = base.subtract(offset, 'day')
    const count = doneTasks.filter((task) => dayjs(task.updatedAt).isSame(target, 'day')).length
    points.push({
      date: target.format('YYYY-MM-DD'),
      label: target.format('DD MMM'),
      count
    })
  }

  return points
}

const buildAssigneeWorkload = (tasks: TaskDetails[]): AssigneeWorkloadEntry[] => {
  const map = new Map<string, AssigneeWorkloadEntry>()

  for (const task of tasks) {
    const id = task.assignee?.id ?? '__unassigned__'
    const name = task.assignee?.displayName ?? 'unassigned'
    const existing = map.get(id)
    if (existing) {
      existing.count += 1
    } else {
      map.set(id, {
        id,
        name,
        count: 1,
        isUnassigned: !task.assignee
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count)
}

const buildTotals = (
  tasks: TaskDetails[],
  overdueTasks: TaskDetails[],
  upcomingTasks: TaskDetails[],
  unassignedCount: number
): ProjectMetricTotals => {
  const total = tasks.length
  const done = tasks.filter((task) => task.status === 'done').length
  return {
    total,
    done,
    active: total - done,
    overdue: overdueTasks.length,
    dueSoon: upcomingTasks.length,
    unassigned: unassignedCount
  }
}

export const calculateProjectInsights = (
  tasks: TaskDetails[],
  now: ConfigType = new Date()
): ProjectInsights => {
  const totalsByStatus = new Map<string, number>()
  const totalsByPriority = new Map<string, number>()
  const overdue: TaskDetails[] = []
  const upcoming: TaskDetails[] = []

  const today = dayjs(now).startOf('day')
  const upcomingLimit = today.add(UPCOMING_WINDOW_DAYS, 'day')

  let unassigned = 0

  for (const task of tasks) {
    totalsByStatus.set(task.status, (totalsByStatus.get(task.status) ?? 0) + 1)
    totalsByPriority.set(task.priority, (totalsByPriority.get(task.priority) ?? 0) + 1)

    if (!task.assignee) {
      unassigned += 1
    }

    if (task.status === 'done') {
      continue
    }

    const due = normalizeDate(task.dueDate)
    if (!due) {
      continue
    }

    if (due.isBefore(today, 'day')) {
      overdue.push(task)
      continue
    }

    if (due.isSame(today, 'day') || due.isBefore(upcomingLimit, 'day') || due.isSame(upcomingLimit, 'day')) {
      upcoming.push(task)
    }
  }

  overdue.sort((a, b) => {
    const dueA = normalizeDate(a.dueDate)?.valueOf() ?? 0
    const dueB = normalizeDate(b.dueDate)?.valueOf() ?? 0
    return dueA - dueB
  })

  upcoming.sort((a, b) => {
    const dueA = normalizeDate(a.dueDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER
    const dueB = normalizeDate(b.dueDate)?.valueOf() ?? Number.MAX_SAFE_INTEGER
    return dueA - dueB
  })

  return {
    totals: buildTotals(tasks, overdue, upcoming, unassigned),
    statusDistribution: toDistribution(totalsByStatus),
    priorityDistribution: toDistribution(totalsByPriority),
    assigneeWorkload: buildAssigneeWorkload(tasks),
    completionTrend: buildCompletionTrend(tasks, now),
    upcomingTasks: upcoming.slice(0, MAX_LIST_ITEMS),
    overdueTasks: overdue.slice(0, MAX_LIST_ITEMS)
  }
}

export default calculateProjectInsights
