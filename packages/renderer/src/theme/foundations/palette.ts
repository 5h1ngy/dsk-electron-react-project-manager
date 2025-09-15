import type { ThemeMode } from '@renderer/store/slices/theme'

export interface PaletteTokens {
  surfaceApp: string
  surfaceBase: string
  surfaceContainer: string
  surfaceElevated: string
  surfaceMuted: string
  surfaceBackdrop: string
  textPrimary: string
  textSecondary: string
  textInverse: string
  textOnBright: string
  textOnDark: string
  borderSubtle: string
  borderStrong: string
}

const LIGHT_PALETTE: PaletteTokens = {
  surfaceApp: '#f5f7fb',
  surfaceBase: '#f7f9fc',
  surfaceContainer: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceMuted: '#eef2ff',
  surfaceBackdrop: 'rgba(15, 23, 42, 0.08)',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  textInverse: '#ffffff',
  textOnBright: '#0f172a',
  textOnDark: '#ffffff',
  borderSubtle: '#d0d7e1',
  borderStrong: '#e3e8ef'
}

const DARK_PALETTE: PaletteTokens = {
  surfaceApp: '#0f172a',
  surfaceBase: '#0b1220',
  surfaceContainer: '#1e293b',
  surfaceElevated: '#111b2d',
  surfaceMuted: '#1e293b',
  surfaceBackdrop: 'rgba(2, 6, 23, 0.6)',
  textPrimary: '#e2e8f0',
  textSecondary: '#94a3b8',
  textInverse: '#0f172a',
  textOnBright: '#0f172a',
  textOnDark: '#f8fafc',
  borderSubtle: '#334155',
  borderStrong: '#1f2a3a'
}

export const resolvePalette = (mode: ThemeMode): PaletteTokens =>
  mode === 'dark' ? DARK_PALETTE : LIGHT_PALETTE
