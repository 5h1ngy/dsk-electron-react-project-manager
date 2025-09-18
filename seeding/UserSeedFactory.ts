import type { Faker } from '@faker-js/faker'

import type { RoleName } from '../packages/main/src/services/auth/constants'

import type { UserSeedDefinition } from './DevelopmentSeeder.types'
import type { UsersSeedConfig } from './seedConfig'
import { capitalize, stripAccents } from './seed.helpers'

const DEFAULT_ROLE_PROFILES: ReadonlyArray<{ roles: RoleName[]; count: number }> = [
  { roles: ['Maintainer', 'Contributor'], count: 2 },
  { roles: ['Maintainer'], count: 1 },
  { roles: ['Contributor'], count: 4 },
  { roles: ['Contributor', 'Viewer'], count: 2 },
  { roles: ['Viewer'], count: 3 },
  { roles: ['Maintainer', 'Viewer'], count: 1 }
]

export class UserSeedFactory {
  constructor(
    private readonly random: Faker,
    private readonly config: UsersSeedConfig
  ) {}

  createSeeds(): UserSeedDefinition[] {
    const seeds: UserSeedDefinition[] = []
    const seen = new Set<string>()

    const profiles =
      this.config.profiles && this.config.profiles.length > 0
        ? this.config.profiles
        : DEFAULT_ROLE_PROFILES

    for (const profile of profiles) {
      const count = Math.max(0, profile.count ?? 0)
      for (let index = 0; index < count; index += 1) {
        const composite = this.createUniqueUsername(seen)
        seeds.push({
          username: composite.username,
          displayName: composite.displayName,
          roles: [...(profile.roles as RoleName[])]
        })
      }
    }

    return seeds
  }

  private createUniqueUsername(existing: Set<string>): { username: string; displayName: string } {
    let attempts = 0
    while (attempts < 20) {
      const first = this.random.person.firstName()
      const last = this.random.person.lastName()
      const normalized = stripAccents(`${first}.${last}`)
        .replace(/[^a-zA-Z0-9_.-]/g, '')
        .replace(/\.+/g, '.')
        .replace(/^\./, '')
        .replace(/\.$/, '')
        .toLowerCase()
      const base =
        normalized.slice(0, 28) || `user${this.random.number.int({ min: 1000, max: 9999 })}`
      let candidate = base
      let suffix = 1

      while ((candidate.length < 3 || existing.has(candidate)) && suffix < 100) {
        const suffixText = suffix.toString().padStart(2, '0')
        candidate = `${base.slice(0, 32 - suffixText.length)}${suffixText}`
        suffix += 1
      }

      if (!existing.has(candidate) && candidate.length >= 3) {
        existing.add(candidate)
        const displayName = `${capitalize(first)} ${capitalize(last)}`.slice(0, 64)
        return { username: candidate, displayName }
      }

      attempts += 1
    }

    const fallback = `user${this.random.number.int({ min: 1000, max: 9999 })}`
    existing.add(fallback)
    return { username: fallback, displayName: `User ${fallback.slice(-4)}` }
  }
}
