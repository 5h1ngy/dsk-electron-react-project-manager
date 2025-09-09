import { SessionManager } from './sessionManager'

describe('SessionManager', () => {
  it('creates and retrieves sessions', () => {
    const manager = new SessionManager(1)
    const session = manager.createSession('user-1', ['Admin'])

    expect(manager.getSession(session.token)).toMatchObject({ userId: 'user-1', roles: ['Admin'] })
  })

  it('expires sessions after timeout', () => {
    const manager = new SessionManager(0)
    const session = manager.createSession('user-1', [])

    expect(manager.getSession(session.token)).toBeNull()
  })

  it('cleans up expired sessions', () => {
    const manager = new SessionManager(0)
    manager.createSession('user-1', [])
    manager.createSession('user-2', [])

    const removed = manager.cleanupExpired(new Date(Date.now() + 1))
    expect(removed).toBeGreaterThanOrEqual(2)
  })

  it('ends sessions for a user', () => {
    const manager = new SessionManager(10)
    const a = manager.createSession('user-1', [])
    const b = manager.createSession('user-1', [])

    manager.endSessionsForUser('user-1')

    expect(manager.getSession(a.token)).toBeNull()
    expect(manager.getSession(b.token)).toBeNull()
  })

  it('allows updating timeout at runtime', () => {
    const manager = new SessionManager(10)
    const session = manager.createSession('user-1', [])

    manager.setTimeoutMinutes(0)

    expect(manager.getSession(session.token)).toBeNull()
  })
})
