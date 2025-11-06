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
  wiki: WikiSeedConfig
  sprints: SprintsSeedConfig
}

export interface WikiSeedConfig {
  perProject: { min: number; max: number }
  summarySentences: { min: number; max: number }
  sections: string[]
  paragraphsPerSection: { min: number; max: number }
  revisionProbability: number
  revisionsPerPage: { min: number; max: number }
}

export interface SprintsSeedConfig {
  perProject: { min: number; max: number }
  durationDays: { min: number; max: number }
  gapDays: { min: number; max: number }
  capacityMinutes: { min: number; max: number }
  assignmentProbability: number
}

const DEFAULT_CONFIG: SeedConfig = {
  users: {
    profiles: [
      { roles: ['Maintainer', 'Contributor'], count: 6 },
      { roles: ['Maintainer'], count: 4 },
      { roles: ['Contributor'], count: 18 },
      { roles: ['Contributor', 'Viewer'], count: 8 },
      { roles: ['Viewer'], count: 14 },
      { roles: ['Maintainer', 'Viewer'], count: 4 }
    ]
  },
  projects: {
    min: 8,
    max: 14,
    tasksPerProject: { min: 10, max: 18 },
    backlogBufferMax: 2,
    tagsPerProject: { min: 2, max: 4 },
    members: {
      maintainerAdmin: { min: 1, max: 2 },
      contributor: { min: 2, max: 4 },
      viewer: { min: 1, max: 3 }
    }
  },
  comments: {
    minByStatus: {
      todo: 0,
      in_progress: 1,
      blocked: 2,
      done: 1
    },
    maxByStatus: {
      todo: 2,
      in_progress: 3,
      blocked: 4,
      done: 2
    }
  },
  notes: {
    perProject: { min: 5, max: 10 },
    privateRatio: 0.28,
    notebooks: ['Discovery', 'Retro', 'Runbook', 'Weekly Sync', 'Incident Review'],
    tagsCatalog: [
      'retro',
      'summary',
      'risk',
      'decision',
      'handoff',
      'support',
      'customer',
      'ops',
      'kpi',
      'roadmap',
      'review',
      'audit'
    ],
    tagsPerNote: { min: 2, max: 4 },
    linkProbability: 0.7,
    linkTargets: { min: 1, max: 3 },
    checklistProbability: 0.55,
    summaryParagraphs: { min: 3, max: 5 }
  },
  wiki: {
    perProject: { min: 3, max: 6 },
    summarySentences: { min: 1, max: 3 },
    sections: [
      'Overview',
      'Architecture',
      'Operations',
      'Dependencies',
      'Risks',
      'Runbook',
      'FAQ',
      'Implementation',
      'Testing',
      'Rollout Plan'
    ],
    paragraphsPerSection: { min: 1, max: 2 },
    revisionProbability: 0.45,
    revisionsPerPage: { min: 1, max: 2 }
  },
  sprints: {
    perProject: { min: 2, max: 4 },
    durationDays: { min: 10, max: 20 },
    gapDays: { min: 1, max: 6 },
    capacityMinutes: { min: 1200, max: 4800 },
    assignmentProbability: 0.65
  }
}

let cachedConfig: SeedConfig | null = null

export const loadSeedConfig = (): SeedConfig => {
  if (cachedConfig) {
    return cachedConfig
  }

  const overridePath = process.env.SEED_CONFIG_PATH?.trim()
  const targetPath =
    overridePath && overridePath.length > 0
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
    backlogBufferMax: overrides.projects?.backlogBufferMax ?? defaults.projects.backlogBufferMax,
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
          overrides.projects?.members?.contributor?.max ?? defaults.projects.members.contributor.max
      },
      viewer: {
        min: overrides.projects?.members?.viewer?.min ?? defaults.projects.members.viewer.min,
        max: overrides.projects?.members?.viewer?.max ?? defaults.projects.members.viewer.max
      }
    }
  },
  comments: {
    minByStatus: buildStatusMap(defaults.comments.minByStatus, overrides.comments?.minByStatus),
    maxByStatus: buildStatusMap(defaults.comments.maxByStatus, overrides.comments?.maxByStatus)
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
    linkProbability: clampRatio(overrides.notes?.linkProbability, defaults.notes.linkProbability),
    linkTargets: {
      min: overrides.notes?.linkTargets?.min ?? defaults.notes.linkTargets.min,
      max: overrides.notes?.linkTargets?.max ?? defaults.notes.linkTargets.max
    },
    checklistProbability: clampRatio(
      overrides.notes?.checklistProbability,
      defaults.notes.checklistProbability
    ),
    summaryParagraphs: {
      min: overrides.notes?.summaryParagraphs?.min ?? defaults.notes.summaryParagraphs.min,
      max: overrides.notes?.summaryParagraphs?.max ?? defaults.notes.summaryParagraphs.max
    }
  },
  wiki: {
    perProject: {
      min: overrides.wiki?.perProject?.min ?? defaults.wiki.perProject.min,
      max: overrides.wiki?.perProject?.max ?? defaults.wiki.perProject.max
    },
    summarySentences: {
      min: overrides.wiki?.summarySentences?.min ?? defaults.wiki.summarySentences.min,
      max: overrides.wiki?.summarySentences?.max ?? defaults.wiki.summarySentences.max
    },
    sections:
      overrides.wiki?.sections && overrides.wiki.sections.length > 0
        ? overrides.wiki.sections
        : defaults.wiki.sections,
    paragraphsPerSection: {
      min:
        overrides.wiki?.paragraphsPerSection?.min ??
        defaults.wiki.paragraphsPerSection.min,
      max:
        overrides.wiki?.paragraphsPerSection?.max ??
        defaults.wiki.paragraphsPerSection.max
    },
    revisionProbability: clampRatio(
      overrides.wiki?.revisionProbability,
      defaults.wiki.revisionProbability
    ),
    revisionsPerPage: {
      min:
        overrides.wiki?.revisionsPerPage?.min ?? defaults.wiki.revisionsPerPage.min,
      max:
        overrides.wiki?.revisionsPerPage?.max ?? defaults.wiki.revisionsPerPage.max
    }
  },
  sprints: {
    perProject: {
      min: overrides.sprints?.perProject?.min ?? defaults.sprints.perProject.min,
      max: overrides.sprints?.perProject?.max ?? defaults.sprints.perProject.max
    },
    durationDays: {
      min: overrides.sprints?.durationDays?.min ?? defaults.sprints.durationDays.min,
      max: overrides.sprints?.durationDays?.max ?? defaults.sprints.durationDays.max
    },
    gapDays: {
      min: overrides.sprints?.gapDays?.min ?? defaults.sprints.gapDays.min,
      max: overrides.sprints?.gapDays?.max ?? defaults.sprints.gapDays.max
    },
    capacityMinutes: {
      min: overrides.sprints?.capacityMinutes?.min ?? defaults.sprints.capacityMinutes.min,
      max: overrides.sprints?.capacityMinutes?.max ?? defaults.sprints.capacityMinutes.max
    },
    assignmentProbability: clampRatio(
      overrides.sprints?.assignmentProbability,
      defaults.sprints.assignmentProbability
    )
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
