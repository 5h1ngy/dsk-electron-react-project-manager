import { useEffect, useState } from 'react'
import { Button, Drawer, Input, List, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'

import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { resetTaskSearch, searchTasks, selectTaskSearchState } from '@renderer/store/slices/tasks'
import type { TaskDetails } from '@renderer/store/slices/tasks'

interface TaskSearchDrawerProps {
  open: boolean
  onClose: () => void
  onSelect: (task: TaskDetails) => void
}

export const TaskSearchDrawer = ({ open, onClose, onSelect }: TaskSearchDrawerProps) => {
  const { t } = useTranslation('projects')
  const dispatch = useAppDispatch()
  const searchState = useAppSelector(selectTaskSearchState)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
      dispatch(resetTaskSearch())
    }
  }, [open, dispatch])

  const handleSearch = (value?: string) => {
    const target = (value ?? query).trim()
    if (target.length < 2) {
      return
    }
    void dispatch(searchTasks({ query: target }))
  }

  const handleSelect = (task: TaskDetails) => {
    onSelect(task)
  }

  return (
    <Drawer
      title={t('tasks.search.title')}
      placement="right"
      onClose={onClose}
      open={open}
      width={480}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Input.Search
          enterButton={t('tasks.search.submit')}
          size="large"
          placeholder={t('tasks.search.placeholder')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onSearch={handleSearch}
          allowClear
        />
        {searchState.error ? (
          <Typography.Text type="danger">{searchState.error}</Typography.Text>
        ) : null}
        <List
          dataSource={searchState.results}
          loading={searchState.status === 'loading'}
          locale={{ emptyText: t('tasks.search.empty') }}
          renderItem={(task) => (
            <List.Item
              key={task.id}
              actions={[
                <Button type="link" onClick={() => handleSelect(task)} key="open">
                  {t('tasks.search.openTask')}
                </Button>
              ]}
            >
              <List.Item.Meta
                title={task.title}
                description={
                  <Space direction="vertical" size={4}>
                    <Typography.Text type="secondary">
                      {task.projectKey} - {t(`details.status.${task.status}`)}
                    </Typography.Text>
                    {task.description ? (
                      <Typography.Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 0 }}>
                        {task.description}
                      </Typography.Paragraph>
                    ) : null}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Space>
    </Drawer>
  )
}

export default TaskSearchDrawer
