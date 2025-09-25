import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Flex, Select, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import type { JSX } from 'react'

import type { ProjectSavedView } from '@renderer/pages/Projects/hooks/useProjectSavedViews'

export interface ProjectSavedViewsControlsProps {
  views: ProjectSavedView[]
  selectedViewId: string | null
  onSelect: (viewId: string | null) => void
  onCreate: () => void
  onDelete: (viewId: string) => void
}

export const ProjectSavedViewsControls = ({
  views,
  selectedViewId,
  onSelect,
  onCreate,
  onDelete
}: ProjectSavedViewsControlsProps): JSX.Element => {
  const { t } = useTranslation('projects')
  const options = views.map((view) => ({ label: view.name, value: view.id }))

  return (
    <Flex vertical gap={12} style={{ width: '100%' }}>
      <Select
        allowClear
        showSearch
        placeholder={t('views.placeholder', { defaultValue: 'Seleziona vista' })}
        size="large"
        style={{ width: '100%' }}
        value={selectedViewId ?? undefined}
        options={options}
        onChange={(value) => onSelect((value as string | undefined) ?? null)}
      />
      <Space.Compact block>
        <Button icon={<SaveOutlined />} onClick={onCreate} style={{ flex: 1 }}>
          {t('views.saveButton', { defaultValue: 'Salva vista' })}
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedViewId}
          onClick={() => selectedViewId && onDelete(selectedViewId)}
          style={{ flex: 1 }}
        >
          {t('views.deleteButton', { defaultValue: 'Elimina' })}
        </Button>
      </Space.Compact>
    </Flex>
  )
}

ProjectSavedViewsControls.displayName = 'ProjectSavedViewsControls'

export default ProjectSavedViewsControls
