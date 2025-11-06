import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Table } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { TableProps } from 'antd'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { UserDTO } from '@services/services/auth'

interface UserTableRowSelectionConfig {
  selectedRowKeys: string[]
  onChange: (keys: string[]) => void
  disabled?: boolean
  disableKeys?: string[]
}

interface UserTableProps {
  columns: ColumnsType<UserDTO>
  users: UserDTO[]
  loading: boolean
  hasLoaded: boolean
  pagination?: TablePaginationConfig
  rowSelection?: UserTableRowSelectionConfig
}

export const UserTable = ({
  columns,
  users,
  loading,
  hasLoaded,
  pagination,
  rowSelection
}: UserTableProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const showSkeleton = useDelayedLoading(loading && !hasLoaded)

  const selectionConfig: TableProps<UserDTO>['rowSelection'] | undefined = rowSelection
    ? {
        selectedRowKeys: rowSelection.selectedRowKeys,
        onChange: (selectedKeys) => {
          rowSelection.onChange(selectedKeys.map((key) => String(key)))
        },
        getCheckboxProps: (record) => ({
          disabled:
            Boolean(rowSelection.disabled) || Boolean(rowSelection.disableKeys?.includes(record.id))
        })
      }
    : undefined

  if (showSkeleton) {
    return <LoadingSkeleton layout="stack" />
  }

  return (
    <Table<UserDTO>
      rowKey="id"
      dataSource={users}
      columns={columns}
      pagination={
        pagination ?? {
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100']
        }
      }
      locale={{
        emptyText: <EmptyState title={t('dashboard:table.empty')} />
      }}
      rowSelection={selectionConfig}
    />
  )
}
