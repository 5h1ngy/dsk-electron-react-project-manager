import { randomUUID } from 'node:crypto'
import type { Sequelize, Transaction } from 'sequelize'
import { Op } from 'sequelize'

import { hashPassword } from '../../auth/password'
import { Role } from '../models/Role'
import { User } from '../models/User'
import { UserRole } from '../models/UserRole'
import { Project } from '../models/Project'
import { ProjectMember } from '../models/ProjectMember'
import { ProjectTag } from '../models/ProjectTag'
import { Task } from '../models/Task'
import { env } from '../../config/env'

const SAMPLE_USERS = [
  {
    username: 'sara.rossi',
    displayName: 'Sara Rossi',
    roles: ['Maintainer'] as const,
    password: 'changeme1!'
  },
  {
    username: 'marco.bianchi',
    displayName: 'Marco Bianchi',
    roles: ['Contributor'] as const,
    password: 'changeme1!'
  },
  {
    username: 'lucia.verdi',
    displayName: 'Lucia Verdi',
    roles: ['Viewer'] as const,
    password: 'changeme1!'
  },
  {
    username: 'dev.ops',
    displayName: 'Dev Ops',
    roles: ['Contributor'] as const,
    password: 'changeme1!'
  }
]

const SAMPLE_PROJECTS = [
  {
    key: 'ALPHA',
    name: 'Alpha Migration',
    description:
      'Migrazione dell\'infrastruttura legacy verso servizi containerizzati e pipeline automatizzate.',
    tags: ['devops', 'migration', 'infra'],
    members: [
      { username: 'sara.rossi', role: 'admin' as const },
      { username: 'dev.ops', role: 'edit' as const },
      { username: 'marco.bianchi', role: 'view' as const }
    ],
    tasks: [
      {
        title: 'Analisi dipendenze legacy',
        description:
          'Raccogliere documentazione e dipendenze dei servizi legacy per definire il piano di migrazione.',
        status: 'in_progress' as const,
        priority: 'high' as const,
        dueOffsetDays: 7,
        assignee: 'sara.rossi'
      },
      {
        title: 'Setup cluster staging',
        description:
          'Provisionare cluster Kubernetes di staging e configurare il deploy automatizzato.',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueOffsetDays: 14,
        assignee: 'dev.ops'
      },
      {
        title: 'Smoke test pipeline',
        description: 'Scrivere e validare smoke test per verificare la pipeline di deploy.',
        status: 'todo' as const,
        priority: 'low' as const,
        dueOffsetDays: 21,
        assignee: null
      }
    ]
  },
  {
    key: 'BETA',
    name: 'Beta Mobile App',
    description:
      'Sviluppo dell\'app mobile per la raccolta feedback clienti con integrazione API esistenti.',
    tags: ['mobile', 'ux', 'feedback'],
    members: [
      { username: 'marco.bianchi', role: 'admin' as const },
      { username: 'lucia.verdi', role: 'view' as const }
    ],
    tasks: [
      {
        title: 'Prototipo schermate onboarding',
        description: 'Creare wireframe e prototipi interattivi del flusso di onboarding.',
        status: 'in_progress' as const,
        priority: 'medium' as const,
        dueOffsetDays: 5,
        assignee: 'lucia.verdi'
      },
      {
        title: 'Endpoint feedback API',
        description: 'Definire e documentare endpoint REST per invio feedback e analytics.',
        status: 'todo' as const,
        priority: 'high' as const,
        dueOffsetDays: 10,
        assignee: 'marco.bianchi'
      }
    ]
  },
  {
    key: 'GAMMA',
    name: 'Gamma Analytics',
    description:
      'Implementazione dashboard analytics interna con report KPI e alerting proattivo.',
    tags: ['analytics', 'kpi', 'reporting'],
    members: [
      { username: 'sara.rossi', role: 'admin' as const },
      { username: 'marco.bianchi', role: 'edit' as const },
      { username: 'lucia.verdi', role: 'view' as const }
    ],
    tasks: [
      {
        title: 'Ingestione dati CRM',
        description: 'Configurare pipeline ETL per sincronizzare dati CRM nel data warehouse.',
        status: 'todo' as const,
        priority: 'critical' as const,
        dueOffsetDays: 12,
        assignee: 'sara.rossi'
      },
      {
        title: 'Dashboard KPI vendite',
        description:
          'Creare dashboard con KPI di vendita mensili, weekly trend e previsioni trimestrali.',
        status: 'todo' as const,
        priority: 'high' as const,
        dueOffsetDays: 20,
        assignee: 'marco.bianchi'
      },
      {
        title: 'Alert sovraggiacenza lead',
        description: 'Implementare alert email per anomalie nel flusso lead-settimanale.',
        status: 'todo' as const,
        priority: 'medium' as const,
        dueOffsetDays: 28,
        assignee: null
      }
    ]
  }
]

