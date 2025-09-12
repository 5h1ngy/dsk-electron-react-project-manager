import type { ThemeConfig } from 'antd'

import { darken, lighten } from '@renderer/theme/utils/color'

export const buildLightComponents = (
  accent: string,
  hover: string,
  _active: string
): ThemeConfig['components'] => {
  void _active
  return {
    Layout: {
      headerBg: '#ffffff',
      headerColor: '#111827',
      siderBg: '#f5f7fb',
      footerBg: '#ffffff',
      bodyBg: '#f7f9fc'
    },
    Card: {
      colorBgContainer: '#ffffff',
      colorBorderSecondary: '#e3e8ef',
      boxShadow: '0 18px 48px rgba(15, 23, 42, 0.12)',
      headerBg: '#ffffff'
    },
    Modal: {
      headerBg: '#ffffff',
      contentBg: '#ffffff'
    },
    Input: {
      hoverBorderColor: hover,
      activeBorderColor: accent,
      addonBg: '#eef2ff',
      paddingInline: 12,
      paddingInlineSM: 10,
      paddingInlineLG: 14
    },
    Select: {
      optionSelectedBg: lighten(accent, 0.82),
      optionActiveBg: lighten(accent, 0.9),
      optionSelectedColor: accent,
      optionSelectedFontWeight: 600,
      optionPadding: '9px 14px'
    },
    Tag: {
      defaultBg: lighten(accent, 0.6),
      defaultColor: darken(accent, 0.35)
    },
    Table: {
      headerBg: '#f1f5f9',
      headerColor: '#111827',
      headerSortActiveBg: lighten(accent, 0.85),
      rowHoverBg: lighten(accent, 0.92),
      rowSelectedBg: lighten(accent, 0.85),
      borderColor: '#e3e8ef',
      cellPaddingBlock: 12,
      cellPaddingInline: 14
    },
    Tabs: {
      itemColor: '#4b5563',
      itemHoverColor: '#111827',
      itemActiveColor: '#111827',
      inkBarColor: accent,
      horizontalItemPadding: '10px 14px'
    },
    Pagination: {
      itemBg: '#ffffff',
      itemActiveBg: accent,
      itemSize: 36
    },
    Segmented: {
      itemColor: '#4b5563',
      itemHoverColor: '#111827',
      itemHoverBg: lighten(accent, 0.85),
      itemSelectedBg: lighten(accent, 0.8),
      itemSelectedColor: '#111827',
      trackBg: '#f1f5f9',
      trackPadding: 3
    },
    Typography: {
      titleMarginBottom: 12
    }
  }
}
