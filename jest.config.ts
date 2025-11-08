import type { Config } from 'jest'

const moduleNameMapper = {
  '^@main/(.*)$': '<rootDir>/packages/electron/src/main/$1',
  '^@preload/(.*)$': '<rootDir>/packages/electron/src/preload/src/$1',
  '^@services/(.*)$': '<rootDir>/packages/shared/src/$1',
  '^@backend/(.*)$': '<rootDir>/packages/backend/src/$1',
  '^@renderer/(.*)$': '<rootDir>/packages/frontend/src/$1',
  '^@seeding/(.*)$': '<rootDir>/packages/seeding/src/$1',
  '\\.(css|less|sass|scss)$': '<rootDir>/packages/frontend/test/__mocks__/styleMock.ts',
  '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/packages/frontend/test/__mocks__/fileMock.ts'
}

const tsJestTransform = (tsconfig: string): Config['transform'] => ({
  '^.+\\.(ts|tsx)$': [
    'ts-jest',
    {
      tsconfig
    }
  ]
})

const config: Config = {
  projects: [
    {
      displayName: 'frontend',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      clearMocks: true,
      coverageDirectory: '<rootDir>/coverage/frontend',
      coverageProvider: 'v8',
      collectCoverageFrom: [
        'packages/frontend/src/**/*.{ts,tsx}',
        '!packages/frontend/src/**/*.d.ts',
        '!packages/frontend/src/**/index.ts'
      ],
      moduleNameMapper,
      setupFiles: ['<rootDir>/packages/frontend/test/setupEnv.ts'],
      setupFilesAfterEnv: ['<rootDir>/packages/frontend/test/setupRendererTests.ts'],
      testMatch: ['<rootDir>/packages/frontend/src/**/*.test.ts?(x)'],
      transform: tsJestTransform('<rootDir>/packages/frontend/tsconfig.json')
    },
    {
      displayName: 'backend',
      preset: 'ts-jest',
      testEnvironment: 'node',
      clearMocks: true,
      coverageDirectory: '<rootDir>/coverage/backend',
      coverageProvider: 'v8',
      collectCoverageFrom: [
        'packages/backend/src/**/*.{ts,tsx}',
        '!packages/backend/src/**/*.d.ts',
        '!packages/backend/src/**/*.test.ts?(x)'
      ],
      moduleNameMapper,
      setupFiles: ['<rootDir>/packages/backend/test/setupEnv.ts'],
      testMatch: ['<rootDir>/packages/backend/src/**/*.test.ts?(x)'],
      transform: tsJestTransform('<rootDir>/packages/backend/tsconfig.backend.dev.json')
    },
    {
      displayName: 'shared',
      preset: 'ts-jest',
      testEnvironment: 'node',
      clearMocks: true,
      coverageDirectory: '<rootDir>/coverage/shared',
      coverageProvider: 'v8',
      collectCoverageFrom: [
        'packages/shared/src/**/*.{ts,tsx}',
        '!packages/shared/src/**/*.d.ts',
        '!packages/shared/src/**/*.test.ts?(x)'
      ],
      moduleNameMapper,
      setupFiles: ['<rootDir>/packages/shared/test/setupEnv.ts'],
      testMatch: ['<rootDir>/packages/shared/src/**/*.test.ts?(x)'],
      transform: tsJestTransform('<rootDir>/packages/electron/tsconfig.node.json')
    },
    {
      displayName: 'seeding',
      preset: 'ts-jest',
      testEnvironment: 'node',
      clearMocks: true,
      coverageDirectory: '<rootDir>/coverage/seeding',
      coverageProvider: 'v8',
      collectCoverageFrom: [
        'packages/seeding/src/**/*.{ts,tsx}',
        '!packages/seeding/src/**/*.d.ts',
        '!packages/seeding/src/**/*.test.ts?(x)'
      ],
      moduleNameMapper,
      setupFiles: ['<rootDir>/packages/seeding/test/setupEnv.ts'],
      testMatch: ['<rootDir>/packages/seeding/src/**/*.test.ts?(x)'],
      transform: tsJestTransform('<rootDir>/packages/seeding/tsconfig.tools.json')
    },
    {
      displayName: 'electron',
      preset: 'ts-jest',
      testEnvironment: 'node',
      clearMocks: true,
      coverageDirectory: '<rootDir>/coverage/electron',
      coverageProvider: 'v8',
      collectCoverageFrom: [
        'packages/electron/src/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/*.test.ts',
        '!**/*.test.tsx',
        '!packages/electron/src/main/index.ts',
        '!packages/electron/src/preload/src/types.ts'
      ],
      coveragePathIgnorePatterns: [
        '<rootDir>/packages/electron/src/main/index.ts',
        '<rootDir>/packages/electron/src/preload/src/types.ts'
      ],
      coverageThreshold: {
        global: {
          statements: 0.8,
          branches: 0.7,
          functions: 0.8,
          lines: 0.8
        }
      },
      moduleNameMapper,
      setupFiles: ['<rootDir>/packages/electron/test/setupEnv.ts'],
      testMatch: [
        '<rootDir>/packages/electron/src/main/**/*.test.ts?(x)',
        '<rootDir>/packages/electron/src/preload/**/*.test.ts?(x)'
      ],
      transform: tsJestTransform('<rootDir>/packages/electron/tsconfig.node.json')
    }
  ]
}

export default config
