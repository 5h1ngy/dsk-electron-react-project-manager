import type { EntityState } from '@reduxjs/toolkit'
import type { ProjectDetailsDTO, ProjectSummaryDTO } from '@services/services/project/types'

export type ProjectSummary = ProjectSummaryDTO
export type ProjectDetails = ProjectDetailsDTO

export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProjectsState extends EntityState<ProjectSummary, string> {
  details: Record<string, ProjectDetails>
  listStatus: LoadStatus
  mutationStatus: LoadStatus
  selectedProjectId: string | null
  error?: string
}
