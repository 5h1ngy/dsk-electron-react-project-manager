import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Switch, Tooltip } from 'antd'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useThemeStore } from '../store/themeStore'

export const ThemeToggle = (): JSX.Element => {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)
  const { t } = useTranslation()

  const tooltipTitle = mode === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')

  return (
    <Tooltip title={tooltipTitle}>
      <Switch
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<BulbOutlined />}
        checked={mode === 'dark'}
        onChange={toggle}
        aria-label={t('theme.ariaLabel')}
      />
    </Tooltip>
  )
}