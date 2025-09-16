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
  status: Record<TaskDetails['status'], BadgeSpec>
  priority: Record<TaskDetails['priority'], BadgeSpec>
  projectRole: Record<ProjectSummary['role'], BadgeSpec>
  userRole: Record<RoleName, BadgeSpec>
  userStatus: {
    active: BadgeSpec
    inactive: BadgeSpec
  }
  projectKey: BadgeSpec
  tag: BadgeSpec
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

    return {
      status: {
        todo: { background: neutralBackground, color: neutralColor },
        in_progress: infoBadge,
        blocked: { background: token.colorWarningBg, color: token.colorWarningText },
        done: { background: token.colorSuccessBg, color: token.colorSuccessText }
      },
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
      tag: { background: neutralBackground, color: neutralColor },
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
