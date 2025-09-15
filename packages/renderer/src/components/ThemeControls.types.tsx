import type { DropdownProps } from 'antd'
import type { TFunction } from 'i18next'

import type { ThemeMode } from '@renderer/store/slices/theme/types'

export type ThemeDropdownProps = Pick<
  DropdownProps,
  'trigger' | 'placement' | 'arrow' | 'open' | 'onOpenChange'
>

export interface ThemeControlsProps {
  className?: string
}

export interface AccentOption {
  color: string
  isActive: boolean
  ariaLabel: string
}

export interface UseThemeControlsResult {
  accentColor: string
  accentOptions: AccentOption[]
  dropdownProps: ThemeDropdownProps
  mode: ThemeMode
  onAccentSelect: (color: string) => void
  onToggleMode: (checked: boolean) => void
  t: TFunction
}
