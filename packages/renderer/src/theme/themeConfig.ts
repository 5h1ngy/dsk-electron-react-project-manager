import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'
import type { ThemeMode } from '../store/slices/themeSlice'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

export const createThemeConfig = (mode: ThemeMode): ThemeConfig => ({
  algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
  token: {
    colorPrimary: '#1677ff'
  }
})
