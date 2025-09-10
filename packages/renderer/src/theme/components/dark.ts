import type { ThemeConfig } from 'antd'

import { darken, lighten } from '@renderer/theme/utils/color'

export const buildDarkComponents = (
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
