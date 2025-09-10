import { AppError } from '../config/appError'
import type { Comment } from '../models/Comment'
import type { Task } from '../models/Task'
import type { User } from '../models/User'
import type { CommentDTO, TaskDetailsDTO, UserSummaryDTO } from './task.types'
import type { TaskPriorityInput, TaskStatusInput } from './task.schemas'

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

export const mapTaskDetails = (task: Task, projectKey: string): TaskDetailsDTO => ({
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
  createdAt: task.createdAt!,
  updatedAt: task.updatedAt!,
  projectKey
})

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
