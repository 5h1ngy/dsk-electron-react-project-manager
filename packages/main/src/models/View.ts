import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { Project } from '@main/models/Project'
import { User } from '@main/models/User'

@Table({
  tableName: 'views',
  timestamps: true
})
export class View extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @ForeignKey(() => Project)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare projectId: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare userId: string

  @Column({
    type: DataType.STRING(120),
    allowNull: false
  })
  declare name: string

  @Column({
    field: 'query_state',
    type: DataType.JSON,
    allowNull: false
  })
  declare queryState: unknown

  @Column({
    field: 'sort_state',
    type: DataType.JSON,
    allowNull: true
  })
  declare sortState: unknown | null

  @Column({
    field: 'columns_state',
    type: DataType.JSON,
    allowNull: true
  })
  declare columnsState: unknown | null

  @BelongsTo(() => Project)
  declare project?: Project

  @BelongsTo(() => User)
  declare owner?: User
}
