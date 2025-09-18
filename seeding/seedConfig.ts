import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

import type { RoleName } from '../packages/main/src/services/auth/constants'
import type { TaskStatus } from '../packages/main/src/models/Task'

const CONFIG_FILENAME = 'seed-config.json'

const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done']

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : T[P] extends object
        ? DeepPartial<T[P]>
        : T[P]
}

export interface SeedConfig {
  users: {
    profiles: Array<{ roles: RoleName[]; count: number }>
  }
  projects: {
    min: number
    max: number
    tasksPerProject: { min: number; max: number }
    backlogBufferMax: number
    tagsPerProject: { min: number; max: number }
    members: {
      maintainerAdmin: { min: number; max: number }
      contributor: { min: number; max: number }
      viewer: { min: number; max: number }
    }
  }
  comments: {
    minByStatus: Record<TaskStatus, number>
    maxByStatus: Record<TaskStatus, number>
  }
  notes: {
    perProject: { min: number; max: number }
    privateRatio: number
    notebooks: string[]
    tagsCatalog: string[]
    tagsPerNote: { min: number; max: number }
    linkProbability: number
    linkTargets: { min: number; max: number }
    checklistProbability: number
    summaryParagraphs: { min: number; max: number }
  }
}

const DEFAULT_CONFIG: SeedConfig = {
  users: {
    profiles: [
      { roles: ['Maintainer', 'Contributor'], count: 2 },
      { roles: ['Maintainer'], count: 1 },
      { roles: ['Contributor'], count: 4 },
      { roles: ['Contributor', 'Viewer'], count: 2 },
      { roles: ['Viewer'], count: 3 },
      { roles: ['Maintainer', 'Viewer'], count: 1 }
    ]
  },
  projects: {
    min: 3,
    max: 6,
    tasksPerProject: { min: 6, max: 12 },
    backlogBufferMax: 2,
    tagsPerProject: { min: 1, max: 3 },
    members: {
      maintainerAdmin: { min: 0, max: 1 },
      contributor: { min: 1, max: 3 },
      viewer: { min: 0, max: 2 }
    }
  },
  comments: {
    minByStatus: {
      todo: 0,
      in_progress: 0,
      blocked: 1,
      done: 0
    },
    maxByStatus: {
      todo: 1,
      in_progress: 2,
      blocked: 3,
      done: 1
    }
  },
  notes: {
    perProject: { min: 4, max: 9 },
    privateRatio: 0.25,
    notebooks: ['Discovery', 'Retro', 'Runbook', 'Weekly Sync'],
    tagsCatalog: [
      'meeting',
      'retro',
      'roadmap',
      'risk',
      'decision',
      'handoff',
      'support',
      'research',
      'customer'
    ],
    tagsPerNote: { min: 1, max: 3 },
    linkProbability: 0.7,
    linkTargets: { min: 1, max: 3 },
    checklistProbability: 0.55,
    summaryParagraphs: { min: 2, max: 4 }
  }
}

let cachedConfig: SeedConfig | null = null

export const loadSeedConfig = (): SeedConfig => {
  if (cachedConfig) {
    return cachedConfig
  }

  const overridePath = process.env.SEED_CONFIG_PATH?.trim()
  const targetPath = overridePath && overridePath.length > 0
    ? resolve(overridePath)
    : join(__dirname, CONFIG_FILENAME)

  let overrides: DeepPartial<SeedConfig> = {}

  if (existsSync(targetPath)) {
    try {
      const raw = readFileSync(targetPath, 'utf8')
      overrides = JSON.parse(raw) as DeepPartial<SeedConfig>
    } catch (error) {
      console.warn(`[seed] Failed to parse seed config at ${targetPath}:`, error)
    }
  }

  cachedConfig = mergeConfig(DEFAULT_CONFIG, overrides)
  return cachedConfig
}

const clampRatio = (value: number | undefined, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }
  if (value < 0) {
    return 0
  }
  if (value > 1) {
    return 1
  }
  return value
}

