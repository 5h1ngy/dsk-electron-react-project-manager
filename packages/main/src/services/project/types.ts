import type { ProjectMembershipRole } from '@main/models/ProjectMember'
import type { ServiceActor } from '@main/services/types'

export type ProjectActor = ServiceActor

export interface ProjectOwnerDTO {
  id: string
  username: string
  displayName: string | null
}

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
  owner: ProjectOwnerDTO
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
