import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'
import { initializeDatabase } from '../db/database'
import { SessionManager } from './sessionManager'
import { AuditService } from '../audit/auditService'
import { AuthService } from './authService'
import { AppError } from '../errors/appError'
import { User } from '../db/models/User'

const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'changeme!'
}

describe('AuthService', () => {
  let directory: string
  let authService: AuthService
  let sessionManager: SessionManager

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'dsk-auth-'))
    const storagePath = join(directory, 'data.sqlite')
    await initializeDatabase({ resolveStoragePath: () => storagePath, logging: false })
    sessionManager = new SessionManager(5)
    const auditService = new AuditService()
    authService = new AuthService(sessionManager, auditService)
  })

  afterEach(async () => {
    await User.sequelize?.close()
    await rm(directory, { recursive: true, force: true })
  })

  it('authenticates seeded admin user', async () => {
    const response = await authService.login(ADMIN_CREDENTIALS)
    expect(response.user.username).toBe('admin')
    expect(response.user.roles).toContain('Admin')
    expect(typeof response.token).toBe('string')
  })

  it('rejects invalid credentials', async () => {
    await expect(
      authService.login({ username: 'admin', password: 'wrong' })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('lists users only for admin', async () => {
    const { token } = await authService.login(ADMIN_CREDENTIALS)
    const users = await authService.listUsers(token)
    expect(users.some((user) => user.username === 'admin')).toBe(true)

    const viewer = await authService.createUser(token, {
      username: 'viewer1',
      password: 'Viewer123!',
      displayName: 'Viewer One',
      isActive: true,
      roles: ['Viewer']
    })

    const viewerLogin = await authService.login({
      username: viewer.username,
      password: 'Viewer123!'
    })
    await expect(authService.listUsers(viewerLogin.token)).rejects.toMatchObject({
      code: 'ERR_PERMISSION'
    })
  })

  it('creates and updates users', async () => {
    const { token } = await authService.login(ADMIN_CREDENTIALS)

    const created = await authService.createUser(token, {
      username: 'maintainer1',
      password: 'Maintainer123!',
      displayName: 'Maintainer One',
      isActive: true,
      roles: ['Maintainer']
    })

    expect(created.roles).toContain('Maintainer')

    const updated = await authService.updateUser(token, created.id, {
      displayName: 'Maintainer Uno',
      roles: ['Maintainer', 'Contributor']
    })

    expect(updated.displayName).toBe('Maintainer Uno')
    expect(updated.roles).toEqual(expect.arrayContaining(['Contributor', 'Maintainer']))
  })

  it('allows admin to reset a user password', async () => {
    const { token } = await authService.login(ADMIN_CREDENTIALS)

    const created = await authService.createUser(token, {
      username: 'resettable',
      password: 'Initial123!',
      displayName: 'Reset Target',
      isActive: true,
      roles: ['Viewer']
    })

    await authService.updateUser(token, created.id, {
      password: 'NewSecret456!'
    })

    await expect(
      authService.login({ username: created.username, password: 'Initial123!' })
    ).rejects.toMatchObject({ code: 'ERR_VALIDATION' })

    const reLogin = await authService.login({
      username: created.username,
      password: 'NewSecret456!'
    })

    expect(reLogin.user.id).toBe(created.id)
  })
})
