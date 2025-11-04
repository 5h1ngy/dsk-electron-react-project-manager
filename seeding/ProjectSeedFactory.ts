import type { Faker } from '@faker-js/faker'

import type { RoleName } from '../packages/main/src/services/auth/constants'
import type { User } from '../packages/main/src/models/User'
import type {
  CommentSeedDefinition,
  NoteSeedDefinition,
  ProjectMemberSeed,
  ProjectSeedDefinition,
  TaskSeedDefinition,
  WikiPageSeedDefinition,
  WikiRevisionSeedDefinition
} from './DevelopmentSeeder.types'
import type {
  CommentsSeedConfig,
  ProjectsSeedConfig,
  NotesSeedConfig,
  WikiSeedConfig
} from './seedConfig'
import { capitalize, formatIsoDate, pickWeighted, type WeightedValue } from './seed.helpers'

const TAG_CATALOG = [
  'analytics',
  'api',
  'automation',
  'backend',
  'compliance',
  'dashboard',
  'documentation',
  'integration',
  'localization',
  'migration',
  'mobile',
  'observability',
  'performance',
  'platform',
  'qa',
  'refactor',
  'release',
  'research',
  'security',
  'support',
  'ux'
] as const

const STATUS_WEIGHTS: ReadonlyArray<WeightedValue<TaskSeedDefinition['status']>> = [
  { value: 'todo', weight: 5 },
  { value: 'in_progress', weight: 4 },
  { value: 'blocked', weight: 1 },
  { value: 'done', weight: 3 }
] as const

const PRIORITY_WEIGHTS: ReadonlyArray<WeightedValue<TaskSeedDefinition['priority']>> = [
  { value: 'low', weight: 2 },
  { value: 'medium', weight: 5 },
  { value: 'high', weight: 3 },
  { value: 'critical', weight: 1 }
] as const

const COMMENT_PROMPTS = ['Progress:', 'Update:', 'Risk:', 'Note:', 'Follow-up:'] as const
const NOTE_SECTION_HEADERS = ['Context', 'Highlights', 'Risks', 'Next Steps', 'Decisions'] as const
const NOTE_PREFIXES = [
  'Meeting Notes',
  'Weekly Summary',
  'Retro',
  'Discovery Brief',
  'Incident Review',
  'Handoff',
  'Planning Digest'
] as const
const NOTE_QUOTE_PREFIXES = ['Quote', 'Reminder', 'Insight', 'Customer feedback'] as const
const WIKI_TOPIC_PREFIXES = [
  'Architecture',
  'Operations',
  'Deployment',
  'Security',
  'Quality',
  'Observability',
  'Integration',
  'Runbook',
  'Compliance',
  'Performance'
] as const
const WIKI_TITLE_SUFFIXES = ['Overview', 'Playbook', 'Guide', 'Reference', 'Deep Dive', 'Checklist'] as const

export class ProjectSeedFactory {
  constructor(
    private readonly random: Faker,
    private readonly projectConfig: ProjectsSeedConfig,
    private readonly commentConfig: CommentsSeedConfig,
    private readonly notesConfig: NotesSeedConfig,
    private readonly wikiConfig: WikiSeedConfig
  ) {}

