import { randomUUID } from 'node:crypto'
import { UniqueConstraintError } from 'sequelize'
import { Role } from '../db/models/Role'
import { User } from '../db/models/User'
import { UserRole } from '../db/models/UserRole'
import { hashPassword, verifyPassword } from './password'
import { SessionManager, SessionRecord } from './sessionManager'
import { AuditService } from '../audit/auditService'
import { AppError, wrapError } from '../errors/appError'
import {
  LoginSchema,
  CreateUserSchema,
  UpdateUserSchema,
  RegisterUserSchema,
  type LoginInput,
  type CreateUserInput,
  type UpdateUserInput,
  type RegisterUserInput
} from './validation'
import { ROLE_NAMES, type RoleName } from './constants'
import { logger } from '../config/logger'
import type { ServiceActor } from '../services/types'

export interface SessionPayload {
  token: string
  user: UserDTO
}

export interface UserDTO {
  id: string
  username: string
  displayName: string
  isActive: boolean
  roles: RoleName[]
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface AuthContext {
  session: SessionRecord
  user: User
  roles: RoleName[]
}

const ROLE_NAME_SET = new Set<RoleName>(ROLE_NAMES)

const sanitizeUser = (user: User, roles: RoleName[]): UserDTO => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  isActive: user.isActive,
  roles,
  lastLoginAt: user.lastLoginAt ?? null,
  createdAt: user.createdAt!,
  updatedAt: user.updatedAt!
})

const extractRoleNames = (user: User): RoleName[] =>
  (user.userRoles ?? [])
    .map((userRole) => userRole.role?.name as RoleName | undefined)
    .filter((name): name is RoleName => Boolean(name) && ROLE_NAME_SET.has(name as RoleName))

export class AuthService {
  constructor(
    private readonly sessionManager: SessionManager,
    private readonly auditService: AuditService
  ) {}

  private async findUserByUsernameWithPassword(username: string): Promise<User | null> {
    return await User.scope('withPassword').findOne({
      where: { username },
      include: [{ model: UserRole, include: [Role] }]
    })
  }

  private async ensureRolesExist(roleNames: RoleName[]): Promise<Role[]> {
    const roles = await Role.findAll({ where: { name: roleNames } })
    if (roles.length !== roleNames.length) {
      throw new AppError('ERR_VALIDATION', 'Uno o piu ruoli non sono validi')
    }
    return roles
  }

  private requireAdmin(roles: RoleName[]): void {
    if (!roles.includes('Admin')) {
      throw new AppError('ERR_PERMISSION', 'Operazione consentita solo agli amministratori')
    }
  }

  private async getContext(token: string, options: { touch?: boolean } = {}): Promise<AuthContext> {
    const session = options.touch
      ? this.sessionManager.touchSession(token)
      : this.sessionManager.getSession(token)
    if (!session) {
      throw new AppError('ERR_PERMISSION', 'Sessione non valida o scaduta')
    }

    const user = await User.findOne({
      where: { id: session.userId },
      include: [{ model: UserRole, include: [Role] }]
    })

    if (!user) {
      this.sessionManager.endSession(token)
      throw new AppError('ERR_NOT_FOUND', 'Utente associato alla sessione non trovato')
    }

    const roles = extractRoleNames(user)

    return { session, user, roles }
  }

  async login(payload: unknown): Promise<SessionPayload> {
    let input: LoginInput
    try {
      input = LoginSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Credenziali non valide', { cause: error })
    }

    const user = await this.findUserByUsernameWithPassword(input.username)
    if (!user) {
      throw new AppError('ERR_VALIDATION', 'Credenziali non valide')
    }

    if (!user.isActive) {
      throw new AppError('ERR_PERMISSION', 'Account disattivato')
    }

    const passwordMatches = await verifyPassword(user.passwordHash, input.password)
    if (!passwordMatches) {
      await this.auditService.record(user.id, 'auth', user.id, 'login_failed', {
        username: input.username
      })
      throw new AppError('ERR_VALIDATION', 'Credenziali non valide')
    }

    const roles = extractRoleNames(user)
    const session = this.sessionManager.createSession(user.id, roles)

    user.lastLoginAt = new Date()
    await user.save()

    await this.auditService.record(user.id, 'auth', user.id, 'login', { username: user.username })
    logger.success(`Login eseguito per ${user.username}`, 'AuthService')

    return {
      token: session.token,
      user: sanitizeUser(user, roles)
    }
  }

  async logout(token: string): Promise<void> {
    const session = this.sessionManager.getSession(token)
    if (!session) {
      return
    }

    this.sessionManager.endSession(token)
    await this.auditService.record(session.userId, 'auth', session.userId, 'logout', null)
  }

  async currentSession(token: string): Promise<UserDTO | null> {
    const session = this.sessionManager.touchSession(token)
    if (!session) {
      return null
    }

    const user = await User.findOne({
      where: { id: session.userId },
      include: [{ model: UserRole, include: [Role] }]
    })

    if (!user) {
      this.sessionManager.endSession(token)
      return null
    }

    const roles = extractRoleNames(user)
    return sanitizeUser(user, roles)
  }

