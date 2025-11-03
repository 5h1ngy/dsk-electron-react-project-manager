import { buildCreateUserSchema, buildUpdateUserSchema } from '@renderer/pages/Dashboard/schemas/userSchemas'

describe('userSchemas', () => {
  const createMessages = {
    usernameRequired: 'username required',
    usernameMin: 'username min',
    usernameMax: 'username max',
    usernamePattern: 'username pattern',
    displayNameRequired: 'display required',
    displayNameMax: 'display max',
    passwordRequired: 'password required',
    passwordMin: 'password min',
    rolesRequired: 'roles required'
  }

  const updateMessages = {
    displayNameRequired: 'display required',
    displayNameMax: 'display max',
    passwordMin: 'password min',
    rolesRequired: 'roles required'
  }

  it('trims textual fields before validating', () => {
    const schema = buildCreateUserSchema(createMessages)
    const result = schema.parse({
      username: '   john.doe  ',
      displayName: '  John Doe  ',
      password: 'password123',
      roles: ['Viewer'],
      isActive: true
    })

    expect(result).toEqual({
      username: 'john.doe',
      displayName: 'John Doe',
      password: 'password123',
      roles: ['Viewer'],
      isActive: true
    })
  })

  it('fails when username pattern is invalid', () => {
    const schema = buildCreateUserSchema(createMessages)
    const result = schema.safeParse({
      username: 'John Doe',
      displayName: 'John Doe',
      password: 'password123',
      roles: ['Viewer'],
      isActive: true
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.formErrors.fieldErrors.username).toContain(createMessages.usernamePattern)
    }
  })

  it('allows empty password on update and normalizes to undefined', () => {
    const schema = buildUpdateUserSchema(updateMessages)
    const result = schema.parse({
      displayName: 'John Doe',
      password: '   ',
      roles: ['Viewer'],
      isActive: true
    })

    expect(result).toEqual({
      displayName: 'John Doe',
      password: undefined,
      roles: ['Viewer'],
      isActive: true
    })
  })
})
