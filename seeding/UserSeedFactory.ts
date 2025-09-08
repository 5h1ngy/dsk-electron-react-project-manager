import type { Faker } from '@faker-js/faker'

import type { RoleName } from '../packages/main/src/auth/constants'

import type { UserSeedDefinition } from './DevelopmentSeeder.types'

const ROLE_PROFILES: ReadonlyArray<{ roles: RoleName[]; count: number }> = [
  { roles: ['Maintainer', 'Contributor'], count: 4 },
  { roles: ['Maintainer'], count: 3 },
  { roles: ['Contributor'], count: 8 },
  { roles: ['Contributor', 'Viewer'], count: 4 },
  { roles: ['Viewer'], count: 5 },
  { roles: ['Maintainer', 'Viewer'], count: 2 }
]

export class UserSeedFactory {
  constructor(private readonly random: Faker) {}

  createSeeds(): UserSeedDefinition[] {
    const seeds: UserSeedDefinition[] = []
    const seen = new Set<string>()

    for (const profile of ROLE_PROFILES) {
      for (let index = 0; index < profile.count; index += 1) {
        const composite = this.createUniqueUsername(seen)
        seeds.push({
          username: composite.username,
          displayName: composite.displayName,
          roles: [...profile.roles]
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
      const normalized = `${first}.${last}`
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
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
        const displayName = `${this.capitalize(first)} ${this.capitalize(last)}`.slice(0, 64)
        return { username: candidate, displayName }
      }

      attempts += 1
    }

    const fallback = `user${this.random.number.int({ min: 1000, max: 9999 })}`
    existing.add(fallback)
    return { username: fallback, displayName: `User ${fallback.slice(-4)}` }
  }

  private capitalize(value: string): string {
    if (!value) {
      return value
    }
    return value[0].toUpperCase() + value.slice(1)
  }
}
