import { randomUUID } from 'node:crypto'
import type { Transaction } from 'sequelize'

import { Project } from '../packages/main/src/db/models/Project'
import { ProjectMember } from '../packages/main/src/db/models/ProjectMember'
import { ProjectTag } from '../packages/main/src/db/models/ProjectTag'
import { Task } from '../packages/main/src/db/models/Task'
import { logger } from '../packages/main/src/config/logger'

import type { ProjectSeedDefinition } from './DevelopmentSeeder.types'

export class ProjectSeeder {
  async upsert(transaction: Transaction, seed: ProjectSeedDefinition) {
    const existing = await Project.findOne({ where: { key: seed.key }, transaction })
    if (existing) {
      logger.debug(`Project ${seed.key} already present, skipping`, 'Seed')
      return null
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
    for (const taskSeed of seed.tasks) {
      await Task.create(
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
          ownerUserId: seed.createdBy
        },
        { transaction }
      )
      taskIndex += 1
    }

    logger.debug(
      `Seeded project ${seed.key} with ${seed.members.length} members, ${seed.tags.length} tags and ${seed.tasks.length} tasks`,
      'Seed'
    )
    return project
  }
}
