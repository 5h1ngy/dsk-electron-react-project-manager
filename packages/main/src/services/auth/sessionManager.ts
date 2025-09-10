import { randomBytes } from 'node:crypto'
import { SESSION_TIMEOUT_MINUTES, SESSION_TOKEN_BYTES } from '@main/services/auth/constants'

export interface SessionRecord {
  token: string
  userId: string
  roles: string[]
  createdAt: Date
  lastActiveAt: Date
  expiresAt: Date
}

export class SessionManager {
  private readonly sessions = new Map<string, SessionRecord>()
  private timeoutMs: number

  constructor(timeoutMinutes: number = SESSION_TIMEOUT_MINUTES) {
    this.timeoutMs = timeoutMinutes * 60 * 1000
  }

  private static generateToken(): string {
    return randomBytes(SESSION_TOKEN_BYTES).toString('hex')
  }

  private computeExpiry(reference: Date = new Date()): Date {
    return new Date(reference.getTime() + this.timeoutMs)
  }

  private isExpired(session: SessionRecord, reference: Date = new Date()): boolean {
    return session.expiresAt.getTime() <= reference.getTime()
  }

  createSession(userId: string, roles: string[]): SessionRecord {
    const now = new Date()
    const record: SessionRecord = {
      token: SessionManager.generateToken(),
      userId,
      roles,
      createdAt: now,
      lastActiveAt: now,
      expiresAt: this.computeExpiry(now)
    }

    this.sessions.set(record.token, record)
    return record
  }

  getSession(token: string): SessionRecord | null {
    const session = this.sessions.get(token)
    if (!session) {
      return null
    }

    if (this.isExpired(session)) {
      this.sessions.delete(token)
      return null
    }

    return session
  }

  touchSession(token: string): SessionRecord | null {
    const session = this.getSession(token)
    if (!session) {
      return null
    }

    const now = new Date()
    session.lastActiveAt = now
    session.expiresAt = this.computeExpiry(now)
    return session
  }

  endSession(token: string): void {
    this.sessions.delete(token)
  }

  endSessionsForUser(userId: string): void {
    this.sessions.forEach((session, token) => {
      if (session.userId === userId) {
        this.sessions.delete(token)
      }
    })
  }

  cleanupExpired(reference: Date = new Date()): number {
    let removed = 0
    this.sessions.forEach((session, token) => {
      if (this.isExpired(session, reference)) {
        this.sessions.delete(token)
        removed += 1
      }
    })
    return removed
  }

  setTimeoutMinutes(minutes: number): void {
    if (!Number.isFinite(minutes) || minutes < 0) {
      throw new Error('Invalid session timeout value')
    }
    this.timeoutMs = minutes * 60 * 1000
    this.sessions.forEach((session, token) => {
      session.expiresAt = this.computeExpiry(session.lastActiveAt)
      if (this.isExpired(session)) {
        this.sessions.delete(token)
      }
    })
  }
}

