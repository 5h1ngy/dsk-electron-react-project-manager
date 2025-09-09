import type { RoleName } from '../packages/main/src/services/auth/constants'
import type { ProjectMembershipRole } from '../packages/main/src/models/ProjectMember'
import type { TaskPriority, TaskStatus } from '../packages/main/src/models/Task'
import type { User } from '../packages/main/src/models/User'

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

export interface TaskSeedDefinition {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  assigneeId: string | null
}

export interface ProjectSeedDefinition {
  key: string
  name: string
  description: string
  createdBy: string
  members: ProjectMemberSeed[]
  tags: string[]
  tasks: TaskSeedDefinition[]
}

export interface SeederState {
  adminUser: User
  seededUsers: Record<string, User>
  userRoles: Map<string, RoleName[]>
}
