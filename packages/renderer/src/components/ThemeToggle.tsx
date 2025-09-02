import { BulbOutlined, MoonOutlined } from '@ant-design/icons'
import { Switch, Tooltip } from 'antd'
import { useThemeStore } from '../store/themeStore'
import { JSX } from 'react'

export const ThemeToggle = (): JSX.Element => {
  const mode = useThemeStore((state) => state.mode)
  const toggle = useThemeStore((state) => state.toggle)

  return (
    <Tooltip title={`Tema ${mode === 'light' ? 'scuro' : 'chiaro'}`}>
      <Switch
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<BulbOutlined />}
        checked={mode === 'dark'}
        onChange={toggle}
        aria-label="Commuta tema"
      />
    </Tooltip>
  )
}
