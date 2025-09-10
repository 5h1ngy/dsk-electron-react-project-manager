import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import type { UserDTO } from '@main/services/auth'

interface UserTableProps {
  columns: ColumnsType<UserDTO>
  users: UserDTO[]
}

export const UserTable = ({ columns, users }: UserTableProps): JSX.Element => {
  const { t } = useTranslation('dashboard')

  return (
    <Table<UserDTO>
      rowKey="id"
      dataSource={users}
      columns={columns}
      locale={{ emptyText: t('dashboard:table.empty') }}
    />
  )
}