const addDays = (days: number): Date => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

const upsertUser = async (
  transaction: Transaction,
  username: string,
  displayName: string,
  password: string,
  roles: readonly string[]
): Promise<User> => {
  const existing = await User.findOne({ where: { username }, transaction })
  if (existing) {
    return existing
  }

  const hashed = await hashPassword(password)
  const user = await User.create(
    {
      id: randomUUID(),
      username,
      displayName,
      passwordHash: hashed,
      isActive: true
    },
    { transaction }
  )

  const dbRoles = await Role.findAll({
    where: {
      name: {
        [Op.in]: roles
      }
    },
    transaction
  })

  for (const role of dbRoles) {
    await UserRole.create(
      {
        userId: user.id,
        roleId: role.id,
        createdAt: new Date()
      },
      { transaction }
    )
  }

  return user
}

const upsertProjectSeed = async (
  transaction: Transaction,
  actorUserId: string,
  seed: (typeof SAMPLE_PROJECTS)[number]
): Promise<Project | null> => {
  const existing = await Project.findOne({ where: { key: seed.key }, transaction })
  if (existing) {
    return null
  }

  const project = await Project.create(
    {
      id: randomUUID(),
      key: seed.key,
      name: seed.name,
      description: seed.description,
      createdBy: actorUserId
    },
    { transaction }
  )

  await ProjectMember.create(
    {
      projectId: project.id,
      userId: actorUserId,
      role: 'admin',
      createdAt: new Date()
    },
    { transaction }
  )

  for (const member of seed.members) {
    if (member.username === SAMPLE_USERS[0].username) {
      continue
    }
    const user = await User.findOne({ where: { username: member.username }, transaction })
    if (!user) {
      continue
    }
    await ProjectMember.upsert(
      {
        projectId: project.id,
        userId: user.id,
        role: member.role,
        createdAt: new Date()
      },
      { transaction }
    )
  }

  await ProjectTag.destroy({ where: { projectId: project.id }, transaction })

  for (const tag of seed.tags) {
    await ProjectTag.create(
      {
        id: randomUUID(),
        projectId: project.id,
        tag,
        createdAt: new Date()
      },
      { transaction }
    )
  }

  const adminUser = await User.findOne({ where: { id: actorUserId }, transaction })

  let taskIndex = 1
  for (const taskSeed of seed.tasks) {
    const assigneeUser =
      taskSeed.assignee &&
      (await User.findOne({ where: { username: taskSeed.assignee }, transaction }))
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
        dueDate: addDays(taskSeed.dueOffsetDays),
        assigneeId: assigneeUser?.id ?? null,
        ownerUserId: adminUser?.id ?? actorUserId
      },
      { transaction }
    )
    taskIndex += 1
  }

  return project
}

export const seedDevData = async (sequelize: Sequelize): Promise<void> => {
  if (!env.seedDevData) {
    return
  }

  await sequelize.transaction(async (transaction) => {
    const adminUser = await User.findOne({
      where: { username: 'admin' },
      transaction
    })
    if (!adminUser) {
      throw new Error('Default admin user not found; cannot seed data')
    }

    const seededUsers: Record<string, User> = {
      admin: adminUser
    }

    for (const userSeed of SAMPLE_USERS) {
      const user = await upsertUser(
        transaction,
        userSeed.username,
        userSeed.displayName,
        userSeed.password,
        userSeed.roles
      )
      seededUsers[userSeed.username] = user
    }

    for (const projectSeed of SAMPLE_PROJECTS) {
      await upsertProjectSeed(transaction, adminUser.id, projectSeed)
    }
  })
}










