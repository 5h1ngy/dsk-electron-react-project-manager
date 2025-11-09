import dayjs from 'dayjs'

import { calculateProjectInsights } from '@renderer/pages/ProjectOverview/ProjectOverview.helpers'
import type { TaskDetails } from '@renderer/store/slices/tasks/types'

const buildTask = (overrides: Partial<TaskDetails>): TaskDetails => {
  const baseOwner = {
    id: 'owner-1',
    username: 'owner',
    displayName: 'Owner'
  }

  return {
    id: 'task-id',
    projectId: 'project-1',
    projectKey: 'PRJ',
    key: 'PRJ-1',
    parentId: null,
    title: 'Sample task',
    description: null,
    status: 'todo',
    priority: 'medium',
    dueDate: null,
    assignee: null,
    owner: baseOwner,
    sprintId: null,
    sprint: null,
    estimatedMinutes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    linkedNotes: [],
    commentCount: 0,
    ...overrides
  }
}

describe('calculateProjectInsights', () => {
  it('computes metrics, distributions and task buckets', () => {
    const now = dayjs('2025-05-10T09:00:00Z')
    const tasks: TaskDetails[] = [
      buildTask({
        id: 'done-task',
        key: 'PRJ-10',
        title: 'Completed work',
        status: 'done',
        priority: 'low',
        updatedAt: now.toDate()
      }),
      buildTask({
        id: 'todo-task',
        key: 'PRJ-11',
        title: 'Upcoming task',
        status: 'todo',
        priority: 'high',
        dueDate: now.add(2, 'day').toISOString(),
        assignee: {
          id: 'user-1',
          username: 'user1',
          displayName: 'User One'
        }
      }),
      buildTask({
        id: 'overdue-task',
        key: 'PRJ-12',
        title: 'Overdue task',
        status: 'in_progress',
        priority: 'critical',
        dueDate: now.subtract(2, 'day').toISOString(),
        assignee: {
          id: 'user-2',
          username: 'user2',
          displayName: 'User Two'
        }
      }),
      buildTask({
        id: 'upcoming-late',
        key: 'PRJ-13',
        title: 'Due in a few days',
        status: 'blocked',
        priority: 'medium',
        dueDate: now.add(6, 'day').toISOString()
      }),
      buildTask({
        id: 'backlog-task',
        key: 'PRJ-14',
        title: 'Backlog work',
        status: 'todo',
        priority: 'medium'
      })
    ]

    const insights = calculateProjectInsights(tasks, now.toDate())
    expect(insights.totals.total).toBe(5)
    expect(insights.totals.done).toBe(1)
    expect(insights.totals.active).toBe(4)
    expect(insights.totals.dueSoon).toBe(2)
    expect(insights.totals.unassigned).toBe(3)

    const statusMap = new Map(insights.statusDistribution.map((item) => [item.key, item.count]))
    expect(statusMap.get('todo')).toBe(2)
    expect(statusMap.get('in_progress')).toBe(1)
    expect(statusMap.get('blocked')).toBe(1)
    expect(statusMap.get('done')).toBe(1)

    const priorityMap = new Map(insights.priorityDistribution.map((item) => [item.key, item.count]))
    expect(priorityMap.get('critical')).toBe(1)
    expect(priorityMap.get('high')).toBe(1)
    expect(priorityMap.get('medium')).toBe(2)
    expect(priorityMap.get('low')).toBe(1)

    expect(insights.upcomingTasks.map((task) => task.id)).toEqual(['todo-task', 'upcoming-late'])
    expect(insights.overdueTasks.map((task) => task.id)).toEqual(['overdue-task'])
    expect(insights.totals.overdue).toBe(1)

    const workloadMap = new Map(insights.assigneeWorkload.map((entry) => [entry.id, entry.count]))
    expect(workloadMap.get('user-1')).toBe(1)
    expect(workloadMap.get('user-2')).toBe(1)
    expect(workloadMap.get('__unassigned__')).toBe(3)

    expect(insights.completionTrend).toHaveLength(14)
    expect(insights.completionTrend.at(-1)?.count).toBe(1)
  })
})
