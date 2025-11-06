import { randomUUID } from 'node:crypto'
import type { Transaction } from 'sequelize'

import { Comment } from '../packages/main/src/models/Comment'
import { Project } from '../packages/main/src/models/Project'
import { ProjectMember } from '../packages/main/src/models/ProjectMember'
import { ProjectTag } from '../packages/main/src/models/ProjectTag'
import { Task } from '../packages/main/src/models/Task'
import { TaskStatus } from '../packages/main/src/models/TaskStatus'
import { Sprint } from '../packages/main/src/models/Sprint'
import { Note } from '../packages/main/src/models/Note'
import { NoteTag } from '../packages/main/src/models/NoteTag'
import { NoteTaskLink } from '../packages/main/src/models/NoteTaskLink'
import { WikiPage } from '../packages/main/src/models/WikiPage'
import { WikiRevision } from '../packages/main/src/models/WikiRevision'
import { logger } from '../packages/main/src/config/logger'
import { DEFAULT_TASK_STATUSES } from '../packages/main/src/services/taskStatus/defaults'

import type {
  NoteSeedDefinition,
  ProjectSeedDefinition,
  SprintSeedDefinition,
  TaskSeedDefinition,
  WikiPageSeedDefinition
} from './DevelopmentSeeder.types'

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
    sprintCount: number
    taskCount: number
    commentCount: number
    noteCount: number
    wikiPageCount: number
    wikiRevisionCount: number
  }> {
    const existing = await Project.findOne({ where: { key: seed.key }, transaction })

    let project: Project
    let createdProject = false

    if (!existing) {
      project = await Project.create(
        {
          id: randomUUID(),
          key: seed.key,
          name: seed.name,
          description: seed.description,
          createdBy: seed.createdBy
        },
        { transaction }
      )
      createdProject = true
    } else {
      project = existing
      const needsUpdate =
        existing.name !== seed.name || (existing.description ?? null) !== seed.description
      if (needsUpdate) {
        existing.name = seed.name
        existing.description = seed.description
        await existing.save({ transaction })
      }
    }

    await this.syncMembers(project, seed.members, transaction)
    await this.syncTags(project, seed.tags, transaction)
    await this.ensureTaskStatuses(project, transaction)

    const sprintSync = await this.syncSprints(project, seed.sprints ?? [], transaction)

    const taskSync = await this.syncTasks(
      project,
      seed.tasks,
      seed.createdBy,
      sprintSync.sprints,
      transaction
    )
    const noteSync = await this.syncNotes(project, seed.notes, taskSync.orderedTasks, transaction)
    const wikiSync = await this.syncWiki(project, seed.wikiPages, transaction)

    if (createdProject) {
      logger.debug(
        `Seeded project ${project.key} with ${seed.members.length} members, ${seed.tags.length} tags, ${sprintSync.createdSprints} sprints, ${taskSync.createdTasks} tasks, ${taskSync.createdComments} comments, ${noteSync.createdNotes} notes and ${wikiSync.createdPages} wiki pages`,
        'Seed'
      )
    } else if (
      sprintSync.createdSprints > 0 ||
      taskSync.createdTasks > 0 ||
      noteSync.createdNotes > 0 ||
      wikiSync.createdPages > 0
    ) {
      logger.debug(
        `Topped up project ${project.key}: +${sprintSync.createdSprints} sprints, +${taskSync.createdTasks} tasks, +${taskSync.createdComments} comments, +${noteSync.createdNotes} notes, +${wikiSync.createdPages} wiki pages`,
        'Seed'
      )
    } else {
      logger.debug(`Project ${project.key} already aligned with seed configuration`, 'Seed')
    }

    return {
      project: createdProject ? project : null,
      sprintCount: sprintSync.createdSprints,
      taskCount: taskSync.createdTasks,
      commentCount: taskSync.createdComments,
      noteCount: noteSync.createdNotes,
      wikiPageCount: wikiSync.createdPages,
      wikiRevisionCount: wikiSync.createdRevisions
    }
  }

  private async syncMembers(
    project: Project,
    members: ProjectSeedDefinition['members'],
    transaction: Transaction
  ): Promise<void> {
    for (const member of members) {
      const existing = await ProjectMember.findOne({
        where: { projectId: project.id, userId: member.userId },
        transaction
      })

      if (!existing) {
        await ProjectMember.create(
          {
            projectId: project.id,
            userId: member.userId,
            role: member.role,
            createdAt: new Date()
          },
          { transaction }
        )
        continue
      }

      if (existing.role !== member.role) {
        existing.role = member.role
        await existing.save({ transaction })
      }
    }
  }

  private async syncTags(
    project: Project,
    tags: string[],
    transaction: Transaction
  ): Promise<void> {
    await ProjectTag.destroy({ where: { projectId: project.id }, transaction })

    if (!tags.length) {
      return
    }

    await ProjectTag.bulkCreate(
      tags.map((tag) => ({
        id: randomUUID(),
        projectId: project.id,
        tag,
        createdAt: new Date()
      })),
      { transaction }
    )
  }

  private async ensureTaskStatuses(project: Project, transaction: Transaction): Promise<void> {
    const existing = await TaskStatus.findAll({
      where: { projectId: project.id },
      order: [['position', 'ASC']],
      transaction
    })

    const existingKeys = new Set(existing.map((status) => status.key))
    const missing = DEFAULT_TASK_STATUSES.filter((status) => !existingKeys.has(status.key))

    if (missing.length === 0) {
      return
    }

    const basePosition =
      existing.reduce((max, status) => Math.max(max, status.position ?? 0), 0) ?? 0
    const timestamp = new Date()

    await TaskStatus.bulkCreate(
      missing.map((status, index) => ({
        id: randomUUID(),
        projectId: project.id,
        key: status.key,
        label: status.label,
        position: basePosition + index + 1,
        createdAt: timestamp,
        updatedAt: timestamp
      })),
      { transaction }
    )
  }

  private async syncSprints(
    project: Project,
    sprintSeeds: SprintSeedDefinition[],
    transaction: Transaction
  ): Promise<{ createdSprints: number; updatedSprints: number; sprints: Sprint[] }> {
    if (sprintSeeds.length === 0) {
      const existingSprints = await Sprint.findAll({
        where: { projectId: project.id },
        order: [['sequence', 'ASC']],
        transaction
      })
      return { createdSprints: 0, updatedSprints: 0, sprints: existingSprints }
    }

    const existing = await Sprint.findAll({
      where: { projectId: project.id },
      order: [['sequence', 'ASC']],
      transaction
    })

    let created = 0
    let updated = 0
    const sprints: Sprint[] = []

    for (let index = 0; index < sprintSeeds.length; index += 1) {
      const seed = sprintSeeds[index]
      const current = existing[index]

      if (current) {
        const goal = seed.goal ?? null
        const capacity = seed.capacityMinutes ?? null
        const needsUpdate =
          current.name !== seed.name ||
          (current.goal ?? null) !== goal ||
          current.startDate !== seed.startDate ||
          current.endDate !== seed.endDate ||
          current.status !== seed.status ||
          current.capacityMinutes !== capacity ||
          current.sequence !== seed.sequence

        if (needsUpdate) {
          current.name = seed.name
          current.goal = goal
          current.startDate = seed.startDate
          current.endDate = seed.endDate
          current.status = seed.status
          current.capacityMinutes = capacity
          current.sequence = seed.sequence
          await current.save({ transaction })
          updated += 1
        }
        sprints.push(current)
      } else {
        const sprint = await Sprint.create(
          {
            id: randomUUID(),
            projectId: project.id,
            name: seed.name,
            goal: seed.goal,
            startDate: seed.startDate,
            endDate: seed.endDate,
            status: seed.status,
            capacityMinutes: seed.capacityMinutes,
            sequence: seed.sequence
          },
          { transaction }
        )
        created += 1
        sprints.push(sprint)
      }
    }

    return { createdSprints: created, updatedSprints: updated, sprints }
  }

  private resolveTaskSequence(prefix: string, tasks: Task[]): number {
    let max = 0

    for (const task of tasks) {
      const key = task.key ?? ''
      if (!key.startsWith(prefix)) {
        continue
      }

      const suffix = key.slice(prefix.length)
      const numeric = Number.parseInt(suffix, 10)
      if (!Number.isNaN(numeric) && numeric > max) {
        max = numeric
      }
    }

    return max
  }

  private async syncTasks(
    project: Project,
    taskSeeds: TaskSeedDefinition[],
    createdByFallback: string,
    sprints: Sprint[],
    transaction: Transaction
  ): Promise<{ createdTasks: number; createdComments: number; orderedTasks: Task[] }> {
    if (taskSeeds.length === 0) {
      return { createdTasks: 0, createdComments: 0, orderedTasks: [] }
    }

    const existingTasks = await Task.findAll({
      where: { projectId: project.id },
      order: [['key', 'ASC']],
      transaction,
      paranoid: false
    })

    const activeTasks = existingTasks.filter(
      (task) => (task as unknown as { deletedAt?: Date | null }).deletedAt == null
    )

    const orderedTasks: Task[] = [...activeTasks]

    if (activeTasks.length >= taskSeeds.length) {
      return { createdTasks: 0, createdComments: 0, orderedTasks }
    }

    let createdTasks = 0
    let createdComments = 0

    let nextSequence = this.resolveTaskSequence(`${project.key}-`, existingTasks) + 1
    const tasksToCreate = taskSeeds.slice(activeTasks.length)

    for (const taskSeed of tasksToCreate) {
      const key = `${project.key}-${String(nextSequence).padStart(3, '0')}`
      nextSequence += 1

      const sprint = taskSeed.sprintIndex !== null ? sprints[taskSeed.sprintIndex] : undefined

      const task = await Task.create(
        {
          id: randomUUID(),
          projectId: project.id,
          key,
          parentId: null,
          title: taskSeed.title,
          description: taskSeed.description,
          status: taskSeed.status,
          priority: taskSeed.priority,
          dueDate: taskSeed.dueDate,
          assigneeId: taskSeed.assigneeId,
          ownerUserId: taskSeed.ownerId ?? createdByFallback,
          sprintId: sprint?.id ?? null,
          estimatedMinutes: taskSeed.estimatedMinutes ?? null
        },
        { transaction }
      )

      orderedTasks.push(task)
      createdTasks += 1

      if (taskSeed.comments.length > 0) {
        const payload = taskSeed.comments.map((comment) => ({
          id: randomUUID(),
          taskId: task.id,
          authorId: comment.authorId,
          body: comment.body
        }))
        await Comment.bulkCreate(payload, { transaction })
        createdComments += taskSeed.comments.length
      }
    }

    return { createdTasks, createdComments, orderedTasks }
  }

  private async syncNotes(
    project: Project,
    noteSeeds: NoteSeedDefinition[],
    taskIndexMap: Task[],
    transaction: Transaction
  ): Promise<{ createdNotes: number }> {
    if (noteSeeds.length === 0) {
      return { createdNotes: 0 }
    }

    const existingNotesCount = await Note.count({ where: { projectId: project.id }, transaction })
    if (existingNotesCount >= noteSeeds.length) {
      return { createdNotes: 0 }
    }

    let createdNotes = 0

    for (const noteSeed of noteSeeds.slice(existingNotesCount)) {
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

      createdNotes += 1

      if (noteSeed.tags.length > 0) {
        await NoteTag.bulkCreate(
          noteSeed.tags.map((tag) => ({
            noteId: note.id,
            tag
          })),
          { transaction }
        )
      }

      if (noteSeed.linkedTaskIndexes.length > 0 && taskIndexMap.length > 0) {
        const taskIds = Array.from(
          new Set(
            noteSeed.linkedTaskIndexes
              .map((index) => taskIndexMap[index])
              .filter((task): task is Task => Boolean(task))
              .map((task) => task.id)
          )
        )

        if (taskIds.length > 0) {
          await NoteTaskLink.bulkCreate(
            taskIds.map((taskId) => ({
              noteId: note.id,
              taskId
            })),
            { transaction }
          )
        }
      }
    }

    return { createdNotes }
  }

  private async syncWiki(
    project: Project,
    pageSeeds: WikiPageSeedDefinition[],
    transaction: Transaction
  ): Promise<{ createdPages: number; createdRevisions: number }> {
    if (pageSeeds.length === 0) {
      return { createdPages: 0, createdRevisions: 0 }
    }

    const existingPages = await WikiPage.findAll({
      where: { projectId: project.id },
      order: [['displayOrder', 'ASC']],
      transaction
    })

    if (existingPages.length >= pageSeeds.length) {
      return { createdPages: 0, createdRevisions: 0 }
    }

    const usedSlugs = new Set(existingPages.map((page) => page.slug))
    const maxDisplayOrder =
      existingPages.length > 0
        ? Math.max(...existingPages.map((page) => page.displayOrder ?? 0))
        : -1

    let displayOrder = maxDisplayOrder + 1
    let createdPages = 0
    let createdRevisions = 0

    for (const pageSeed of pageSeeds.slice(existingPages.length)) {
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

      createdPages += 1
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
        createdRevisions += revisionPayload.length
      }
    }

    return { createdPages, createdRevisions }
  }
}
