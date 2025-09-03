import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'

import type { ThemeMode } from '../store/slices/theme'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

const sharedTokens = {
  colorPrimary: '#1677ff',
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 6
}

const lightTokens = {
  colorBgBase: '#f5f7fb',
  colorBgLayout: '#f5f7fb',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorTextBase: '#1f2937',
  colorTextSecondary: '#4b5563',
  colorBorder: '#d0d7e1',
  colorSplit: '#e5e8ec'
}

const darkTokens = {
  colorBgBase: '#0f172a',
  colorBgLayout: '#0f172a',
  colorBgContainer: '#1e293b',
  colorBgElevated: '#1e293b',
  colorTextBase: '#e2e8f0',
  colorTextSecondary: '#94a3b8',
  colorBorder: '#334155',
  colorSplit: '#1f2937'
}

const lightComponents: ThemeConfig['components'] = {
  Layout: {
    headerBg: '#ffffff',
    headerColor: '#1f2937',
    siderBg: '#f1f5f9',
    footerBg: '#ffffff'
  },
  Card: {
    colorBgContainer: '#ffffff',
    colorBorderSecondary: '#e5e8ec',
    boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.08)'
  },
  Modal: {
    headerBg: '#ffffff',
    contentBg: '#ffffff'
  },
  Input: {
    colorBgContainer: '#ffffff',
    colorBorder: '#d0d7e1',
    colorText: '#1f2937'
  },
  Button: {
    colorBgContainer: '#1677ff',
    colorBorder: '#1677ff',
    colorText: '#ffffff'
  }
}

const darkComponents: ThemeConfig['components'] = {
  Layout: {
    headerBg: '#0f172a',
    headerColor: '#e2e8f0',
    siderBg: '#111827',
    footerBg: '#0f172a'
  },
  Card: {
    colorBgContainer: '#1e293b',
    colorBorderSecondary: '#1f2937',
    boxShadow: '0px 12px 32px rgba(15, 23, 42, 0.45)'
  },
  Modal: {
    headerBg: '#1e293b',
    contentBg: '#1e293b'
  },
  Input: {
    colorBgContainer: '#111827',
    colorBorder: '#334155',
    colorText: '#f8fafc'
  },
  Button: {
    colorBgContainer: '#1677ff',
    colorBorder: '#1677ff',
    colorText: '#ffffff'
  }
}

export const createThemeConfig = (mode: ThemeMode): ThemeConfig => ({
  algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
  token: {
    ...sharedTokens,
    ...(mode === 'dark' ? darkTokens : lightTokens)
  },
  components: mode === 'dark' ? darkComponents : lightComponents
})
