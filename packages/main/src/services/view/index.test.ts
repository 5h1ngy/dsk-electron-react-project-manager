import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'

import { initializeDatabase } from '@main/config/database'
import { AuditService } from '@main/services/audit'
import { ProjectService } from '@main/services/project'
import type { ProjectActor } from '@main/services/project/types'
import { ViewService } from '@main/services/view'
import { AppError } from '@main/config/appError'
import { User } from '@main/models/User'
import { Role } from '@main/models/Role'
import { UserRole } from '@main/models/UserRole'
import type { RoleName } from '@main/services/auth/constants'

jest.setTimeout(20000)

const createActor = (userId: string, roles: RoleName[]): ProjectActor => ({
  userId,
  roles
})

const createUserWithRoles = async (roles: RoleName[]): Promise<User> => {
  const user = await User.create({
    id: randomUUID(),
    username: `user_${Math.random().toString(16).slice(2, 8)}`,
    passwordHash: 'hash',
    displayName: 'Test User',
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

const setup = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsk-view-service-'))
  const storagePath = join(directory, 'data.sqlite')
  const sequelize = await initializeDatabase({
    resolveStoragePath: () => storagePath,
    logging: false
  })

  const auditService = new AuditService()
  const projectService = new ProjectService(sequelize, auditService)
  const viewService = new ViewService(sequelize, auditService)

  const admin = await User.findOne({ where: { username: 'admin' } })
  if (!admin) {
    throw new Error('Default admin not available')
  }

  return {
    sequelize,
    directory,
    auditService,
    projectService,
    viewService,
    admin
  }
}

const baseFilters = () => ({
  searchQuery: '',
  status: 'all' as const,
  priority: 'all' as const,
  assignee: 'all' as const,
  dueDateRange: null as [string | null, string | null] | null
})

describe('ViewService', () => {
  it('gestisce il ciclo di vita delle viste salvate', async () => {
    const { sequelize, directory, projectService, viewService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'VW',
        name: 'View Workshop',
        description: null
      })

      const contributor = await createUserWithRoles(['Contributor'])
      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: contributor.id,
        role: 'edit'
      })

      const contributorActor = createActor(contributor.id, ['Contributor'])

      const created = await viewService.createView(contributorActor, {
        projectId: project.id,
        name: 'High priority in progress',
        filters: {
          ...baseFilters(),
          status: 'in_progress',
          priority: 'high'
        },
        sort: {
          field: 'dueDate',
          direction: 'asc'
        },
        columns: ['key', 'title', 'status', 'priority', 'dueDate', 'commentCount']
      })

      expect(created.id).toBeDefined()
      expect(created.filters.priority).toBe('high')
      expect(created.sort?.field).toBe('dueDate')
      expect(created.columns).toContain('status')

      const listed = await viewService.listViews(contributorActor, { projectId: project.id })
      expect(listed).toHaveLength(1)
      expect(listed[0].name).toBe('High priority in progress')

      const updated = await viewService.updateView(contributorActor, created.id, {
        name: 'Critical queue',
        columns: ['key', 'title', 'priority']
      })
      expect(updated.name).toBe('Critical queue')
      expect(updated.columns).toEqual(['key', 'title', 'priority'])

      await viewService.deleteView(contributorActor, created.id)
      const afterDelete = await viewService.listViews(contributorActor, {
        projectId: project.id
      })
      expect(afterDelete).toHaveLength(0)
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('impedisce aggiornamenti da parte di utenti non proprietari', async () => {
    const { sequelize, directory, projectService, viewService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'SH',
        name: 'Shared Space',
        description: null
      })

      const author = await createUserWithRoles(['Contributor'])
      const viewer = await createUserWithRoles(['Viewer'])

      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: author.id,
        role: 'edit'
      })
      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: viewer.id,
        role: 'view'
      })

      const authorActor = createActor(author.id, ['Contributor'])
      const viewerActor = createActor(viewer.id, ['Viewer'])

      const created = await viewService.createView(authorActor, {
        projectId: project.id,
        name: 'My tasks',
        filters: {
          ...baseFilters(),
          assignee: author.id
        },
        sort: null
      })

      await expect(
        viewService.updateView(viewerActor, created.id, { name: 'Hijacked view' })
      ).rejects.toMatchObject({
        code: 'ERR_PERMISSION'
      } satisfies Partial<AppError>)

      const viewerList = await viewService.listViews(viewerActor, { projectId: project.id })
      expect(viewerList).toHaveLength(0)
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
})

