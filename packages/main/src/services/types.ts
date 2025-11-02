import type { RoleName } from '@main/services/auth/constants'

export interface ServiceActor {
  userId: string
  roles: RoleName[]
}
