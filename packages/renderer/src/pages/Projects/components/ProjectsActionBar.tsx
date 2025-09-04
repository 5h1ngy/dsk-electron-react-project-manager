import { Button, Input, Space, Tooltip } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ChangeEvent } from 'react'

export interface ProjectsActionBarProps {
  onCreate: () => void
  onRefresh: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  isRefreshing: boolean
  isCreating: boolean
  canCreate: boolean
}

export const ProjectsActionBar = ({
  onCreate,
  onRefresh,
  searchValue,
  onSearchChange,
  isRefreshing,
  isCreating,
  canCreate
}: ProjectsActionBarProps): JSX.Element => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  return (
    <Space
      direction="horizontal"
      align="center"
      style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}
    >
      <Input
        placeholder="Cerca progetto..."
        style={{ maxWidth: 320 }}
        allowClear
        value={searchValue}
        onChange={handleSearchChange}
      />
      <Space>
        <Tooltip title="Aggiorna elenco">
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={isRefreshing}
            aria-label="Aggiorna progetti"
          />
        </Tooltip>
        <Tooltip
          title={
            canCreate ? 'Crea un nuovo progetto' : 'Permessi insufficienti per creare progetti'
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreate}
            loading={isCreating}
            disabled={!canCreate}
          >
            Nuovo progetto
          </Button>
        </Tooltip>
      </Space>
    </Space>
  )
}
