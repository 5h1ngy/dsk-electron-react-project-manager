import { AppLogger } from '@main/config/logger'
import type { LogLevelSetting } from '@main/config/env.types'

describe('AppLogger', () => {
  const createLogger = (level: LogLevelSetting) => {
    const lines: string[] = []
    const logger = new AppLogger({
      level,
      writer: (line) => lines.push(line),
      clock: () => new Date('2025-01-01T00:00:00.000Z')
    })
    return { logger, lines }
  }

  it('filters messages below selected level', () => {
    const { logger, lines } = createLogger('warn')
    logger.info('ignored')
    logger.error('propagated')
    expect(lines.some((line) => line.includes('ignored'))).toBe(false)
    expect(lines.some((line) => line.includes('propagated'))).toBe(true)
  })

  it('formats renderer messages', () => {
    const { logger, lines } = createLogger('debug')
    logger.renderer(3, 'hello', 'main.tsx', 42)
    expect(lines[0]).toContain('renderer:main.tsx:42')
    expect(lines[0]).toContain('hello')
  })
})