  createSeeds(
    seededUsers: Record<string, User>,
    userRoles: Map<string, RoleName[]>,
    adminUser: User
  ): ProjectSeedDefinition[] {
    const seeds: ProjectSeedDefinition[] = []
    const pools = this.buildRolePools(seededUsers, userRoles)
    const usedKeys = new Set<string>()

    const projectCount = this.random.number.int({
      min: this.projectConfig.min,
      max: Math.max(this.projectConfig.min, this.projectConfig.max)
    })

    for (let index = 0; index < projectCount; index += 1) {
      const key = this.createUniqueProjectKey(usedKeys)
      const maintainers = (pools.get('Maintainer') ?? []).filter((user) => user.id !== adminUser.id)
      const primaryOwner =
        maintainers.length > 0 ? this.random.helpers.arrayElement(maintainers) : adminUser

      const members = new Map<string, ProjectMemberSeed['role']>()
      members.set(adminUser.id, 'admin')
      members.set(primaryOwner.id, 'admin')

      this.addMembersFromPool(
        members,
        pools,
        'Maintainer',
        'admin',
        this.projectConfig.members.maintainerAdmin,
        adminUser.id
      )
      this.addMembersFromPool(
        members,
        pools,
        'Contributor',
        'edit',
        this.projectConfig.members.contributor
      )
      this.addMembersFromPool(members, pools, 'Viewer', 'view', this.projectConfig.members.viewer)

      const tags = Array.from(
        new Set(
          this.random.helpers.arrayElements(
            TAG_CATALOG,
            this.random.number.int({
              min: this.projectConfig.tagsPerProject.min,
              max: this.projectConfig.tagsPerProject.max
            })
          )
        )
      )

      const assigneeCandidates = Array.from(members.entries())
        .filter(([, role]) => role !== 'view')
        .map(([userId]) => userId)
      const ownerCandidates =
        assigneeCandidates.length > 0 ? assigneeCandidates : [primaryOwner.id, adminUser.id]
      const commentAuthors = Array.from(members.keys())
      const memberIds = Array.from(new Set([...commentAuthors, primaryOwner.id, adminUser.id]))

      const tasks = this.buildTaskSeeds({
        assigneeCandidates,
        ownerCandidates,
        commentAuthors,
        createdBy: primaryOwner.id
      })

      const notes = this.buildNoteSeeds({
        memberIds,
        fallbackOwnerId: primaryOwner.id,
        tasks,
        projectTags: tags
      })

      const wikiPages = this.buildWikiSeeds({
        memberIds,
        primaryOwnerId: primaryOwner.id,
        projectTags: tags
      })

      seeds.push({
        key,
        name: this.random.company.catchPhrase(),
        description: this.random.lorem.paragraphs({ min: 1, max: 2 }, '\n\n'),
        createdBy: primaryOwner.id,
        members: Array.from(members.entries()).map(([userId, role]) => ({ userId, role })),
        tags,
        tasks,
        notes,
        wikiPages
      })
    }

    return seeds
  }

  private buildRolePools(
    seededUsers: Record<string, User>,
    userRoles: Map<string, RoleName[]>
  ): Map<RoleName, User[]> {
    const pools = new Map<RoleName, User[]>()
    for (const [username, user] of Object.entries(seededUsers)) {
      const roles = userRoles.get(username) ?? []
      for (const role of roles) {
        const current = pools.get(role) ?? []
        current.push(user)
        pools.set(role, current)
      }
    }
    return pools
  }

  private createUniqueProjectKey(usedKeys: Set<string>): string {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const length = this.random.number.int({ min: 3, max: 5 })
      const candidate = this.random.string.alpha({ length, casing: 'upper' })
      if (!usedKeys.has(candidate)) {
        usedKeys.add(candidate)
        return candidate
      }
    }

