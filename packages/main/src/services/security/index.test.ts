import {
  buildContentSecurityPolicy,
  createNetworkBlockerHandler,
  shouldAllowRequest
} from '@main/services/security'

const invokeHandler = async (
  handler: ReturnType<typeof createNetworkBlockerHandler>,
  url: string
): Promise<{ cancel?: boolean }> => {
  return await new Promise((resolve) => {
    handler({ id: 1, url } as any, (result) => resolve(result))
  })
}

describe('network blocker', () => {
  it('allows file protocol even when packaged', () => {
    expect(shouldAllowRequest(new URL('file:///tmp/file.txt'), true)).toBe(true)
  })

  it('blocks https requests when packaged', () => {
    expect(shouldAllowRequest(new URL('https://example.com'), true)).toBe(false)
  })

  it('allows localhost urls during development', () => {
    expect(shouldAllowRequest(new URL('http://127.0.0.1:5173'), false)).toBe(true)
  })

  it('cancels unauthorized requests through handler', async () => {
    const handler = createNetworkBlockerHandler(true)
    const result = await invokeHandler(handler, 'https://example.com')
    expect(result.cancel).toBe(true)
  })

  it('cancels malformed url requests', async () => {
    const handler = createNetworkBlockerHandler(true)
    const result = await invokeHandler(handler, 'not-a-valid-url')
    expect(result.cancel).toBe(true)
  })
})

describe('buildContentSecurityPolicy', () => {
  it('includes unsafe inline script allowance in development mode', () => {
    const csp = buildContentSecurityPolicy(true)
    expect(csp).toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).toContain("connect-src 'self' ws://127.0.0.1:* ws://localhost:*")
  })

  it('omits unsafe inline scripts in production mode', () => {
    const csp = buildContentSecurityPolicy(false)
    expect(csp).toContain("script-src 'self'")
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'")
    expect(csp).not.toContain('ws://127.0.0.1:*')
  })
})

