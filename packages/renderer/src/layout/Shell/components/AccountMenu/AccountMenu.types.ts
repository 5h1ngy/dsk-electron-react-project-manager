import type { ShellLabels } from '@renderer/layout/Shell/Shell.types'

export interface AccountMenuProps {
  displayName: string
  username: string
  onLogout: () => void
  labels: ShellLabels
  width?: number
}