const mergeConfig = (defaults: SeedConfig, overrides: DeepPartial<SeedConfig>): SeedConfig => ({
  users: {
    profiles:
      overrides.users?.profiles && overrides.users.profiles.length > 0
        ? overrides.users.profiles.map((profile) => ({
            roles: (profile.roles ?? []) as RoleName[],
            count: profile.count ?? 0
          }))
        : defaults.users.profiles
  },
  projects: {
    min: overrides.projects?.min ?? defaults.projects.min,
    max: overrides.projects?.max ?? defaults.projects.max,
    tasksPerProject: {
      min: overrides.projects?.tasksPerProject?.min ?? defaults.projects.tasksPerProject.min,
      max: overrides.projects?.tasksPerProject?.max ?? defaults.projects.tasksPerProject.max
    },
    backlogBufferMax:
      overrides.projects?.backlogBufferMax ?? defaults.projects.backlogBufferMax,
    tagsPerProject: {
      min: overrides.projects?.tagsPerProject?.min ?? defaults.projects.tagsPerProject.min,
      max: overrides.projects?.tagsPerProject?.max ?? defaults.projects.tagsPerProject.max
    },
    members: {
      maintainerAdmin: {
        min:
          overrides.projects?.members?.maintainerAdmin?.min ??
          defaults.projects.members.maintainerAdmin.min,
        max:
          overrides.projects?.members?.maintainerAdmin?.max ??
          defaults.projects.members.maintainerAdmin.max
      },
      contributor: {
        min:
          overrides.projects?.members?.contributor?.min ??
          defaults.projects.members.contributor.min,
        max:
          overrides.projects?.members?.contributor?.max ??
          defaults.projects.members.contributor.max
      },
      viewer: {
        min: overrides.projects?.members?.viewer?.min ?? defaults.projects.members.viewer.min,
        max: overrides.projects?.members?.viewer?.max ?? defaults.projects.members.viewer.max
      }
    }
  },
  comments: {
    minByStatus: buildStatusMap(
      defaults.comments.minByStatus,
      overrides.comments?.minByStatus
    ),
    maxByStatus: buildStatusMap(
      defaults.comments.maxByStatus,
      overrides.comments?.maxByStatus
    )
  },
  notes: {
    perProject: {
      min: overrides.notes?.perProject?.min ?? defaults.notes.perProject.min,
      max: overrides.notes?.perProject?.max ?? defaults.notes.perProject.max
    },
    privateRatio: clampRatio(overrides.notes?.privateRatio, defaults.notes.privateRatio),
    notebooks:
      overrides.notes?.notebooks && overrides.notes.notebooks.length > 0
        ? overrides.notes.notebooks.map((value) => value.trim()).filter(Boolean)
        : defaults.notes.notebooks,
    tagsCatalog:
      overrides.notes?.tagsCatalog && overrides.notes.tagsCatalog.length > 0
        ? overrides.notes.tagsCatalog.map((value) => value.trim().toLowerCase()).filter(Boolean)
        : defaults.notes.tagsCatalog,
    tagsPerNote: {
      min: overrides.notes?.tagsPerNote?.min ?? defaults.notes.tagsPerNote.min,
      max: overrides.notes?.tagsPerNote?.max ?? defaults.notes.tagsPerNote.max
    },
    linkProbability: clampRatio(
      overrides.notes?.linkProbability,
      defaults.notes.linkProbability
    ),
    linkTargets: {
      min: overrides.notes?.linkTargets?.min ?? defaults.notes.linkTargets.min,
      max: overrides.notes?.linkTargets?.max ?? defaults.notes.linkTargets.max
    },
    checklistProbability: clampRatio(
      overrides.notes?.checklistProbability,
      defaults.notes.checklistProbability
    ),
    summaryParagraphs: {
      min:
        overrides.notes?.summaryParagraphs?.min ??
        defaults.notes.summaryParagraphs.min,
      max:
        overrides.notes?.summaryParagraphs?.max ??
        defaults.notes.summaryParagraphs.max
    }
  }
})

const buildStatusMap = (
  defaults: Record<TaskStatus, number>,
  overrides?: Partial<Record<TaskStatus, number>>
): Record<TaskStatus, number> => {
  const result: Record<TaskStatus, number> = { ...defaults }
  if (!overrides) {
    return result
  }

  for (const status of TASK_STATUSES) {
    if (overrides[status] !== undefined) {
      result[status] = overrides[status] as number
    }
  }

  return result
}

export type UsersSeedConfig = SeedConfig['users']
export type ProjectsSeedConfig = SeedConfig['projects']
export type CommentsSeedConfig = SeedConfig['comments']
export type NotesSeedConfig = SeedConfig['notes']
