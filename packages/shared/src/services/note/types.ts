import type { UserSummaryDTO } from '@services/services/task/types'

export interface NoteTaskLinkDTO {
  id: string
  key: string
  title: string
}

export interface NoteSummaryDTO {
  id: string
  projectId: string
  title: string
  notebook: string | null
  isPrivate: boolean
  tags: string[]
  owner: UserSummaryDTO
  createdAt: Date
  updatedAt: Date
  linkedTasks: NoteTaskLinkDTO[]
}

export interface NoteDetailsDTO extends NoteSummaryDTO {
  body: string
}

export interface NoteSearchResultDTO extends NoteSummaryDTO {
  highlight: string | null
}
