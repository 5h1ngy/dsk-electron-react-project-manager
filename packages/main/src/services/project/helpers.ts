import { AppError } from '@main/config/appError'
import type { Project } from '@main/models/Project'
import type { ProjectMember, ProjectMembershipRole } from '@main/models/ProjectMember'
import type { ProjectTag } from '@main/models/ProjectTag'
import type {
  ProjectDetailsDTO,
  ProjectMemberDTO,
  ProjectSummaryDTO,
  ProjectOwnerDTO
} from '@main/services/project/types'
import type { User } from '@main/models/User'

const collectTags = (project: Project & { tags?: ProjectTag[] }): string[] =>
  (project.tags ?? []).map((tag) => tag.tag)

export const mapProjectMember = (member: ProjectMember): ProjectMemberDTO => {
  const user = member.user
  if (!user) {
    throw new AppError('ERR_INTERNAL', 'Member user relation missing')
  }
  return {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    isActive: user.isActive,
    role: member.role,
    createdAt: member.createdAt
  }
}

const resolveOwner = (project: Project & { creator?: User | null }): ProjectOwnerDTO => {
  const creator = project.creator ?? null
  if (creator) {
    return {
      id: creator.id,
      username: creator.username,
      displayName: creator.displayName ?? creator.username
    }
  }
  return {
    id: project.createdBy,
    username: project.createdBy,
    displayName: project.createdBy
  }
}

export const mapProjectSummary = (
  project: Project & { tags?: ProjectTag[]; creator?: User | null },
  role: ProjectMembershipRole,
  memberCount: number
): ProjectSummaryDTO => ({
  id: project.id,
  key: project.key,
  name: project.name,
  description: project.description ?? null,
  createdBy: project.createdBy,
  createdAt: project.createdAt!,
  updatedAt: project.updatedAt!,
  role,
  memberCount,
  tags: collectTags(project),
  owner: resolveOwner(project)
})

export const mapProjectDetails = (
  project: Project & { tags?: ProjectTag[]; creator?: User | null },
  role: ProjectMembershipRole,
  memberCount: number,
  members: ProjectMember[]
): ProjectDetailsDTO => ({
  ...mapProjectSummary(project, role, memberCount),
  members: members.map(mapProjectMember)
})
