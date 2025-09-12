export interface HeaderProps {
  collapsed: boolean
  onToggleCollapse: () => void
  expandLabel: string
  collapseLabel: string
  logoutLabel: string
  onLogout: () => void
  displayName: string
  username: string
  pageTitle: string
}
