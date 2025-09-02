import { Column, DataType, Model, Table } from 'sequelize-typescript'

@Table({
  tableName: 'migrations',
  timestamps: false
})
export class MigrationMeta extends Model {
  @Column({
    type: DataType.STRING,
    primaryKey: true
  })
  declare name: string
}
