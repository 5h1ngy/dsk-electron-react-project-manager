import { theme } from 'antd'
import { useMemo } from 'react'

import type { ThemeMode } from '../theme/foundations/palette'
import type { SurfacePalette } from '../theme/surfaces'
import { buildSurfacePalette } from '../theme/surfaces'

export const useSurfacePalette = (mode: ThemeMode, accent: string): SurfacePalette => {
  const { token } = theme.useToken()

  return useMemo(() => buildSurfacePalette(token, mode, accent), [token, mode, accent])
}
