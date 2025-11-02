import { randomUUID } from 'node:crypto'
import type { Transaction } from 'sequelize'

import { Comment } from '../packages/main/src/models/Comment'
import { Project } from '../packages/main/src/models/Project'
import { ProjectMember } from '../packages/main/src/models/ProjectMember'
import { ProjectTag } from '../packages/main/src/models/ProjectTag'
import { Task } from '../packages/main/src/models/Task'
import { Note } from '../packages/main/src/models/Note'
import { NoteTag } from '../packages/main/src/models/NoteTag'
import { NoteTaskLink } from '../packages/main/src/models/NoteTaskLink'
import { logger } from '../packages/main/src/config/logger'

import type { ProjectSeedDefinition } from './DevelopmentSeeder.types'

export class ProjectSeeder {
  async upsert(
    transaction: Transaction,
    seed: ProjectSeedDefinition
  ): Promise<{
    project: Project | null
    taskCount: number
    commentCount: number
    noteCount: number
  }> {
    const existing = await Project.findOne({ where: { key: seed.key }, transaction })
    if (existing) {
      logger.debug(`Project ${seed.key} already present, skipping`, 'Seed')
      return { project: null, taskCount: 0, commentCount: 0, noteCount: 0 }
    }

    const project = await Project.create(
      {
        id: randomUUID(),
        key: seed.key,
        name: seed.name,
        description: seed.description,
        createdBy: seed.createdBy
      },
      { transaction }
    )

    await Promise.all(
      seed.members.map((member) =>
        ProjectMember.create(
          {
            projectId: project.id,
            userId: member.userId,
            role: member.role,
            createdAt: new Date()
          },
          { transaction }
        )
      )
    )

    await ProjectTag.destroy({ where: { projectId: project.id }, transaction })

    await Promise.all(
      seed.tags.map((tag) =>
        ProjectTag.create(
          {
            id: randomUUID(),
            projectId: project.id,
            tag,
            createdAt: new Date()
          },
          { transaction }
        )
      )
    )

    let taskIndex = 1
    let commentTotal = 0
    const createdTasks: Task[] = []

    for (const taskSeed of seed.tasks) {
      const task = await Task.create(
        {
          id: randomUUID(),
          projectId: project.id,
          key: `${project.key}-${String(taskIndex).padStart(3, '0')}`,
          parentId: null,
          title: taskSeed.title,
          description: taskSeed.description,
          status: taskSeed.status,
          priority: taskSeed.priority,
          dueDate: taskSeed.dueDate,
          assigneeId: taskSeed.assigneeId,
          ownerUserId: taskSeed.ownerId ?? seed.createdBy
        },
        { transaction }
      )
      createdTasks.push(task)

      if (taskSeed.comments.length > 0) {
        await Promise.all(
          taskSeed.comments.map((comment) =>
            Comment.create(
              {
                id: randomUUID(),
                taskId: task.id,
                authorId: comment.authorId,
                body: comment.body
              },
              { transaction }
            )
          )
        )
        commentTotal += taskSeed.comments.length
      }

      taskIndex += 1
    }

    let noteCount = 0

    if (seed.notes.length > 0) {
      for (const noteSeed of seed.notes) {
        const note = await Note.create(
          {
            id: randomUUID(),
            projectId: project.id,
            title: noteSeed.title,
            bodyMd: noteSeed.body,
            ownerUserId: noteSeed.ownerId,
            isPrivate: noteSeed.isPrivate,
            notebook: noteSeed.notebook
          },
          { transaction }
        )

        noteCount += 1

        if (noteSeed.tags.length > 0) {
          await NoteTag.bulkCreate(
            noteSeed.tags.map((tag) => ({
              noteId: note.id,
              tag
            })),
            { transaction }
          )
        }

        if (noteSeed.linkedTaskIndexes.length > 0) {
          const uniqueTasks = Array.from(
            new Set(
              noteSeed.linkedTaskIndexes
                .map((index) => createdTasks[index])
                .filter((task): task is Task => Boolean(task))
                .map((task) => task.id)
            )
          )

          if (uniqueTasks.length > 0) {
            await NoteTaskLink.bulkCreate(
              uniqueTasks.map((taskId) => ({
                noteId: note.id,
                taskId
              })),
              { transaction }
            )
          }
        }
      }
    }

    logger.debug(
      `Seeded project ${seed.key} with ${seed.members.length} members, ${seed.tags.length} tags, ${seed.tasks.length} tasks, ${commentTotal} comments and ${noteCount} notes`,
      'Seed'
    )
    return {
      project,
      taskCount: seed.tasks.length,
      commentCount: commentTotal,
      noteCount
    }
  }
}
