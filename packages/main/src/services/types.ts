import type { RoleName } from './auth/constants'

export interface ServiceActor {
  userId: string
  roles: RoleName[]
}
