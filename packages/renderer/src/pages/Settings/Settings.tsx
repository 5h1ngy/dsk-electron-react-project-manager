import { Breadcrumb, Card, Divider, Space, Typography } from 'antd'
import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'
import { ShellHeaderPortal } from '@renderer/layout/Shell/ShellHeader.context'
import { usePrimaryBreadcrumb } from '@renderer/layout/Shell/hooks/usePrimaryBreadcrumb'
import { useBreadcrumbStyle } from '@renderer/layout/Shell/hooks/useBreadcrumbStyle'

const SettingsPage = (): JSX.Element => {
  const { t } = useTranslation('common')
  const breadcrumbItems = usePrimaryBreadcrumb([{ title: t('appShell.navigation.settings') }])
  const breadcrumbStyle = useBreadcrumbStyle(breadcrumbItems)

  return (
    <>
      <ShellHeaderPortal>
        <Breadcrumb items={breadcrumbItems} style={breadcrumbStyle} />
      </ShellHeaderPortal>
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={3} style={{ marginBottom: 0 }}>
            {t('settingsPage.title')}
          </Typography.Title>
          <Typography.Paragraph type="secondary">{t('appShell.title')}</Typography.Paragraph>
        </div>

        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>
                {t('settingsPage.appearance.title')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('settingsPage.appearance.description')}
              </Typography.Text>
            </div>
            <ThemeControls />
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 4 }}>
                {t('settingsPage.language.title')}
              </Typography.Title>
              <Typography.Text type="secondary">
                {t('settingsPage.language.description')}
              </Typography.Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <LanguageSwitcher />
          </Space>
        </Card>
      </Space>
    </>
  )
}

SettingsPage.displayName = 'SettingsPage'

export { SettingsPage }
export default SettingsPage
