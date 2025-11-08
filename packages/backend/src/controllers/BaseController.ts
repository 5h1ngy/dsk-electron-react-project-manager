import type { Request } from 'express'
import { UnauthorizedError } from 'routing-controllers'
import { Inject, Service } from 'typedi'

import type { ServiceActor } from '@services/services/types'
import type { AuthService } from '@services/services/auth'
import { ApiContextToken, type ApiContext } from '@backend/startup/context'

interface ActorResolutionOptions {
  touch?: boolean
}

@Service()
export abstract class BaseController {
  protected constructor(@Inject(ApiContextToken) private readonly apiContext: ApiContext) {}

  protected get authService(): AuthService {
    return this.apiContext.domain.authService
  }

  protected extractBearerToken(request: Request): string | null {
    const header = request.header('authorization')
    if (!header) {
      return null
    }
    const [scheme, token] = header.split(' ')
    if (!scheme || scheme.toLowerCase() !== 'bearer' || !token) {
      return null
    }
    return token.trim()
  }

  protected async requireActor(
    request: Request,
    options: ActorResolutionOptions = {}
  ): Promise<{ actor: ServiceActor; token: string }> {
    const token = this.extractBearerToken(request)
    if (!token) {
      throw new UnauthorizedError('Authorization token missing')
    }
    const actor = await this.authService.resolveActor(token, {
      touch: options.touch ?? true
    })
    return { actor, token }
  }

  protected get domain() {
    return this.apiContext.domain
  }
}