    const fallback = `PRJ${String(usedKeys.size + 1).padStart(3, '0')}`
    usedKeys.add(fallback)
    return fallback
  }

  private addMembersFromPool(
    members: Map<string, ProjectMemberSeed['role']>,
    pools: Map<RoleName, User[]>,
    sourceRole: RoleName,
    membershipRole: ProjectMemberSeed['role'],
    range: { min: number; max: number },
    excludedUserId?: string
  ): void {
    const pool = pools.get(sourceRole) ?? []
    const available = pool.filter(
      (user) => !members.has(user.id) && (!excludedUserId || user.id !== excludedUserId)
    )
    if (!available.length) {
      return
    }

    const max = Math.min(Math.max(range.max, 0), available.length)
    const min = Math.min(Math.max(range.min, 0), max)
    if (max === 0) {
      return
    }

    const count = min === max ? max : this.random.number.int({ min, max })
    const selected = this.random.helpers.arrayElements(available, count)
    for (const user of selected) {
      members.set(user.id, membershipRole)
    }
  }

  private buildTaskSeeds(params: {
    assigneeCandidates: string[]
    ownerCandidates: string[]
    commentAuthors: string[]
    createdBy: string
  }): TaskSeedDefinition[] {
    const taskConfig = this.projectConfig.tasksPerProject
    const baseCount = this.random.number.int({
      min: taskConfig.min,
      max: Math.max(taskConfig.min, taskConfig.max)
    })
    const backlogExtra =
      this.projectConfig.backlogBufferMax > 0
        ? (this.random.helpers.maybe(
            () =>
              this.random.number.int({
                min: 1,
                max: this.projectConfig.backlogBufferMax
              }),
            { probability: 0.5 }
          ) ?? 0)
        : 0

    const total = baseCount + backlogExtra
    const tasks: TaskSeedDefinition[] = []

    for (let taskIndex = 0; taskIndex < total; taskIndex += 1) {
      tasks.push(
        this.buildTaskSeed({
          assigneeCandidates: params.assigneeCandidates,
          ownerCandidates: params.ownerCandidates,
          commentAuthors: params.commentAuthors,
          createdBy: params.createdBy
        })
      )
    }

    return tasks
  }

  private buildTaskSeed(params: {
    assigneeCandidates: string[]
    ownerCandidates: string[]
    commentAuthors: string[]
    createdBy: string
  }): TaskSeedDefinition {
    const status = pickWeighted(this.random, STATUS_WEIGHTS)
    const priority = pickWeighted(this.random, PRIORITY_WEIGHTS)
    const dueDate =
      this.random.helpers.maybe(() => formatIsoDate(this.random.date.soon({ days: 120 })), {
        probability: status === 'done' ? 0.4 : 0.75
      }) ?? null

    const ownerId =
      params.ownerCandidates.length > 0
        ? this.random.helpers.arrayElement(params.ownerCandidates)
        : params.createdBy

    const assigneeId =
      params.assigneeCandidates.length > 0
        ? (this.random.helpers.maybe(
            () => this.random.helpers.arrayElement(params.assigneeCandidates),
            { probability: 0.85 }
          ) ?? null)
        : null

    const comments = this.buildCommentSeeds({
      status,
      ownerId,
      assigneeId,
      commentAuthors: params.commentAuthors
    })

    return {
      title: this.buildTaskTitle(),
      description: this.buildTaskDescription(status, priority),
      status,
      priority,
      dueDate,
      assigneeId: assigneeId ?? null,
      ownerId,
      comments
    }
  }

  private buildNoteSeeds(params: {
    memberIds: string[]
    fallbackOwnerId: string
    tasks: TaskSeedDefinition[]
    projectTags: string[]
  }): NoteSeedDefinition[] {
    const config = this.notesConfig
    const maxCount = Math.max(config.perProject.min, config.perProject.max)
    if (maxCount <= 0) {
      return []
    }

    const count = this.random.number.int({
      min: Math.max(0, config.perProject.min),
      max: maxCount
    })

    if (count === 0) {
      return []
    }

    const ownerPool = params.memberIds.length > 0 ? params.memberIds : [params.fallbackOwnerId]
    const tagsPool = Array.from(
      new Set([
        ...config.tagsCatalog.map((tag) => tag.toLowerCase()),
        ...params.projectTags.map((tag) => tag.toLowerCase())
      ])
    )

    const notes: NoteSeedDefinition[] = []

    for (let index = 0; index < count; index += 1) {
      const ownerId = this.random.helpers.arrayElement(ownerPool)
      const isPrivate = this.random.number.float({ min: 0, max: 1 }) < config.privateRatio

      const notebook =
        config.notebooks.length > 0
          ? (this.random.helpers.maybe(
              () => this.random.helpers.arrayElement(config.notebooks).trim(),
              { probability: 0.65 }
            ) ?? null)
          : null

      const tags = this.pickNoteTags(tagsPool)
      const linkedTaskIndexes = this.buildLinkedTaskIndexes(params.tasks.length)

      notes.push({
        title: this.buildNoteTitle(),
        body: this.buildNoteBody(),
        tags,
        isPrivate,
        notebook,
        ownerId,
        linkedTaskIndexes
      })
    }

    return notes
  }

  private buildWikiSeeds(params: {
    memberIds: string[]
    primaryOwnerId: string
    projectTags: string[]
  }): WikiPageSeedDefinition[] {
    const config = this.wikiConfig
    const maxPages = Math.max(config.perProject.min, config.perProject.max)
    if (maxPages <= 0) {
      return []
    }

    const pageCount = this.random.number.int({
      min: Math.max(0, config.perProject.min),
      max: maxPages
    })

    if (pageCount === 0) {
      return []
    }

    const authorPool = params.memberIds.length > 0 ? params.memberIds : [params.primaryOwnerId]
    const pages: WikiPageSeedDefinition[] = []

    for (let index = 0; index < pageCount; index += 1) {
      const title = this.buildWikiTitle()
      const summary =
        config.summarySentences.max > 0
          ? this.random.lorem.sentences({
              min: Math.max(1, config.summarySentences.min),
              max: Math.max(config.summarySentences.min, config.summarySentences.max)
            })
          : null

      const sections = this.pickWikiSections()
      const content = this.buildWikiContent({
        title,
        sections,
        projectTags: params.projectTags
      })

      const createdBy = this.random.helpers.arrayElement(authorPool)
      const updatedBy = this.random.helpers.arrayElement(authorPool)

      const revisions: WikiRevisionSeedDefinition[] =
        this.random.number.float({ min: 0, max: 1 }) < config.revisionProbability
          ? this.buildWikiRevisions({
              sections,
              authorPool,
              baseTitle: title,
              summary,
              projectTags: params.projectTags
            })
          : []

      pages.push({
        title,
        summary,
        content,
        createdBy,
        updatedBy,
        revisions
      })
    }

    return pages
  }

  private buildWikiTitle(): string {
    const topic = this.random.helpers.arrayElement(WIKI_TOPIC_PREFIXES)
    const suffix = this.random.helpers.arrayElement(WIKI_TITLE_SUFFIXES)
    return `${topic} ${suffix}`
  }

  private pickWikiSections(): string[] {
    const catalog = this.wikiConfig.sections.length
      ? this.wikiConfig.sections
      : ['Overview', 'Details', 'Procedures', 'Notes']
    const min = Math.min(2, catalog.length)
    const max = Math.min(5, catalog.length)
    const count = this.random.number.int({ min, max })
    const sections = this.random.helpers.arrayElements(catalog, count)
    if (!sections.includes('Overview')) {
      sections.unshift('Overview')
    }
    return sections
  }

  private buildWikiContent(params: {
    title: string
    sections: string[]
    projectTags: string[]
  }): string {
    const paragraphRange = this.wikiConfig.paragraphsPerSection
    const tagSnippet =
      params.projectTags.length > 0
        ? `> Related tags: ${params.projectTags
            .slice(0, 4)
            .map((tag) => `\`${tag}\``)
            .join(', ')}\n\n`
        : ''

    let content = `# ${params.title}\n\n${tagSnippet}`
    for (const section of params.sections) {
      content += `## ${section}\n\n`
      const paragraphCount = this.random.number.int({
        min: Math.max(1, paragraphRange.min),
        max: Math.max(paragraphRange.min, paragraphRange.max)
      })
      for (let index = 0; index < paragraphCount; index += 1) {
        content += `${this.random.lorem.paragraph()}\n\n`
      }

      if (this.random.number.float({ min: 0, max: 1 }) < 0.35) {
        const bulletCount = this.random.number.int({ min: 2, max: 4 })
        for (let bullet = 0; bullet < bulletCount; bullet += 1) {
          content += `- ${capitalize(this.random.lorem.sentence())}\n`
        }
        content += '\n'
      }
    }

    return content.trimEnd()
  }

  private buildWikiRevisions(params: {
    sections: string[]
    authorPool: string[]
    baseTitle: string
    summary: string | null
    projectTags: string[]
  }): WikiRevisionSeedDefinition[] {
    const range = this.wikiConfig.revisionsPerPage
    const revisionCount = this.random.number.int({
      min: Math.max(1, range.min),
      max: Math.max(range.min, range.max)
    })

    const revisions: WikiRevisionSeedDefinition[] = []
    for (let index = 0; index < revisionCount; index += 1) {
      const authorId = this.random.helpers.arrayElement(params.authorPool)
      const summary =
        params.summary && params.summary.length > 0
          ? this.random.lorem.sentences({
              min: 1,
              max: Math.max(1, this.wikiConfig.summarySentences.max)
            })
          : null

      const shuffledSections =
        params.sections.length > 2
          ? this.random.helpers.shuffle(params.sections).slice(
              0,
              this.random.number.int({
                min: Math.max(1, params.sections.length - 1),
                max: params.sections.length
              })
            )
          : params.sections

      revisions.push({
        title:
          index === 0
            ? `${params.baseTitle} (Draft)`
            : `${params.baseTitle} (Rev ${index})`,
        summary,
        content: this.buildWikiContent({
          title: params.baseTitle,
          sections: shuffledSections,
          projectTags: params.projectTags
        }),
        authorId
      })
    }

    return revisions
  }

  private buildCommentSeeds(params: {
    status: TaskSeedDefinition['status']
    ownerId: string
    assigneeId: string | null
    commentAuthors: string[]
  }): CommentSeedDefinition[] {
    if (!params.commentAuthors.length) {
      return []
    }

    const maxMap = this.commentConfig.maxByStatus
    const minMap = this.commentConfig.minByStatus

    const max = maxMap[params.status] ?? 0
    const min = Math.min(minMap[params.status] ?? 0, max)

    if (max === 0) {
      return []
    }

    const commentCount = this.random.number.int({ min, max })
    if (commentCount === 0) {
      return []
    }

    const authors = this.random.helpers.arrayElements(
      params.commentAuthors,
      Math.min(params.commentAuthors.length, commentCount + 1)
    )

    const comments: CommentSeedDefinition[] = []
    for (let index = 0; index < commentCount; index += 1) {
      const authorId = authors[index % authors.length]
      comments.push({
        authorId,
        body: this.buildCommentBody({
          status: params.status,
          authorRole:
            authorId === params.assigneeId
              ? 'assignee'
              : authorId === params.ownerId
                ? 'owner'
                : 'member'
        })
      })
    }

    return comments
  }

  private buildCommentBody(params: {
    status: TaskSeedDefinition['status']
    authorRole: 'owner' | 'assignee' | 'member'
  }): string {
    const prompt = this.random.helpers.arrayElement(COMMENT_PROMPTS)
    const summary = `${prompt} ${this.random.lorem.sentence()}`
    const context = this.random.helpers.maybe(() => this.random.lorem.sentence(), {
      probability: 0.4
    })
    const closing =
      params.authorRole === 'owner'
        ? 'Owner note: keep scope tight.'
        : params.authorRole === 'assignee'
          ? 'Assignee note: update in next stand-up.'
          : 'Ping me if support is needed.'

    const blocker =
      params.status === 'blocked'
        ? `Blocking issue: awaiting ${this.random.company.bsNoun()}.`
        : undefined

    return [summary, blocker, context, closing].filter(Boolean).join(' ')
  }

  private buildTaskTitle(): string {
    const verb = capitalize(this.random.hacker.verb())
    const noun = this.random.hacker.noun().replace(/_/g, ' ')
    const suffix = this.random.helpers.maybe(() => ` (${this.random.hacker.abbreviation()})`, {
      probability: 0.2
    })
    const title = `${verb} ${noun}${suffix ?? ''}`
    return title.slice(0, 160)
  }

  private buildTaskDescription(
    status: TaskSeedDefinition['status'],
    priority: TaskSeedDefinition['priority']
  ): string {
    const summary = this.random.lorem.sentences({ min: 1, max: 2 })
    const checklistItems = this.random.helpers.multiple(
      () => `- [ ] ${capitalize(this.random.hacker.phrase())}`,
      { count: this.random.number.int({ min: 2, max: 4 }) }
    )
    const definitionOfDone = this.random.helpers.multiple(
      () => `- ${capitalize(this.random.company.bsBuzz())}`,
      { count: 2 }
    )
    const riskNote = this.random.helpers.maybe(
      () => `> Risk: ${capitalize(this.random.hacker.phrase())}.`,
      { probability: priority === 'critical' ? 0.85 : 0.3 }
    )
    const statusNote =
      status === 'blocked'
        ? '> Current state: Blocked, see comments.'
        : status === 'done'
          ? '> Current state: Delivered and awaiting review.'
          : '> Current state: In progress.'

    return [
      '### Summary',
      summary,
      '',
      '### Checklist',
      checklistItems.join('\n'),
      '',
      '### Acceptance',
      definitionOfDone.join('\n'),
      '',
      '### Notes',
      [statusNote, riskNote].filter(Boolean).join('\n')
    ]
      .filter(Boolean)
      .join('\n')
  }

  private pickNoteTags(pool: string[]): string[] {
    if (!pool.length) {
      return []
    }

    const max = Math.min(Math.max(this.notesConfig.tagsPerNote.max, 0), pool.length)
    const min = Math.min(Math.max(this.notesConfig.tagsPerNote.min, 0), max)

    if (max === 0) {
      return []
    }

    const count = min === max ? max : this.random.number.int({ min, max })
    if (count === 0) {
      return []
    }

    return this.random.helpers.arrayElements(pool, count).map((tag) => tag.toLowerCase())
  }

  private buildLinkedTaskIndexes(taskCount: number): number[] {
    if (taskCount === 0) {
      return []
    }
    if (this.random.number.float({ min: 0, max: 1 }) > this.notesConfig.linkProbability) {
      return []
    }

    const max = Math.min(Math.max(this.notesConfig.linkTargets.max, 0), taskCount)
    const min = Math.min(Math.max(this.notesConfig.linkTargets.min, 0), max)

    if (max === 0) {
      return []
    }

    const count = min === max ? max : this.random.number.int({ min, max })
    if (count === 0) {
      return []
    }

    const indexes = this.random.helpers.arrayElements(
      Array.from({ length: taskCount }, (_, index) => index),
      count
    )

    return Array.from(new Set(indexes)).sort((a, b) => a - b)
  }

  private buildNoteTitle(): string {
    const prefix = this.random.helpers.arrayElement(NOTE_PREFIXES)
    const subject = capitalize(this.random.company.bsNoun())
    const qualifier = this.random.helpers.maybe(() => capitalize(this.random.company.bsBuzz()), {
      probability: 0.4
    })
    const composed = qualifier ? `${prefix}: ${subject} ${qualifier}` : `${prefix}: ${subject}`
    return composed.slice(0, 160)
  }

  private buildNoteBody(): string {
    const sectionCount = this.random.number.int({
      min: Math.max(1, this.notesConfig.summaryParagraphs.min),
      max: Math.max(this.notesConfig.summaryParagraphs.min, this.notesConfig.summaryParagraphs.max)
    })

    const sections: string[] = []
    for (let index = 0; index < sectionCount; index += 1) {
      const header = NOTE_SECTION_HEADERS[index % NOTE_SECTION_HEADERS.length]
      const paragraph = this.random.lorem.sentences({ min: 2, max: 4 })
      sections.push(`## ${header}\n\n${paragraph}`)
    }

    if (this.random.number.float({ min: 0, max: 1 }) < this.notesConfig.checklistProbability) {
      const checklistItems = this.random.helpers.multiple(
        () => `- [ ] ${capitalize(this.random.company.bsBuzz())}`,
        { count: this.random.number.int({ min: 2, max: 5 }) }
      )
      sections.push(`### Checklist\n\n${checklistItems.join('\n')}`)
    }

    const quote = this.random.helpers.maybe(
      () =>
        `> ${this.random.helpers.arrayElement(NOTE_QUOTE_PREFIXES)}: ${capitalize(this.random.hacker.phrase())}.`,
      { probability: 0.35 }
    )
    if (quote) {
      sections.push(quote)
    }

    return sections.join('\n\n')
  }
}
