import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'system_settings',
  timestamps: false
})
export class SystemSetting extends Model {
  @Column({
    type: DataType.STRING(128),
    primaryKey: true
  })
  declare key: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare value: string | null

  @Column({
    type: DataType.DATE,
    field: 'updatedAt'
  })
  declare updatedAt: Date
}
