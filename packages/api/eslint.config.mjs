import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginImport from 'eslint-plugin-import-x'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const tsconfigProjects = [
  resolve(workspaceRoot, 'packages/api/tsconfig.api.json'),
  resolve(workspaceRoot, 'packages/api/tsconfig.api.dev.json')
]

const sharedSettings = {
  'import-x/resolver': {
    typescript: {
      project: tsconfigProjects,
      tsconfigRootDir: workspaceRoot,
      alwaysTryTypes: true
    }
  },
  'import-x/parsers': {
    '@typescript-eslint/parser': ['.ts', '.tsx']
  }
}

const importRules = {
  'import-x/no-unresolved': 'error',
  'import-x/named': 'error',
  'import-x/no-extraneous-dependencies': [
    'error',
    {
      devDependencies: [
        '**/*.test.*',
        '**/*.spec.*',
        '**/test/**',
        '**/scripts/**',
        '**/*.config.*'
      ]
    }
  ],
  'import-x/order': 'off'
}

export default defineConfig(
  { ignores: ['**/node_modules', '**/dist', '**/out'] },
  tseslint.configs.recommended,
  { settings: sharedSettings },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: tsconfigProjects,
        tsconfigRootDir: workspaceRoot
      }
    },
    plugins: {
      'import-x': eslintPluginImport
    },
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      ...importRules
    }
  },
  eslintConfigPrettier
)
