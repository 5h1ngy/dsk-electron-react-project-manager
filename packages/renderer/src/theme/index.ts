import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'

import type { ThemeMode } from '@renderer/store/slices/theme'

import { buildDarkComponents } from './components/dark'
import { buildLightComponents } from './components/light'
import { DARK_TOKENS, LIGHT_TOKENS } from './tokens/base'
import { buildSharedTokens, extractAccentVariants } from './tokens/shared'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

export const createThemeConfig = (mode: ThemeMode, accentColor: string): ThemeConfig => {
  const sharedTokens = buildSharedTokens(accentColor)
  const { accent, hover, active } = extractAccentVariants(sharedTokens)

  return {
    algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
    token: {
      ...sharedTokens,
      ...(mode === 'dark' ? DARK_TOKENS : LIGHT_TOKENS)
    },
    components:
      mode === 'dark'
        ? buildDarkComponents(accent, hover, active)
        : buildLightComponents(accent, hover, active)
  }
}

export type { SharedTokenOverrides } from './tokens/shared'
