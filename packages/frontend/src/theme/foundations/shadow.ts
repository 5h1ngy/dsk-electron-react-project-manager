export interface ElevationTokens {
  surface: string
  overlay: string
}

export const elevationTokens: ElevationTokens = {
  surface: '0 12px 32px rgba(15, 23, 42, 0.16)',
  overlay: '0 24px 48px rgba(2, 6, 23, 0.45)'
}

export const buildShadowTokens = () => ({
  boxShadow: elevationTokens.surface,
  boxShadowSecondary: elevationTokens.overlay
})
