import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'
import { UserRole } from '@main/models/UserRole'

@Table({
  tableName: 'roles',
  timestamps: true
})
export class Role extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    unique: true
  })
  declare name: string

  @HasMany(() => UserRole)
  declare userRoles?: UserRole[]
}
