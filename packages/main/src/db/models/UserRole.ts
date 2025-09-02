import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from './User'
import { Role } from './Role'

@Table({
  tableName: 'user_roles',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: false
})
export class UserRole extends Model {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare userId: string

  @ForeignKey(() => Role)
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare roleId: string

  @BelongsTo(() => User)
  declare user?: User

  @BelongsTo(() => Role)
  declare role?: Role
}
