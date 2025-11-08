/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'

import { initializeDatabase } from '@services/config/database'
import { AuditService } from '@services/services/audit'
import { ProjectService } from '@services/services/project'
import type { ProjectActor } from '@services/services/project/types'
import { TaskStatusService } from '@services/services/taskStatus'
import { TaskService } from '@services/services/task'
import { User } from '@services/models/User'
import { Role } from '@services/models/Role'
import { UserRole } from '@services/models/UserRole'
import type { RoleName } from '@services/services/auth/constants'

const createActor = (userId: string, roles: RoleName[]): ProjectActor => ({
  userId,
  roles
})

describe('TaskStatusService', () => {
  jest.setTimeout(20000)

  const setup = async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsk-task-status-service-'))
    const storagePath = join(directory, 'data.sqlite')
    const sequelize = await initializeDatabase({
      resolveStoragePath: () => storagePath,
      logging: false
    })

    const auditService = new AuditService()
    const projectService = new ProjectService(sequelize, auditService)
    const taskStatusService = new TaskStatusService(sequelize, auditService)
    const taskService = new TaskService(sequelize, auditService)

    const admin = await User.findOne({ where: { username: 'admin' } })
    if (!admin) {
      throw new Error('Default admin not found')
    }

    const actor = createActor(admin.id, ['Admin'])
    const project = await projectService.createProject(actor, {
      key: `PRJ-${randomUUID().slice(0, 6)}`,
      name: 'Task Status Project',
      description: null,
      tags: []
    })

    return {
      sequelize,
      directory,
      auditService,
      projectService,
      taskStatusService,
      taskService,
      actor,
      project
    }
  }

  const teardown = async (sequelize: any, directory: string) => {
    await sequelize.close()
    await rm(directory, { recursive: true, force: true })
  }

  it('gestisce il ciclo di vita degli stati', async () => {
    const { sequelize, directory, taskStatusService, taskService, actor, project } = await setup()

    try {
      const listed = await taskStatusService.listStatuses(actor, { projectId: project.id })
      expect(listed).toHaveLength(4)
      expect(listed.map((status) => status.key)).toEqual(['todo', 'in_progress', 'blocked', 'done'])

      const created = await taskStatusService.createStatus(actor, {
        projectId: project.id,
        label: 'Quality Assurance'
      })
      expect(created.key).toBe('quality_assurance')

      const updated = await taskStatusService.updateStatus(actor, created.id, {
        label: 'QA'
      })
      expect(updated.label).toBe('QA')

      const newOrder = [...listed.map((status) => status.id), created.id].reverse()
      const reordered = await taskStatusService.reorderStatuses(actor, {
        projectId: project.id,
        order: newOrder
      })
      expect(reordered[0].id).toBe(created.id)

      const task = await taskService.createTask(actor, {
        projectId: project.id,
        title: 'Review',
        status: created.key
      })

      const fallbackStatus = reordered.find((status) => status.id !== created.id)
      if (!fallbackStatus) {
        throw new Error('Fallback status not available')
      }

      await taskStatusService.deleteStatus(actor, {
        statusId: created.id,
        fallbackStatusId: fallbackStatus.id
      })

      const reloaded = await taskService.getTask(actor, task.id)
      expect(reloaded.status).toBe(fallbackStatus.key)
    } finally {
      await teardown(sequelize, directory)
    }
  })

  it('impedisce operazioni senza permessi adeguati', async () => {
    const { sequelize, directory, taskStatusService, project } = await setup()

    try {
      const viewerRole = await Role.findOne({ where: { name: 'Viewer' } })
      if (!viewerRole) {
        throw new Error('Viewer role not available')
      }
      const viewer = await User.create({
        id: randomUUID(),
        username: `viewer_${randomUUID().slice(0, 6)}`,
        passwordHash: 'hash',
        displayName: 'Viewer User',
        isActive: true
      })
      await UserRole.create({
        userId: viewer.id,
        roleId: viewerRole.id,
        createdAt: new Date()
      })

      const actor = createActor(viewer.id, ['Viewer'])
      await expect(
        taskStatusService.createStatus(actor, { projectId: project.id, label: 'Blocked' })
      ).rejects.toMatchObject({ code: 'ERR_PERMISSION' })
    } finally {
      await teardown(sequelize, directory)
    }
  })
})
