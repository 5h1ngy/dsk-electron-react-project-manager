import type { RootState } from '../../types'

export const selectThemeMode = (state: RootState) => state.theme.mode
export const selectAccentColor = (state: RootState) => state.theme.accentColor
