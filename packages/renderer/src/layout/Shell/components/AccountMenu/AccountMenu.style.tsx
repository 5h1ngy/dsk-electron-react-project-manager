import { theme } from 'antd'
import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'

interface UseAccountMenuStylesParams {
  width?: number
}

export const useAccountMenuStyles = ({ width }: UseAccountMenuStylesParams = {}) => {
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()

  const cardWidth = width ?? token.controlHeightLG * 5

  return {
    sectionGap: spacing.sm,
    headerGap: spacing.xs,
    dividerStyle: {
      marginTop: token.marginSM,
      marginBottom: token.marginSM
    } as const,
    cardProps: {
      bordered: false,
      style: {
        width: cardWidth,
        background: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary
      },
      bodyStyle: {
        padding: token.paddingLG
      }
    }
  }
}
