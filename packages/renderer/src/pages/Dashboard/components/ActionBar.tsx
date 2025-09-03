import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'antd'

interface ActionBarProps {
  onCreate: () => void
  onRefresh: () => void
}

export const ActionBar = ({ onCreate, onRefresh }: ActionBarProps): JSX.Element => {
  const { t } = useTranslation('dashboard')

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%' }}>
      <Button type="primary" onClick={onCreate}>
        {t('dashboard:actionBar.create')}
      </Button>
      <Button onClick={onRefresh}>{t('dashboard:actionBar.refresh')}</Button>
    </div>
  )
}
