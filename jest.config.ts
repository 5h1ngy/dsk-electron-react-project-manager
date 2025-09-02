import type { Config } from 'jest'

const sharedModuleNameMapper = {
  '^@main/(.*)$': '<rootDir>/packages/main/src/$1',
  '^@preload/(.*)$': '<rootDir>/packages/preload/src/$1',
  '^@renderer/(.*)$': '<rootDir>/packages/renderer/src/$1',
  '\\.(css|less|sass|scss)$': '<rootDir>/test/__mocks__/styleMock.ts',
  '\\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/test/__mocks__/fileMock.ts'
}

const config: Config = {
  coverageProvider: 'v8',
  clearMocks: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/packages/main/src/index.ts',
    '<rootDir>/packages/preload/src/types.ts',
    '<rootDir>/packages/renderer/src/main.tsx'
  ],
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!packages/main/src/index.ts',
    '!packages/preload/src/types.ts',
    '!packages/renderer/src/main.tsx'
  ],
  coverageThreshold: {
    global: {
      statements: 0.8,
      branches: 0.7,
      functions: 0.8,
      lines: 0.8
    }
  },
  projects: [
    {
      displayName: 'main',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/packages/main/**/*.test.ts',
        '<rootDir>/packages/preload/**/*.test.ts'
      ],
      moduleNameMapper: sharedModuleNameMapper,
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/tsconfig.node.json'
          }
        ]
      }
    },
    {
      displayName: 'renderer',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/packages/renderer/**/*.test.ts?(x)'],
      setupFilesAfterEnv: ['<rootDir>/test/setupRendererTests.ts'],
      moduleNameMapper: sharedModuleNameMapper,
      transform: {
        '^.+\\.(ts|tsx)$': [
          'ts-jest',
          {
            tsconfig: '<rootDir>/tsconfig.web.json'
          }
        ]
      }
    }
  ]
}

export default config
