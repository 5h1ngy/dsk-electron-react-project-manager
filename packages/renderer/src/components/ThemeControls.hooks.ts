import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import {
  selectAccentColor,
  selectThemeMode,
  setAccentColor,
  setMode
} from '@renderer/store/slices/theme'
import type { UseThemeControlsResult, ThemeDropdownProps } from '@renderer/components/ThemeControls.types'
import { ACCENT_PRESETS } from '@renderer/theme/foundations/brand'

export const useThemeControls = (): UseThemeControlsResult => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const accentColor = useAppSelector(selectAccentColor)

  const [open, setOpen] = useState(false)

  const onToggleMode = useCallback(
    (checked: boolean) => {
      dispatch(setMode(checked ? 'dark' : 'light'))
    },
    [dispatch]
  )

  const onAccentSelect = useCallback(
    (color: string) => {
      dispatch(setAccentColor(color))
      setOpen(false)
    },
    [dispatch]
  )

  const dropdownProps = useMemo<ThemeDropdownProps>(
    () => ({
      trigger: ['click'],
      placement: 'bottomRight',
      arrow: true,
      open,
      onOpenChange: setOpen
    }),
    [open]
  )

  const accentOptions = useMemo(
    () =>
      ACCENT_PRESETS.map((color, index) => ({
        color,
        isActive: color === accentColor,
        ariaLabel: t('appShell.accent.option', { index: index + 1 })
      })),
    [accentColor, t]
  )

  return {
    accentColor,
    accentOptions,
    dropdownProps,
    mode,
    onAccentSelect,
    onToggleMode,
    t
  }
}
