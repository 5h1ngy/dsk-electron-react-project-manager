import type { ThemeConfig } from 'antd'

import { darken, lighten } from '@renderer/theme/utils/color'

export const buildDarkComponents = (
  accent: string,
  hover: string,
  _active: string
): ThemeConfig['components'] => {
  void _active
  return {
    Layout: {
      headerBg: '#0f172a',
      headerColor: '#e2e8f0',
      siderBg: '#111827',
      footerBg: '#0f172a',
      bodyBg: '#0b1220'
    },
    Card: {
      colorBgContainer: '#111b2d',
      colorBorderSecondary: '#1f2a3a',
      boxShadow: '0 24px 48px rgba(2, 6, 23, 0.45)',
      headerBg: '#111b2d'
    },
    Modal: {
      headerBg: '#111b2d',
      contentBg: '#111b2d'
    },
    Input: {
      hoverBorderColor: hover,
      activeBorderColor: accent,
      addonBg: '#1e293b',
      paddingInline: 12,
      paddingInlineSM: 10,
      paddingInlineLG: 14
    },
    Select: {
      optionSelectedBg: darken(accent, 0.55),
      optionActiveBg: darken(accent, 0.6),
      optionSelectedColor: lighten(accent, 0.4),
      optionSelectedFontWeight: 600,
      optionPadding: '9px 14px'
    },
    Tag: {
      defaultBg: darken(accent, 0.6),
      defaultColor: lighten(accent, 0.5)
    },
    Table: {
      headerBg: '#13213a',
      headerColor: '#f8fafc',
      headerSortActiveBg: darken(accent, 0.55),
      rowHoverBg: darken(accent, 0.68),
      rowSelectedBg: darken(accent, 0.58),
      borderColor: '#1f2a3a',
      cellPaddingBlock: 12,
      cellPaddingInline: 14
    },
    Tabs: {
      itemColor: '#94a3b8',
      itemHoverColor: '#f8fafc',
      itemActiveColor: '#ffffff',
      inkBarColor: accent,
      horizontalItemPadding: '10px 14px'
    },
    Pagination: {
      itemBg: '#111b2d',
      itemActiveBg: accent,
      itemSize: 36
    },
    Segmented: {
      itemColor: '#cbd5f5',
      itemHoverColor: '#ffffff',
      itemHoverBg: darken(accent, 0.55),
      itemSelectedBg: darken(accent, 0.5),
      itemSelectedColor: '#ffffff',
      trackBg: '#0f172a',
      trackPadding: 3
    },
    Typography: {
      titleMarginBottom: 12
    }
  }
}
