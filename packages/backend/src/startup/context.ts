import { Token } from 'typedi'

import type { DomainContext } from '@services/runtime/domainContext'

export interface ApiContext {
  domain: DomainContext
}

export const ApiContextToken = new Token<ApiContext>('ApiContext')
