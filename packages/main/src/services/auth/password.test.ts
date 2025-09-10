import { hashPassword, verifyPassword } from './password'

describe('password hashing', () => {
  it('verifies hashed password correctly', async () => {
    const hash = await hashPassword('Secret123!')
    expect(await verifyPassword(hash, 'Secret123!')).toBe(true)
  })

  it('rejects invalid password', async () => {
    const hash = await hashPassword('Secret123!')
    expect(await verifyPassword(hash, 'WrongPassword')).toBe(false)
  })
})
