import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'

import { initializeDatabase } from '../config/database'
import { AuditService } from './audit/auditService'
import { ProjectService, type ProjectActor } from './projectService'
import { ProjectMember } from '../../models/ProjectMember'
import { User } from '../../models/User'
import { Role } from '../../models/Role'
import { UserRole } from '../../models/UserRole'
import type { RoleName } from './auth/constants'

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
  const directory = await mkdtemp(join(tmpdir(), 'dsk-project-service-'))
  const storagePath = join(directory, 'data.sqlite')
  const sequelize = await initializeDatabase({
    resolveStoragePath: () => storagePath,
    logging: false
  })

  const auditService = new AuditService()
  const projectService = new ProjectService(sequelize, auditService)
  const admin = await User.findOne({ where: { username: 'admin' } })
  if (!admin) {
    throw new Error('Default admin not seeded')
  }

  return {
    sequelize,
    directory,
    projectService,
    auditService,
    admin
  }
}

describe('ProjectService', () => {
  it('creates a project and assigns creator as admin member', async () => {
    const { sequelize, directory, projectService, admin } = await setup()

    try {
      const actor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(actor, {
        key: 'KP',
        name: 'Kanban Project',
        description: 'Test',
        tags: ['kanban', 'ops']
      })

      expect(project.key).toBe('KP')
      expect(project.tags).toEqual(expect.arrayContaining(['kanban', 'ops']))
      expect(project.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userId: admin.id, role: 'admin' })
        ])
      )

      const membership = await ProjectMember.findOne({
        where: { projectId: project.id, userId: admin.id }
      })
      expect(membership?.role).toBe('admin')
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('prevents non-admin project members from updating project settings', async () => {
    const { sequelize, directory, projectService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'PR',
        name: 'Project Restricted',
        description: null
      })

      const contributor = await createUserWithRoles(['Contributor'])

      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: contributor.id,
        role: 'view'
      })

      const contributorActor = createActor(contributor.id, ['Contributor'])

      await expect(
        projectService.updateProject(contributorActor, project.id, { name: 'Nope' })
      ).rejects.toMatchObject({
        code: 'ERR_PERMISSION'
      })
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('updates member role and prevents removing last admin', async () => {
    const { sequelize, directory, projectService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'AC',
        name: 'Access Control',
        description: null
      })

      const maintainer = await createUserWithRoles(['Maintainer'])

      const updated = await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: maintainer.id,
        role: 'edit'
      })

      expect(updated.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userId: maintainer.id, role: 'edit' })
        ])
      )

      await projectService.addOrUpdateMember(adminActor, project.id, {
        userId: maintainer.id,
        role: 'admin'
      })

      const maintainerActor = createActor(maintainer.id, ['Maintainer'])

      await expect(
        projectService.removeMember(adminActor, project.id, admin.id)
      ).rejects.toMatchObject({
        code: 'ERR_PERMISSION'
      })

      const afterRemoval = await projectService.removeMember(
        adminActor,
        project.id,
        maintainer.id
      )
      expect(afterRemoval.members).not.toEqual(
        expect.arrayContaining([expect.objectContaining({ userId: maintainer.id })])
      )
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('synchronizes project tags on update', async () => {
    const { sequelize, directory, projectService, admin } = await setup()

    try {
      const actor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(actor, {
        key: 'TG',
        name: 'Taggable',
        description: null,
        tags: ['initial']
      })

      expect(project.tags).toEqual(['initial'])

      const updated = await projectService.updateProject(actor, project.id, {
        description: 'Updated',
        tags: ['updated', 'initial']
      })

      expect(updated.tags).toEqual(expect.arrayContaining(['initial', 'updated']))

      const pruned = await projectService.updateProject(actor, project.id, {
        tags: ['final']
      })

      expect(pruned.tags).toEqual(['final'])
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
})
