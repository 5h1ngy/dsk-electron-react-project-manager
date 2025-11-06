import type { RoleName } from '@services/services/auth/constants'

export interface ServiceActor {
  userId: string
  roles: RoleName[]
}
