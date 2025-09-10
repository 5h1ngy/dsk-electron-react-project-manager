import type { ThemeConfig } from 'antd'

import { darken, lighten } from '@renderer/theme/utils/color'

export const buildLightComponents = (
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
