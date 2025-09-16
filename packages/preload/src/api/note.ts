import type {
  NoteDetailsDTO,
  NoteSummaryDTO,
  NoteSearchResultDTO
} from '@main/services/note/types'
import type {
  CreateNoteInput,
  UpdateNoteInput,
  ListNotesInput,
  SearchNotesInput
} from '@main/services/note/schemas'
import { invokeIpc } from '@preload/api/shared'

const CHANNELS = {
  list: 'note:list',
  get: 'note:get',
  create: 'note:create',
  update: 'note:update',
  remove: 'note:delete',
  search: 'note:search'
} as const

export const noteApi = {
  list: async (token: string, payload: ListNotesInput) =>
    await invokeIpc<NoteSummaryDTO[]>(CHANNELS.list, token, payload),
  get: async (token: string, noteId: string) =>
    await invokeIpc<NoteDetailsDTO>(CHANNELS.get, token, noteId),
  create: async (token: string, payload: CreateNoteInput) =>
    await invokeIpc<NoteDetailsDTO>(CHANNELS.create, token, payload),
  update: async (token: string, noteId: string, payload: UpdateNoteInput) =>
    await invokeIpc<NoteDetailsDTO>(CHANNELS.update, token, noteId, payload),
  remove: async (token: string, noteId: string) =>
    await invokeIpc<{ success: boolean }>(CHANNELS.remove, token, noteId),
  search: async (token: string, payload: SearchNotesInput) =>
    await invokeIpc<NoteSearchResultDTO[]>(CHANNELS.search, token, payload)
}
