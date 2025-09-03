import type { RootState } from '../../types'

export const selectThemeMode = (state: RootState) => state.theme.mode