  async resolveActor(token: string, options: { touch?: boolean } = {}): Promise<ServiceActor> {
    const context = await this.getContext(token, options)
    return {
      userId: context.user.id,
      roles: context.roles
    }
  }

  async listUsers(token: string): Promise<UserDTO[]> {
    const context = await this.getContext(token, { touch: true })
    this.requireAdmin(context.roles)

    const users = await User.findAll({ include: [{ model: UserRole, include: [Role] }] })
    return users.map((user) => sanitizeUser(user, extractRoleNames(user)))
  }

  async register(payload: unknown): Promise<SessionPayload> {
    let input: RegisterUserInput
    try {
      input = RegisterUserSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati registrazione non validi', { cause: error })
    }

    const viewerRoles = await this.ensureRolesExist(['Viewer'])

    try {
      const passwordHash = await hashPassword(input.password)
      const user = await User.create({
        id: randomUUID(),
        username: input.username,
        displayName: input.displayName,
        passwordHash,
        isActive: true,
        lastLoginAt: null
      })

      await Promise.all(
        viewerRoles.map((role) =>
          UserRole.create({
            userId: user.id,
            roleId: role.id
          })
        )
      )

      const reloaded = await User.findOne({
        where: { id: user.id },
        include: [{ model: UserRole, include: [Role] }]
      })

      const userWithRoles = reloaded ?? user
      const roles = extractRoleNames(userWithRoles)
      const session = this.sessionManager.createSession(userWithRoles.id, roles)

      await this.auditService.record(user.id, 'user', user.id, 'register', {
        username: input.username
      })
      logger.success(`Registrazione completata per ${input.username}`, 'AuthService')

      return {
        token: session.token,
        user: sanitizeUser(userWithRoles, roles)
      }
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError('ERR_CONFLICT', 'Username gia in uso')
      }
      throw wrapError(error)
    }
  }

  async createUser(token: string, payload: unknown): Promise<UserDTO> {
    const context = await this.getContext(token, { touch: true })
    this.requireAdmin(context.roles)

    let input: CreateUserInput
    try {
      input = CreateUserSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati utente non validi', { cause: error })
    }

    const roles = await this.ensureRolesExist(input.roles)

    try {
      const passwordHash = await hashPassword(input.password)
      const user = await User.create({
        id: randomUUID(),
        username: input.username,
        displayName: input.displayName,
        passwordHash,
        isActive: input.isActive,
        lastLoginAt: null
      })

      await Promise.all(
        roles.map((role) =>
          UserRole.create({
            userId: user.id,
            roleId: role.id
          })
        )
      )

      const reloaded = await User.findOne({
        where: { id: user.id },
        include: [{ model: UserRole, include: [Role] }]
      })

      await this.auditService.record(context.user.id, 'user', user.id, 'create', {
        username: input.username,
        roles: input.roles
      })

      return sanitizeUser(reloaded ?? user, extractRoleNames(reloaded ?? user))
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new AppError('ERR_CONFLICT', 'Username gia in uso')
      }
      throw wrapError(error)
    }
  }

  async updateUser(token: string, userId: string, payload: unknown): Promise<UserDTO> {
    const context = await this.getContext(token, { touch: true })
    this.requireAdmin(context.roles)

    let input: UpdateUserInput
    try {
      input = UpdateUserSchema.parse(payload)
    } catch (error) {
      throw new AppError('ERR_VALIDATION', 'Dati aggiornamento non validi', { cause: error })
    }

    const user = await User.scope('withPassword').findOne({
      where: { id: userId },
      include: [{ model: UserRole, include: [Role] }]
    })

    if (!user) {
      throw new AppError('ERR_NOT_FOUND', 'Utente non trovato')
    }

    const originalSnapshot = sanitizeUser(user, extractRoleNames(user))

    if (input.displayName !== undefined) {
      user.displayName = input.displayName
    }
    if (input.isActive !== undefined) {
      user.isActive = input.isActive
    }
    if (input.password) {
      const hashedPassword = await hashPassword(input.password)
      user.setDataValue('passwordHash', hashedPassword)
      user.changed('passwordHash', true)
      this.sessionManager.endSessionsForUser(user.id)
    }

    if (input.roles) {
      const roles = await this.ensureRolesExist(input.roles)
      await UserRole.destroy({ where: { userId: user.id } })
      await Promise.all(
        roles.map((role) =>
          UserRole.create({
            userId: user.id,
            roleId: role.id
          })
        )
      )
    }

    await user.save()

    const updated = await User.findOne({
      where: { id: user.id },
      include: [{ model: UserRole, include: [Role] }]
    })

    const updatedDto = sanitizeUser(updated ?? user, extractRoleNames(updated ?? user))

    await this.auditService.record(context.user.id, 'user', user.id, 'update', {
      before: originalSnapshot,
      after: updatedDto
    })

    return updatedDto
  }
}
