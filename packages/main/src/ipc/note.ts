import type { AuthService } from '@services/services/auth'
import type { NoteService } from '@services/services/note'
import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface NoteIpcDependencies {
  authService: AuthService
  noteService: NoteService
  registrar: IpcChannelRegistrar
}

export class NoteIpcRegistrar {
  private readonly authService: AuthService
  private readonly noteService: NoteService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: NoteIpcDependencies) {
    this.authService = dependencies.authService
    this.noteService = dependencies.noteService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('note:list', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.noteService.listNotes(actor, payload)
    })

    this.registrar.register('note:get', async (token: string, noteId: string) => {
      const actor = await this.resolveActor(token)
      return await this.noteService.getNote(actor, noteId)
    })

    this.registrar.register('note:create', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.noteService.createNote(actor, payload)
    })

    this.registrar.register(
      'note:update',
      async (token: string, noteId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.noteService.updateNote(actor, noteId, payload)
      }
    )

    this.registrar.register('note:delete', async (token: string, noteId: string) => {
      const actor = await this.resolveActor(token)
      await this.noteService.deleteNote(actor, noteId)
      return { success: true }
    })

    this.registrar.register('note:search', async (token: string, payload: unknown) => {
      const actor = await this.resolveActor(token)
      return await this.noteService.search(actor, payload)
    })
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

