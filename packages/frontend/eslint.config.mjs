import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import eslintPluginImport from 'eslint-plugin-import-x'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const tsconfigProjects = [resolve(workspaceRoot, 'packages/frontend/tsconfig.json')]

const sharedSettings = {
  react: {
    version: 'detect'
  },
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
  eslintPluginReact.configs.flat.recommended,
  eslintPluginReact.configs.flat['jsx-runtime'],
  { settings: sharedSettings },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: tsconfigProjects,
        tsconfigRootDir: workspaceRoot
      }
    },
    plugins: {
      'import-x': eslintPluginImport,
      'react-hooks': eslintPluginReactHooks,
      'react-refresh': eslintPluginReactRefresh
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
      ...eslintPluginReactRefresh.configs.vite.rules,
      '@typescript-eslint/explicit-function-return-type': 'off',
      ...importRules
    }
  },
  eslintConfigPrettier
)
