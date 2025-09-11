import type { ShellRoleBadge } from '@renderer/layout/Shell/Shell.types'

export interface ShellSiderFooterProps {
  displayName: string
  username: string
  roles: ShellRoleBadge[]
  accentColor: string
  onLogout: () => void
  logoutLabel: string
}

