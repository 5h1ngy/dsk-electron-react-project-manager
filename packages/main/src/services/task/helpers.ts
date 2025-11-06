import { AppError } from '@main/config/appError'
import type { Comment } from '@main/models/Comment'
import type { Task } from '@main/models/Task'
import type { Note } from '@main/models/Note'
import type { User } from '@main/models/User'
import type {
  CommentDTO,
  TaskDetailsDTO,
  TaskNoteLinkDTO,
  UserSummaryDTO,
  SprintSummaryDTO
} from '@main/services/task/types'
import type { TaskPriorityInput, TaskStatusInput } from '@main/services/task/schemas'
import type { Sprint } from '@main/models/Sprint'

export const mapUserSummary = (user: User | null): UserSummaryDTO | null => {
  if (!user) {
    return null
  }
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName
  }
}

interface MapTaskDetailsOptions {
  sprint?: Sprint | null
}

export const mapTaskDetails = (
  task: Task,
  projectKey: string,
  commentCount = 0,
  options: MapTaskDetailsOptions = {}
): TaskDetailsDTO => {
  const sprint = options.sprint ?? task.sprint ?? null
  return {
    id: task.id,
    projectId: task.projectId,
    key: task.key,
    parentId: task.parentId ?? null,
    title: task.title,
    description: task.description ?? null,
    status: task.status as TaskStatusInput,
    priority: task.priority as TaskPriorityInput,
    dueDate: task.dueDate ?? null,
    assignee: mapUserSummary(task.assignee ?? null),
    owner:
      mapUserSummary(task.owner ?? null) ??
      ({
        id: task.ownerUserId,
        username: task.owner?.username ?? 'unknown',
        displayName: task.owner?.displayName ?? 'Unknown'
      } as UserSummaryDTO),
    sprintId: sprint?.id ?? task.sprintId ?? null,
    sprint: mapSprintSummary(sprint),
    estimatedMinutes: task.estimatedMinutes ?? null,
    createdAt: task.createdAt!,
    updatedAt: task.updatedAt!,
    projectKey,
    linkedNotes: mapTaskNotes(task.notes ?? []),
    commentCount
  }
}

export const mapComment = (comment: Comment): CommentDTO => {
  const author = comment.author
  if (!author) {
    throw new AppError('ERR_INTERNAL', 'Comment author relation missing')
  }
  return {
    id: comment.id,
    taskId: comment.taskId,
    author: mapUserSummary(author)!,
    body: comment.body,
    createdAt: comment.createdAt!,
    updatedAt: comment.updatedAt!
  }
}

const mapTaskNotes = (notes: Note[]): TaskNoteLinkDTO[] =>
  notes.map((note) => ({
    id: note.id,
    title: note.title,
    isPrivate: note.isPrivate,
    ownerId: note.ownerUserId
  }))

export const mapSprintSummary = (sprint: Sprint | null): SprintSummaryDTO | null => {
  if (!sprint) {
    return null
  }

  return {
    id: sprint.id,
    projectId: sprint.projectId,
    name: sprint.name,
    status: sprint.status,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    goal: sprint.goal ?? null,
    capacityMinutes: sprint.capacityMinutes ?? null,
    sequence: sprint.sequence
  }
}
