export type LoadStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface WikiUserRef {
  id: string
  username: string
  displayName: string | null
}

export interface WikiPageSummary {
  id: string
  projectId: string
  title: string
  slug: string
  summary: string | null
  displayOrder: number
  updatedAt: string
  updatedBy: WikiUserRef
}

export interface WikiPageDetails extends WikiPageSummary {
  content: string
  createdAt: string
  createdBy: WikiUserRef
}

export interface WikiRevision {
  id: string
  pageId: string
  title: string
  summary: string | null
  createdAt: string
  createdBy: WikiUserRef
}

export interface WikiRevisionsState {
  items: WikiRevision[]
  status: LoadStatus
  error?: string
}

export interface ProjectWikiState {
  pages: WikiPageSummary[]
  status: LoadStatus
  error?: string
  pageDetails: Record<string, WikiPageDetails>
  pageStatus: Record<string, LoadStatus>
  pageErrors: Record<string, string | undefined>
  revisions: Record<string, WikiRevisionsState>
}

export interface WikiState {
  byProject: Record<string, ProjectWikiState>
}
