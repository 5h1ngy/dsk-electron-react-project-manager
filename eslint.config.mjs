import { defineConfig } from 'eslint/config'
import tseslint from '@electron-toolkit/eslint-config-ts'
import eslintConfigPrettier from '@electron-toolkit/eslint-config-prettier'
import eslintPluginReact from 'eslint-plugin-react'
import eslintPluginReactHooks from 'eslint-plugin-react-hooks'
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh'
import eslintPluginImport from 'eslint-plugin-import-x'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const workspaceRoot = dirname(fileURLToPath(new URL('.', import.meta.url)))

const reactRecommended = eslintPluginReact.configs.flat.recommended ?? {}
const reactJsxRuntime = eslintPluginReact.configs.flat['jsx-runtime'] ?? {}
const reactHookRules = eslintPluginReactHooks.configs.recommended.rules ?? {}
const reactRefreshRules = eslintPluginReactRefresh.configs.vite.rules ?? {}

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

const createImportSettings = (projects) => ({
  'import-x/resolver': {
    typescript: {
      project: projects,
      tsconfigRootDir: workspaceRoot,
      alwaysTryTypes: true
    }
  },
  'import-x/parsers': {
    '@typescript-eslint/parser': ['.ts', '.tsx']
  }
})

const createBaseRules = () => ({
  '@typescript-eslint/explicit-function-return-type': 'off',
  ...importRules
})

const createNodeOverride = (files, projects) => ({
  files,
  languageOptions: {
    parserOptions: {
      project: projects,
      tsconfigRootDir: workspaceRoot
    }
  },
  settings: createImportSettings(projects),
  plugins: {
    'import-x': eslintPluginImport
  },
  rules: {
    ...createBaseRules()
  }
})

const createReactOverride = (files, projects) => ({
  files,
  languageOptions: {
    parserOptions: {
      project: projects,
      tsconfigRootDir: workspaceRoot
    }
  },
  settings: {
    react: {
      version: 'detect'
    },
    ...createImportSettings(projects)
  },
  plugins: {
    'import-x': eslintPluginImport,
    'react-hooks': eslintPluginReactHooks,
    'react-refresh': eslintPluginReactRefresh
  },
  rules: {
    ...reactRecommended.rules,
    ...reactJsxRuntime.rules,
    ...reactHookRules,
    ...reactRefreshRules,
    ...createBaseRules()
  }
})

const ELECTRON_NODE_TSCONFIG = [resolve(workspaceRoot, 'packages/electron/tsconfig.node.json')]
const ELECTRON_WEB_TSCONFIG = [resolve(workspaceRoot, 'packages/electron/tsconfig.web.json')]
const BACKEND_TSCONFIG = [
  resolve(workspaceRoot, 'packages/backend/tsconfig.backend.dev.json'),
  resolve(workspaceRoot, 'packages/backend/tsconfig.backend.prod.json')
]

export default defineConfig(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/out/**', 'coverage/**']
  },
  tseslint.configs.recommended,
  createReactOverride(
    ['packages/frontend/**/*.{ts,tsx}'],
    [resolve(workspaceRoot, 'packages/frontend/tsconfig.json')]
  ),
  createNodeOverride(
    ['packages/electron/src/main/**/*.{ts,tsx}', 'packages/electron/src/preload/**/*.{ts,tsx}'],
    [...ELECTRON_NODE_TSCONFIG, ...ELECTRON_WEB_TSCONFIG]
  ),
  createNodeOverride(['packages/backend/**/*.{ts,tsx}'], BACKEND_TSCONFIG),
  createNodeOverride(['packages/shared/**/*.{ts,tsx}'], ELECTRON_NODE_TSCONFIG),
  createNodeOverride(
    ['packages/seeding/**/*.{ts,tsx}'],
    [resolve(workspaceRoot, 'packages/seeding/tsconfig.tools.json')]
  ),
  eslintConfigPrettier
)
