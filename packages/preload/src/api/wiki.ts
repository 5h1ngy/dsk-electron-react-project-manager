import type { WikiPageDetailsDTO, WikiPageSummaryDTO, WikiRevisionDTO } from '@main/services/wiki/types'
import type {
  CreateWikiPageInput,
  UpdateWikiPageInput
} from '@main/services/wiki/schemas'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  list: 'wiki:list',
  get: 'wiki:get',
  create: 'wiki:create',
  update: 'wiki:update',
  remove: 'wiki:delete',
  revisions: 'wiki:revisions',
  restore: 'wiki:restore'
} as const

export const wikiApi = {
  list: async (token: string, projectId: string) =>
    await invokeIpc<WikiPageSummaryDTO[]>(CHANNELS.list, token, projectId),
  get: async (token: string, projectId: string, pageId: string) =>
    await invokeIpc<WikiPageDetailsDTO>(CHANNELS.get, token, projectId, pageId),
  create: async (token: string, projectId: string, payload: CreateWikiPageInput) =>
    await invokeIpc<WikiPageDetailsDTO>(CHANNELS.create, token, projectId, payload),
  update: async (
    token: string,
    projectId: string,
    pageId: string,
    payload: UpdateWikiPageInput
  ) => await invokeIpc<WikiPageDetailsDTO>(CHANNELS.update, token, projectId, pageId, payload),
  remove: async (token: string, projectId: string, pageId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, projectId, pageId),
  revisions: async (token: string, projectId: string, pageId: string) =>
    await invokeIpc<WikiRevisionDTO[]>(CHANNELS.revisions, token, projectId, pageId),
  restore: async (token: string, projectId: string, pageId: string, revisionId: string) =>
    await invokeIpc<WikiPageDetailsDTO>(CHANNELS.restore, token, projectId, pageId, revisionId)
}
