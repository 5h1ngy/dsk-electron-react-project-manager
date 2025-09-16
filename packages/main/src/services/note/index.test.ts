import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'

import type { Sequelize } from 'sequelize-typescript'
import { initializeDatabase } from '@main/config/database'
import { AuditService } from '@main/services/audit'
import { ProjectService } from '@main/services/project'
import type { ProjectActor } from '@main/services/project/types'
import { TaskService } from '@main/services/task'
import { NoteService } from '@main/services/note'
import { User } from '@main/models/User'
import { Role } from '@main/models/Role'
import { UserRole } from '@main/models/UserRole'
import type { RoleName } from '@main/services/auth/constants'
import { Project } from '@main/models/Project'
jest.setTimeout(20000)


class TestNoteService extends NoteService {
  constructor(
    sequelize: Sequelize,
    auditService: AuditService,
    private readonly project: Project
  ) {
    super(sequelize, auditService)
  }

  protected async resolveProjectAccess() {
    return { project: this.project, role: 'admin' }
  }

  protected async loadMembership() {
    return { projectId: this.project.id, role: 'admin' }
  }

  protected resolveActorRole(): ProjectMembershipRole {
    return 'admin'
  }
}

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
  const directory = await mkdtemp(join(tmpdir(), 'dsk-note-service-'))
  const storagePath = join(directory, 'data.sqlite')
  const sequelize = await initializeDatabase({
    resolveStoragePath: () => storagePath,
    logging: false
  })

  const auditService = new AuditService()
  const projectService = new ProjectService(sequelize, auditService)
  const taskService = new TaskService(sequelize, auditService)
  const noteService = new NoteService(sequelize, auditService)

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
    noteService,
    admin
  }
}

describe('NoteService', () => {
  it('gestisce creazione, privacy e collegamenti dei task', async () => {
    const { sequelize, directory, projectService, taskService, auditService, admin } =
      await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'NT',
        name: 'Note Tracker',
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

      const projectModel = await Project.findByPk(project.id)
      if (!projectModel) {
        throw new Error('Project not persisted')
      }

      const scopedNoteService = new TestNoteService(sequelize, auditService, projectModel)

      const task = await taskService.createTask(contributorActor, {
        projectId: project.id,
        title: 'Implementare editor',
        description: 'Creare editor markdown'
      })

      const note = await scopedNoteService.createNote(contributorActor, {
        projectId: project.id,
        title: 'Nota privata',
        body: 'Documentazione iniziale',
        isPrivate: true,
        tags: ['design', 'editor'],
        notebook: 'Diario',
        linkedTaskIds: [task.id]
      })

      expect(note.title).toBe('Nota privata')
      expect(note.tags).toEqual(expect.arrayContaining(['design', 'editor']))
      expect(note.linkedTasks).toHaveLength(1)
      expect(note.linkedTasks[0].id).toBe(task.id)

      // Viewer should not see private note unless elevated
      await expect(scopedNoteService.getNote(viewerActor, note.id)).rejects.toMatchObject({
        code: 'ERR_PERMISSION'
      })

      const viewerList = await scopedNoteService.listNotes(viewerActor, {
        projectId: project.id
      })
      expect(viewerList).toHaveLength(0)

      const adminList = await scopedNoteService.listNotes(adminActor, {
        projectId: project.id,
        includePrivate: true
      })
      expect(adminList).toHaveLength(1)

      const updated = await scopedNoteService.updateNote(contributorActor, note.id, {
        isPrivate: false,
        tags: ['editor'],
        linkedTaskIds: []
      })

      expect(updated.isPrivate).toBe(false)
      expect(updated.linkedTasks).toHaveLength(0)

      const publicList = await scopedNoteService.listNotes(viewerActor, {
        projectId: project.id
      })
      expect(publicList).toHaveLength(1)

      await scopedNoteService.deleteNote(contributorActor, note.id)

      const afterDelete = await scopedNoteService.listNotes(adminActor, {
        projectId: project.id,
        includePrivate: true
      })
      expect(afterDelete).toHaveLength(0)
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('esegue la ricerca FTS con highlight', async () => {
    const { sequelize, directory, projectService, auditService, admin } = await setup()

    try {
      const adminActor = createActor(admin.id, ['Admin'])
      const project = await projectService.createProject(adminActor, {
        key: 'FTS',
        name: 'Fulltext Suite',
        description: null
      })

      const projectModel = await Project.findByPk(project.id)
      if (!projectModel) {
        throw new Error('Project not persisted')
      }

      const scopedNoteService = new TestNoteService(sequelize, auditService, projectModel)

      await scopedNoteService.createNote(adminActor, {
        projectId: project.id,
        title: 'Roadmap Q1',
        body: 'Definire milestone critiche e analizzare rischi emergenti',
        tags: ['roadmap']
      })

      const results = await scopedNoteService.search(adminActor, { query: 'rischi' })
      expect(results).toHaveLength(1)
      expect(results[0].highlight).toContain('<mark>')
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
})
