import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'

import { initializeDatabase } from '@main/config/database'
import { AuditService } from '@main/services/audit'
import { ProjectService } from '@main/services/project'
import type { ProjectActor } from '@main/services/project/types'
import { TaskService } from '@main/services/task'
import { User } from '@main/models/User'
import { Role } from '@main/models/Role'
import { UserRole } from '@main/models/UserRole'
import type { RoleName } from '@main/services/auth/constants'

const createActor = (userId: string, roles: RoleName[]): ProjectActor => ({
  userId,
  roles
})

const createUserWithRoles = async (roles: RoleName[]): Promise<User> => {
  const user = await User.create({
    id: randomUUID(),
    username: `user_${Math.random().toString(16).slice(2, 8)}`,
    passwordHash: 'hash',
    displayName: 'Task User',
    isActive: true
  })

  const dbRoles = await Role.findAll({ where: { name: roles } })
  for (const role of dbRoles) {
    await UserRole.create({
      userId: user.id,
      roleId: role.id,
      createdAt: new Date()
    })
  }

  return user
}

const tomorrow = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

const setup = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsk-task-service-'))
  const storagePath = join(directory, 'data.sqlite')
  const sequelize = await initializeDatabase({
    resolveStoragePath: () => storagePath,
    logging: false
  })

  const auditService = new AuditService()
  const projectService = new ProjectService(sequelize, auditService)
  const taskService = new TaskService(sequelize, auditService)
  const admin = await User.findOne({ where: { username: 'admin' } })
  if (!admin) {
    throw new Error('Default admin not available')
  }

  return {
    sequelize,
    directory,
    auditService,
    projectService,
    taskService,
    admin
  }
}

describe('TaskService', () => {
  it('creates tasks with sequential keys and allows status updates', async () => {
    const { sequelize, directory, projectService, taskService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'TSK',
        name: 'Task Suite',
        description: null
      })

      const firstTask = await taskService.createTask(adminActor, {
        projectId: project.id,
        title: 'Initial task',
        description: 'Something to do',
        dueDate: tomorrow()
      })

      expect(firstTask.key).toBe('TSK-1')
      expect(firstTask.status).toBe('todo')

      const secondTask = await taskService.createTask(adminActor, {
        projectId: project.id,
        title: 'Second task',
        description: null
      })

      expect(secondTask.key).toBe('TSK-2')

      const updated = await taskService.updateTask(adminActor, firstTask.id, {
        status: 'in_progress',
        priority: 'high'
      })

      expect(updated.status).toBe('in_progress')
      expect(updated.priority).toBe('high')

      const board = await taskService.listByProject(adminActor, project.id)
      expect(board).toHaveLength(2)
      expect(board.map((task) => task.key)).toEqual(expect.arrayContaining(['TSK-1', 'TSK-2']))
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('enforces permissions, supports comments and search', async () => {
    const { sequelize, directory, projectService, taskService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'PM',
        name: 'Permission Matrix',
        description: null
      })

      const contributor = await createUserWithRoles(['Contributor'])
      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: contributor.id,
        role: 'edit'
      })
      const viewer = await createUserWithRoles(['Viewer'])
      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: viewer.id,
        role: 'view'
      })

      const contributorActor = createActor(contributor.id, ['Contributor'])
      const viewerActor = createActor(viewer.id, ['Viewer'])

      const task = await taskService.createTask(contributorActor, {
        projectId: project.id,
        title: 'Accessible task',
        description: 'Available to the board'
      })

      await expect(
        taskService.createTask(viewerActor, {
          projectId: project.id,
          title: 'Should fail',
          description: null
        })
      ).rejects.toMatchObject({ code: 'ERR_PERMISSION' })

      const comment = await taskService.addComment(contributorActor, {
        taskId: task.id,
        body: 'This needs to be done soon'
      })

      expect(comment.body).toContain('needs')

      const comments = await taskService.listComments(contributorActor, task.id)
      expect(comments).toHaveLength(1)

      const results = await taskService.search(adminActor, { query: 'Accessible' })
      expect(results.map((item) => item.id)).toContain(task.id)
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
})
