import { Button, Tooltip } from 'antd'
import { PoweroffOutlined } from '@ant-design/icons'
import type { JSX } from 'react'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'
import type { CommandToolbarProps } from '@renderer/layout/Shell/components/Header/CommandToolbar.types'

export const CommandToolbar = ({ onLogout, logoutLabel }: CommandToolbarProps): JSX.Element => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <LanguageSwitcher />
    <ThemeControls />
    <Tooltip title={logoutLabel} placement="bottom">
      <Button
        type="primary"
        danger
        icon={<PoweroffOutlined />}
        onClick={onLogout}
        aria-label={logoutLabel}
      />
    </Tooltip>
  </div>
)

CommandToolbar.displayName = 'CommandToolbar'

