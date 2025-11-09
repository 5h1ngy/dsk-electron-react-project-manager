export interface WikiPageSummaryDTO {
  id: string
  projectId: string
  title: string
  slug: string
  summary: string | null
  displayOrder: number
  updatedAt: string
  updatedBy: {
    id: string
    username: string
    displayName: string | null
  }
}

export interface WikiPageDetailsDTO extends WikiPageSummaryDTO {
  content: string
  createdAt: string
  createdBy: {
    id: string
    username: string
    displayName: string | null
  }
}

export interface WikiRevisionDTO {
  id: string
  pageId: string
  title: string
  summary: string | null
  createdAt: string
  createdBy: {
    id: string
    username: string
    displayName: string | null
  }
}
