import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'

import type { ThemeMode } from '../store/slices/theme'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

const mixColor = (color: string, amount: number, target: string): string => {
  const clean = color.replace('#', '')
  const cleanTarget = target.replace('#', '')
  const source = [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ]
  const targetRgb = [
    parseInt(cleanTarget.substring(0, 2), 16),
    parseInt(cleanTarget.substring(2, 4), 16),
    parseInt(cleanTarget.substring(4, 6), 16)
  ]

  const blended = source.map((channel, index) => {
    const value = Math.round(channel + (targetRgb[index] - channel) * amount)
    return Math.min(255, Math.max(0, value))
  })

  return `#${blended.map((value) => value.toString(16).padStart(2, '0')).join('')}`
}

const lighten = (color: string, amount: number) => mixColor(color, amount, '#ffffff')
const darken = (color: string, amount: number) => mixColor(color, amount, '#000000')

const createSharedTokens = (accentColor: string) => {
  const hover = lighten(accentColor, 0.15)
  const active = darken(accentColor, 0.2)

  return {
    colorPrimary: accentColor,
    colorPrimaryHover: hover,
    colorPrimaryActive: active,
    colorInfo: accentColor,
    colorLink: accentColor,
    colorLinkHover: hover,
    colorLinkActive: active,
    colorTextSelection: lighten(accentColor, 0.35),
    controlOutline: hover,
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6
  }
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

const createLightComponents = (
  accent: string,
  hover: string,
  active: string
): ThemeConfig['components'] => ({
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
    colorPrimary: accent,
    colorPrimaryHover: hover,
    colorPrimaryActive: active
  },
  Tag: {
    colorBorder: accent,
    colorBg: lighten(accent, 0.55),
    colorText: darken(accent, 0.35)
  }
})

const createDarkComponents = (
  accent: string,
  hover: string,
  active: string
): ThemeConfig['components'] => ({
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
    colorPrimary: accent,
    colorPrimaryHover: hover,
    colorPrimaryActive: active
  },
  Tag: {
    colorBorder: accent,
    colorBg: darken(accent, 0.6),
    colorText: lighten(accent, 0.45)
  }
})

export const createThemeConfig = (mode: ThemeMode, accentColor: string): ThemeConfig => {
  const shared = createSharedTokens(accentColor)
  const hover = shared.colorPrimaryHover
  const active = shared.colorPrimaryActive

  return {
    algorithm: mode === 'dark' ? [darkAlgorithm] : [defaultAlgorithm],
    token: {
      ...shared,
      ...(mode === 'dark' ? darkTokens : lightTokens)
    },
    components:
      mode === 'dark'
        ? createDarkComponents(accentColor, hover, active)
        : createLightComponents(accentColor, hover, active)
  }
}
