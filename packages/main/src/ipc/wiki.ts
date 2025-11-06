import type { AuthService } from '@services/services/auth'
import type { WikiService } from '@services/services/wiki'
import { IpcChannelRegistrar } from '@main/ipc/utils'

export interface WikiIpcDependencies {
  authService: AuthService
  wikiService: WikiService
  registrar: IpcChannelRegistrar
}

export class WikiIpcRegistrar {
  private readonly authService: AuthService
  private readonly wikiService: WikiService
  private readonly registrar: IpcChannelRegistrar

  constructor(dependencies: WikiIpcDependencies) {
    this.authService = dependencies.authService
    this.wikiService = dependencies.wikiService
    this.registrar = dependencies.registrar
  }

  register(): void {
    this.registrar.register('wiki:list', async (token: string, projectId: string) => {
      const actor = await this.resolveActor(token)
      return await this.wikiService.listPages(actor, projectId)
    })

    this.registrar.register(
      'wiki:get',
      async (token: string, projectId: string, pageId: string) => {
        const actor = await this.resolveActor(token)
        return await this.wikiService.getPage(actor, projectId, pageId)
      }
    )

    this.registrar.register(
      'wiki:create',
      async (token: string, projectId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.wikiService.createPage(actor, projectId, payload)
      }
    )

    this.registrar.register(
      'wiki:update',
      async (token: string, projectId: string, pageId: string, payload: unknown) => {
        const actor = await this.resolveActor(token)
        return await this.wikiService.updatePage(actor, projectId, pageId, payload)
      }
    )

    this.registrar.register(
      'wiki:delete',
      async (token: string, projectId: string, pageId: string) => {
        const actor = await this.resolveActor(token)
        await this.wikiService.deletePage(actor, projectId, pageId)
        return { success: true }
      }
    )

    this.registrar.register(
      'wiki:revisions',
      async (token: string, projectId: string, pageId: string) => {
        const actor = await this.resolveActor(token)
        return await this.wikiService.listRevisions(actor, projectId, pageId)
      }
    )

    this.registrar.register(
      'wiki:restore',
      async (token: string, projectId: string, pageId: string, revisionId: string) => {
        const actor = await this.resolveActor(token)
        return await this.wikiService.restoreRevision(actor, projectId, pageId, revisionId)
      }
    )
  }

  private async resolveActor(token: string) {
    return await this.authService.resolveActor(token, { touch: true })
  }
}

