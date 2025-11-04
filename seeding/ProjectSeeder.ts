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
import { WikiPage } from '../packages/main/src/models/WikiPage'
import { WikiRevision } from '../packages/main/src/models/WikiRevision'
import { logger } from '../packages/main/src/config/logger'

import type { ProjectSeedDefinition } from './DevelopmentSeeder.types'

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page'

export class ProjectSeeder {
  async upsert(
    transaction: Transaction,
    seed: ProjectSeedDefinition
  ): Promise<{
    project: Project | null
    taskCount: number
    commentCount: number
    noteCount: number
    wikiPageCount: number
    wikiRevisionCount: number
  }> {
    const existing = await Project.findOne({ where: { key: seed.key }, transaction })
    if (existing) {
      logger.debug(`Project ${seed.key} already present, skipping`, 'Seed')
      return {
        project: null,
        taskCount: 0,
        commentCount: 0,
        noteCount: 0,
        wikiPageCount: 0,
        wikiRevisionCount: 0
      }
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
    let wikiPageCount = 0
    let wikiRevisionTotal = 0

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

    if (seed.wikiPages.length > 0) {
      const usedSlugs = new Set<string>()
      let displayOrder = 0

      for (const pageSeed of seed.wikiPages) {
        const baseSlug = slugify(pageSeed.title)
        let candidate = baseSlug
        let suffix = 2
        while (usedSlugs.has(candidate)) {
          candidate = `${baseSlug}-${suffix}`
          suffix += 1
        }
        usedSlugs.add(candidate)

        const page = await WikiPage.create(
          {
            id: randomUUID(),
            projectId: project.id,
            title: pageSeed.title,
            slug: candidate,
            summary: pageSeed.summary ?? null,
            contentMd: pageSeed.content,
            displayOrder,
            createdBy: pageSeed.createdBy,
            updatedBy: pageSeed.updatedBy
          },
          { transaction }
        )

        wikiPageCount += 1
        displayOrder += 1

        if (pageSeed.revisions.length > 0) {
          const revisionPayload = pageSeed.revisions.map((revision) => ({
            id: randomUUID(),
            pageId: page.id,
            title: revision.title,
            summary: revision.summary ?? null,
            contentMd: revision.content,
            createdBy: revision.authorId
          }))
          await WikiRevision.bulkCreate(revisionPayload, { transaction })
          wikiRevisionTotal += revisionPayload.length
        }
      }
    }

    logger.debug(
      `Seeded project ${seed.key} with ${seed.members.length} members, ${seed.tags.length} tags, ${seed.tasks.length} tasks, ${commentTotal} comments, ${noteCount} notes and ${wikiPageCount} wiki pages`,
      'Seed'
    )
    return {
      project,
      taskCount: seed.tasks.length,
      commentCount: commentTotal,
      noteCount,
      wikiPageCount,
      wikiRevisionCount: wikiRevisionTotal
    }
  }
}
