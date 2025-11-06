import type { ProjectMembershipRole } from '../packages/main/src/models/ProjectMember'
import type { TaskPriority, TaskStatus } from '../packages/main/src/models/Task'
import type { SprintStatus } from '../packages/main/src/models/Sprint'
import type { User } from '../packages/main/src/models/User'
import type { RoleName } from '../packages/main/src/services/auth/constants'

export interface DevelopmentSeederOptions {
  fakerSeed?: number
  passwordSeed?: string
}

export interface UserSeedDefinition {
  username: string
  displayName: string
  roles: RoleName[]
}

export interface ProjectMemberSeed {
  userId: string
  role: ProjectMembershipRole
}

export interface CommentSeedDefinition {
  authorId: string
  body: string
}

export interface TaskSeedDefinition {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
  ownerId: string
  comments: CommentSeedDefinition[]
  sprintIndex: number | null
  estimatedMinutes: number | null
}

export interface NoteSeedDefinition {
  title: string
  body: string
  tags: string[]
  isPrivate: boolean
  notebook: string | null
  ownerId: string
  linkedTaskIndexes: number[]
}

export interface WikiRevisionSeedDefinition {
  title: string
  summary: string | null
  content: string
  authorId: string
}

export interface WikiPageSeedDefinition {
  title: string
  summary: string | null
  content: string
  createdBy: string
  updatedBy: string
  revisions: WikiRevisionSeedDefinition[]
}

export interface ProjectSeedDefinition {
  key: string
  name: string
  description: string
  createdBy: string
  members: ProjectMemberSeed[]
  tags: string[]
  tasks: TaskSeedDefinition[]
  notes: NoteSeedDefinition[]
  wikiPages: WikiPageSeedDefinition[]
  sprints: SprintSeedDefinition[]
}

export interface SeederState {
  adminUser: User
  seededUsers: Record<string, User>
  userRoles: Map<string, RoleName[]>
}

export interface SprintSeedDefinition {
  name: string
  goal: string | null
  startDate: string
  endDate: string
  status: SprintStatus
  capacityMinutes: number | null
  sequence: number
}
