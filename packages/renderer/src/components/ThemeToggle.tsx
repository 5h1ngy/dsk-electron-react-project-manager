import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Switch, Tooltip } from 'antd'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { selectThemeMode, toggleMode } from '@renderer/store/slices/themeSlice'

export const ThemeToggle = (): JSX.Element => {
  const dispatch = useAppDispatch()
  const mode = useAppSelector(selectThemeMode)
  const { t } = useTranslation()

  const tooltipTitle = mode === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')

  return (
    <Tooltip title={tooltipTitle}>
      <Switch
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<BulbOutlined />}
        checked={mode === 'dark'}
        onChange={() => {
          dispatch(toggleMode())
        }}
        aria-label={t('theme.ariaLabel')}
      />
    </Tooltip>
  )
}
