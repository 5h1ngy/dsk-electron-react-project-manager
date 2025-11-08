import { theme } from 'antd'

import { spacingScale } from '@renderer/theme/foundations/spacing'
import { typographyScale } from '@renderer/theme/foundations/typography'

export const useThemeTokens = () => {
  const { token } = theme.useToken()

  return {
    token,
    spacing: spacingScale,
    typography: typographyScale
  }
}

export type UseThemeTokensReturn = ReturnType<typeof useThemeTokens>
