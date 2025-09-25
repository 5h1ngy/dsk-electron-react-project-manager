import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Flex, Select, Space } from 'antd'
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
    <Flex vertical gap={12} style={{ width: '100%' }}>
      <Select
        allowClear
        showSearch
        placeholder={t('tasks.savedViews.placeholder')}
        size="large"
        style={{ width: '100%' }}
        value={selectedViewId ?? undefined}
        options={options}
        onChange={(value) => onSelect((value as string | undefined) ?? null)}
        loading={isLoading}
        disabled={isLoading}
      />
      <Space.Compact block>
        <Button
          icon={<SaveOutlined />}
          onClick={onCreate}
          loading={isMutating}
          disabled={isLoading || isMutating}
          style={{ flex: 1 }}
        >
          {t('tasks.savedViews.saveButton')}
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          disabled={!selectedViewId || isMutating}
          loading={isMutating}
          onClick={() => selectedViewId && onDelete(selectedViewId)}
          style={{ flex: 1 }}
        >
          {t('tasks.savedViews.deleteButton')}
        </Button>
      </Space.Compact>
    </Flex>
  )
}

TaskSavedViewsControls.displayName = 'TaskSavedViewsControls'

export default TaskSavedViewsControls
