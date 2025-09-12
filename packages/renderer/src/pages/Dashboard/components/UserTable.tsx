import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { EmptyState, LoadingSkeleton } from '@renderer/components/DataStates'
import { useDelayedLoading } from '@renderer/hooks/useDelayedLoading'
import type { UserDTO } from '@main/services/auth'

interface UserTableProps {
  columns: ColumnsType<UserDTO>
  users: UserDTO[]
  loading: boolean
  hasLoaded: boolean
}

export const UserTable = ({ columns, users, loading, hasLoaded }: UserTableProps): JSX.Element => {
  const { t } = useTranslation('dashboard')
  const showSkeleton = useDelayedLoading(loading && !hasLoaded)

  if (showSkeleton) {
    return <LoadingSkeleton variant="table" />
  }

  return (
    <Table<UserDTO>
      rowKey="id"
      dataSource={users}
      columns={columns}
      locale={{
        emptyText: <EmptyState title={t('dashboard:table.empty')} />
      }}
    />
  )
}
