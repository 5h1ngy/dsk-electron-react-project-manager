import { WikiPage } from '@main/models/WikiPage'
import { WikiRevision } from '@main/models/WikiRevision'
import type { WikiPageDetailsDTO, WikiPageSummaryDTO, WikiRevisionDTO } from '@main/services/wiki/types'

const mapUser = (fallbackId: string, user?: { id: string; username: string; displayName?: string | null }) => ({
  id: user?.id ?? fallbackId,
  username: user?.username ?? fallbackId,
  displayName: user?.displayName ?? null
})

export const mapWikiPageSummary = (page: WikiPage): WikiPageSummaryDTO => ({
  id: page.id,
  projectId: page.projectId,
  title: page.title,
  slug: page.slug,
  summary: page.summary ?? null,
  displayOrder: page.displayOrder,
  updatedAt: page.updatedAt?.toISOString() ?? new Date().toISOString(),
  updatedBy: mapUser(page.updatedBy, page.updatedByUser)
})

export const mapWikiPageDetails = (page: WikiPage): WikiPageDetailsDTO => ({
  ...mapWikiPageSummary(page),
  content: page.contentMd,
  createdAt: page.createdAt?.toISOString() ?? new Date().toISOString(),
  createdBy: mapUser(page.createdBy, page.createdByUser)
})

export const mapWikiRevision = (revision: WikiRevision): WikiRevisionDTO => ({
  id: revision.id,
  pageId: revision.pageId,
  title: revision.title,
  summary: revision.summary ?? null,
  createdAt: revision.createdAt?.toISOString() ?? new Date().toISOString(),
  createdBy: mapUser(revision.createdBy, revision.author)
})

