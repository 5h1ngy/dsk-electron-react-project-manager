import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'antd'

interface ActionBarProps {
  onCreate: () => void
  onRefresh: () => void
  isRefreshing?: boolean
}

export const ActionBar = ({
  onCreate,
  onRefresh,
  isRefreshing
}: ActionBarProps): JSX.Element => {
  const { t } = useTranslation('dashboard')

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, width: '100%' }}>
      <Button type="primary" onClick={onCreate}>
        {t('dashboard:actionBar.create')}
      </Button>
      <Button onClick={onRefresh} loading={isRefreshing} disabled={isRefreshing}>
        {t('dashboard:actionBar.refresh')}
      </Button>
    </div>
  )
}
