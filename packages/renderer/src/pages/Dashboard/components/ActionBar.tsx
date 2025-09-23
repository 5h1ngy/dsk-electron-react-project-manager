import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { AppstoreOutlined, TableOutlined } from '@ant-design/icons'
import { Button, Segmented, Space } from 'antd'

import { BorderedPanel } from '@renderer/components/Surface/BorderedPanel'

interface ActionBarProps {
  onCreate: () => void
  onRefresh: () => void
  isRefreshing?: boolean
  viewMode: 'table' | 'cards'
  onViewModeChange: (mode: 'table' | 'cards') => void
}

export const ActionBar = ({
  onCreate,
  onRefresh,
  isRefreshing,
  viewMode,
  onViewModeChange
}: ActionBarProps): JSX.Element => {
  const { t } = useTranslation('dashboard')

  return (
    <BorderedPanel padding="md" style={{ width: '100%' }}>
      <Space direction="horizontal" align="center" style={{ width: '100%', justifyContent: 'space-between' }} wrap>
        <Space size={8} wrap>
          <Button type="primary" onClick={onCreate}>
            {t('dashboard:actionBar.create')}
          </Button>
          <Button onClick={onRefresh} loading={isRefreshing} disabled={isRefreshing}>
            {t('dashboard:actionBar.refresh')}
          </Button>
        </Space>
        <Segmented
          size="large"
          value={viewMode}
          onChange={(next) => onViewModeChange(next as 'table' | 'cards')}
          options={[
            {
              label: (
                <Space size={6} style={{ color: 'inherit' }}>
                  <TableOutlined />
                  <span>{t('filters.users.view.table')}</span>
                </Space>
              ),
              value: 'table'
            },
            {
              label: (
                <Space size={6} style={{ color: 'inherit' }}>
                  <AppstoreOutlined />
                  <span>{t('filters.users.view.cards')}</span>
                </Space>
              ),
              value: 'cards'
            }
          ]}
        />
      </Space>
    </BorderedPanel>
  )
}
