import { useMemo } from 'react'
import { theme } from 'antd'

import type { RoleName } from '@main/services/auth/constants'
import type { ProjectSummary } from '@renderer/store/slices/projects/types'
import type { TaskDetails } from '@renderer/store/slices/tasks'

export interface BadgeSpec {
  background: string
  color: string
  border?: string
}

export interface SemanticBadgeTokens {
  status: Record<string, BadgeSpec>
  statusFallback: BadgeSpec
  priority: Record<TaskDetails['priority'], BadgeSpec>
  projectRole: Record<ProjectSummary['role'], BadgeSpec>
  userRole: Record<RoleName, BadgeSpec>
  userStatus: {
    active: BadgeSpec
    inactive: BadgeSpec
  }
  projectKey: BadgeSpec
  tag: (label: string) => BadgeSpec
  notebook: BadgeSpec
  noteVisibility: {
    private: BadgeSpec
    public: BadgeSpec
  }
  comment: BadgeSpec
}

export const useSemanticBadges = (): SemanticBadgeTokens => {
  const { token } = theme.useToken()

  return useMemo(() => {
    const neutralBackground = token.colorFillQuaternary
    const neutralColor = token.colorTextSecondary
    const infoBadge = {
      background: token.colorInfoBg,
      color: token.colorInfoText
    }
    const primaryBadge = {
      background: token.colorPrimaryBg,
      color: token.colorPrimaryText
    }

    const tagPalette: BadgeSpec[] = [
      {
        background: token.colorPrimaryBg,
        color: token.colorPrimaryText,
        border: token.colorPrimaryBorder
      },
      {
        background: token.colorSuccessBg,
        color: token.colorSuccessText,
        border: token.colorSuccessBorder
      },
      {
        background: token.colorWarningBg,
        color: token.colorWarningText,
        border: token.colorWarningBorder
      },
      {
        background: token.colorInfoBg,
        color: token.colorInfoText,
        border: token.colorInfoBorder
      },
      {
        background: token.colorErrorBg,
        color: token.colorErrorText,
        border: token.colorErrorBorder
      },
      {
        background: token.colorBgSpotlight,
        color: token.colorTextLightSolid,
        border: token.colorBorderSecondary
      }
    ]

    const resolveTagSpec = (label: string): BadgeSpec => {
      if (!label) {
        return {
          background: neutralBackground,
          color: neutralColor,
          border: token.colorBorderSecondary
        }
      }
      let hash = 0
      const normalized = label.trim().toLowerCase()
      for (let index = 0; index < normalized.length; index += 1) {
        hash = (hash << 5) - hash + normalized.charCodeAt(index)
        hash |= 0
      }
      const paletteIndex = Math.abs(hash) % tagPalette.length
      return tagPalette[paletteIndex] ?? tagPalette[0]
    }

    return {
      status: {
        todo: { background: neutralBackground, color: neutralColor },
        in_progress: infoBadge,
        blocked: { background: token.colorWarningBg, color: token.colorWarningText },
        done: { background: token.colorSuccessBg, color: token.colorSuccessText }
      },
      statusFallback: { background: neutralBackground, color: neutralColor },
      priority: {
        low: { background: token.colorSuccessBg, color: token.colorSuccessText },
        medium: infoBadge,
        high: { background: token.colorWarningBg, color: token.colorWarningText },
        critical: { background: token.colorErrorBg, color: token.colorErrorText }
      },
      projectRole: {
        admin: { background: token.colorErrorBg, color: token.colorErrorText },
        edit: primaryBadge,
        view: { background: neutralBackground, color: neutralColor }
      },
      userRole: {
        Admin: { background: token.colorErrorBg, color: token.colorErrorText },
        Maintainer: primaryBadge,
        Contributor: infoBadge,
        Viewer: { background: neutralBackground, color: neutralColor }
      },
      userStatus: {
        active: { background: token.colorSuccessBg, color: token.colorSuccessText },
        inactive: { background: token.colorErrorBg, color: token.colorErrorText }
      },
      projectKey: primaryBadge,
      tag: resolveTagSpec,
      notebook: infoBadge,
      noteVisibility: {
        private: { background: token.colorWarningBg, color: token.colorWarningText },
        public: { background: token.colorSuccessBg, color: token.colorSuccessText }
      },
      comment: primaryBadge
    }
  }, [token])
}

export const buildBadgeStyle = (spec: BadgeSpec) => ({
  backgroundColor: spec.background,
  color: spec.color,
  borderColor: spec.border ?? 'transparent',
  fontWeight: 600
})


