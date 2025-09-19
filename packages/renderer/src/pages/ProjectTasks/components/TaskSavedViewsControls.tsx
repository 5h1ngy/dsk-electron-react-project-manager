import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Select, Space, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

import type { SavedView } from '@renderer/store/slices/views/types'
import type { LoadStatus } from '@renderer/store/slices/tasks/types'

export interface TaskSavedViewsControlsProps {
  views: SavedView[]
  selectedViewId: string | null
  onSelect: (viewId: string | null) => void
  onCreate: () => void
  onDelete: (viewId: string) => void
  loadingStatus: LoadStatus
  mutationStatus: LoadStatus
}

export const TaskSavedViewsControls = ({
  views,
  selectedViewId,
  onSelect,
  onCreate,
  onDelete,
  loadingStatus,
  mutationStatus
}: TaskSavedViewsControlsProps) => {
  const { t } = useTranslation('projects')
  const options = views.map((view) => ({ label: view.name, value: view.id }))
  const isLoading = loadingStatus === 'loading'
  const isMutating = mutationStatus === 'loading'

  return (
    <Space size="small" wrap>
      <Select
        allowClear
        showSearch
        placeholder={t('tasks.savedViews.placeholder')}
        style={{ minWidth: 220 }}
        value={selectedViewId ?? undefined}
        options={options}
        onChange={(value) => onSelect((value as string | undefined) ?? null)}
        loading={isLoading}
        disabled={isLoading}
      />
      <Tooltip title={t('tasks.savedViews.saveTooltip')}>
        <Button
          icon={<SaveOutlined />}
          onClick={onCreate}
          loading={isMutating}
          disabled={isLoading || isMutating}
        >
          {t('tasks.savedViews.saveButton')}
        </Button>
      </Tooltip>
      <Tooltip title={t('tasks.savedViews.deleteTooltip')}>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedViewId || isMutating}
          loading={isMutating}
          onClick={() => selectedViewId && onDelete(selectedViewId)}
        >
          {t('tasks.savedViews.deleteButton')}
        </Button>
      </Tooltip>
    </Space>
  )
}

TaskSavedViewsControls.displayName = 'TaskSavedViewsControls'

export default TaskSavedViewsControls
