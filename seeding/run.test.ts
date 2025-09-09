import type { Sequelize } from 'sequelize-typescript'

import {
  SeedCommand,
  type SeedCommandDependencies,
  runSeedCli
} from './run'

const ORIGINAL_DB_STORAGE_PATH = process.env.DB_STORAGE_PATH

afterEach(() => {
  if (ORIGINAL_DB_STORAGE_PATH === undefined) {
    delete process.env.DB_STORAGE_PATH
  } else {
    process.env.DB_STORAGE_PATH = ORIGINAL_DB_STORAGE_PATH
  }
})

const createDependencyMocks = () => {
  const resolveStoragePath: SeedCommandDependencies['resolveStoragePath'] = jest
    .fn()
    .mockReturnValue('/tmp/app.sqlite')

  const sequelizeClose = jest.fn().mockResolvedValue(undefined)
  const sequelize = { close: sequelizeClose } as unknown as Sequelize

  const initialize = jest.fn().mockResolvedValue(sequelize)
  const createDatabaseManager: SeedCommandDependencies['createDatabaseManager'] = jest
    .fn()
    .mockReturnValue({ initialize })

  const seed = jest
    .fn()
    .mockResolvedValue(undefined) as jest.MockedFunction<SeedCommandDependencies['seed']>

  const logger: SeedCommandDependencies['logger'] = {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn()
  }

  return {
    resolveStoragePath,
    createDatabaseManager,
    initialize,
    seed,
    logger,
    sequelize,
    sequelizeClose
  }
}

describe('SeedCommand', () => {
  it('seeds development data using the provided dependencies', async () => {
    const dependencies = createDependencyMocks()
    process.env.DB_STORAGE_PATH = '  C:/custom.sqlite '

    const command = new SeedCommand(dependencies)

    await command.execute()

    expect(dependencies.resolveStoragePath).toHaveBeenCalledWith({
      overridePath: 'C:/custom.sqlite'
    })
    expect(dependencies.createDatabaseManager).toHaveBeenCalledWith('/tmp/app.sqlite')
    expect(dependencies.seed).toHaveBeenCalledWith(dependencies.sequelize)
    expect(dependencies.logger.info).toHaveBeenCalledWith(
      'Using database at: /tmp/app.sqlite',
      'Seed'
    )
    expect(dependencies.logger.success).toHaveBeenCalledWith(
      'Database seeding completed successfully',
      'Seed'
    )
    expect(dependencies.sequelizeClose).toHaveBeenCalledTimes(1)
  })

  it('re-throws errors but still closes the Sequelize connection', async () => {
    const dependencies = createDependencyMocks()
    const failure = new Error('boom')
    dependencies.seed.mockRejectedValue(failure)

    const command = new SeedCommand(dependencies)

    await expect(command.execute()).rejects.toThrow(failure)
    expect(dependencies.logger.success).not.toHaveBeenCalled()
    expect(dependencies.sequelizeClose).toHaveBeenCalledTimes(1)
  })
})

describe('runSeedCli', () => {
  it('logs fatal errors and exits with code 1', async () => {
    const logger: SeedCommandDependencies['logger'] = {
      info: jest.fn(),
      success: jest.fn(),
      error: jest.fn()
    }
    const exit = jest.fn()
    const error = new Error('seed failed')
    const command = {
      execute: jest.fn().mockRejectedValue(error)
    } as unknown as SeedCommand

    await runSeedCli({ command, logger, exit })

    expect(command.execute).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(
      'Database seeding failed',
      'Seed',
      error
    )
    expect(exit).toHaveBeenCalledWith(1)
  })
})
