import { theme } from 'antd'
import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'

interface UseAccountMenuStylesParams {
  width?: number
}

export const useAccountMenuStyles = ({ width }: UseAccountMenuStylesParams = {}) => {
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()

  const controlHeightLG =
    typeof token.controlHeightLG === 'number' && Number.isFinite(token.controlHeightLG)
      ? token.controlHeightLG
      : 40
  const cardWidth = width ?? controlHeightLG * 5

  return {
    sectionGap: spacing.sm,
    headerGap: spacing.xs,
    dividerStyle: {
      marginTop: token.marginSM,
      marginBottom: token.marginSM
    } as const,
    cardProps: {
      variant: 'borderless' as const,
      style: {
        width: cardWidth,
        background: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowSecondary
      },
      styles: {
        body: {
          padding: token.paddingLG
        }
      }
    }
  }
}
