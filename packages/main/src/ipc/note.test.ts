/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthService } from '@services/services/auth'
import type { NoteService } from '@services/services/note'
import type { NoteDetailsDTO, NoteSearchResultDTO, NoteSummaryDTO } from '@services/services/note/types'
import { NoteIpcRegistrar } from '@main/ipc/note'
import { IpcChannelRegistrar } from '@main/ipc/utils'

const createRegistry = () => {
  const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()
  const ipcMock = {
    handle: jest.fn((channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    }),
    listenerCount: jest.fn(() => 0),
    removeHandler: jest.fn()
  }
  const loggerMock = { warn: jest.fn(), error: jest.fn() }
  const registrar = new IpcChannelRegistrar({ ipc: ipcMock as any, logger: loggerMock })
  return { handlers, registrar }
}

const baseSummary = (): NoteSummaryDTO => ({
  id: 'note-1',
  projectId: 'project-1',
  title: 'Daily summary',
  notebook: 'journal',
  isPrivate: false,
  tags: ['daily'],
  owner: {
    id: 'user-1',
    username: 'jane.doe',
    displayName: 'Jane Doe'
  },
  createdAt: new Date('2024-02-01T08:00:00.000Z'),
  updatedAt: new Date('2024-02-01T08:30:00.000Z'),
  linkedTasks: []
})

const createDetails = (overrides: Partial<NoteDetailsDTO> = {}): NoteDetailsDTO => ({
  ...baseSummary(),
  body: overrides.body ?? '# Heading\n\nContent',
  ...overrides
})

describe('NoteIpcRegistrar', () => {
  const actor = { userId: 'user-1' } as const
  let authService: jest.Mocked<AuthService>
  let noteService: jest.Mocked<NoteService>
  let handlers: Map<string, (...args: any[]) => Promise<unknown>>
  let registrar: IpcChannelRegistrar

  beforeEach(() => {
    authService = {
      resolveActor: jest.fn().mockResolvedValue(actor)
    } as unknown as jest.Mocked<AuthService>

    noteService = {
      listNotes: jest.fn(),
      getNote: jest.fn(),
      createNote: jest.fn(),
      updateNote: jest.fn(),
      deleteNote: jest.fn(),
      search: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    const registry = createRegistry()
    handlers = registry.handlers
    registrar = registry.registrar
  })

  it('delegates to the note service for each channel', async () => {
    const summary = baseSummary()
    const details = createDetails()
    const searchResults: NoteSearchResultDTO[] = [{ ...summary, highlight: '<mark>daily</mark>' }]

    noteService.listNotes.mockResolvedValue([summary])
    noteService.getNote.mockResolvedValue(details)
    noteService.createNote.mockResolvedValue(details)
    noteService.updateNote.mockResolvedValue(details)
    noteService.deleteNote.mockResolvedValue(undefined)
    noteService.search.mockResolvedValue(searchResults)

    new NoteIpcRegistrar({ authService, noteService, registrar }).register()

    await handlers.get('note:list')!({}, 'token', { projectId: 'project-1' })
    await handlers.get('note:get')!({}, 'token', 'note-1')
    await handlers.get('note:create')!({}, 'token', { projectId: 'project-1' })
    await handlers.get('note:update')!({}, 'token', 'note-1', { title: 'Updated' })
    const deleteResponse = await handlers.get('note:delete')!({}, 'token', 'note-1')
    expect(deleteResponse).toEqual({ ok: true, data: { success: true } })

    const searchResponse = await handlers.get('note:search')!({}, 'token', { query: 'daily' })
    expect(searchResponse).toEqual({ ok: true, data: searchResults })
  })

  it('wraps unexpected errors into ipc responses', async () => {
    noteService.listNotes.mockRejectedValue(new Error('boom'))

    new NoteIpcRegistrar({ authService, noteService, registrar }).register()

    const response = await handlers.get('note:list')!({}, 'token', { projectId: 'project-1' })
    expect(response).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})

