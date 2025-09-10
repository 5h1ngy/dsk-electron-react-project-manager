import type { ProjectMembershipRole } from '../../models/ProjectMember'
import type { ServiceActor } from '../types'

export type ProjectActor = ServiceActor

export interface ProjectSummaryDTO {
  id: string
  key: string
  name: string
  description: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  role: ProjectMembershipRole
  memberCount: number
  tags: string[]
}

export interface ProjectMemberDTO {
  userId: string
  username: string
  displayName: string
  isActive: boolean
  role: ProjectMembershipRole
  createdAt: Date
}

export interface ProjectDetailsDTO extends ProjectSummaryDTO {
  members: ProjectMemberDTO[]
}
