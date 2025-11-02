import {
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  Unique,
  DefaultScope,
  Scopes
} from 'sequelize-typescript'
import { UserRole } from '@main/models/UserRole'
import { AuditLog } from '@main/models/AuditLog'

@DefaultScope(() => ({
  attributes: { exclude: ['passwordHash'] }
}))
@Scopes(() => ({
  withPassword: {
    attributes: { include: ['passwordHash'] }
  }
}))
@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @Unique
  @Column({
    type: DataType.STRING(32),
    allowNull: false
  })
  declare username: string

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  declare passwordHash: string

  @Column({
    type: DataType.STRING(64),
    allowNull: false
  })
  declare displayName: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true
  })
  declare isActive: boolean

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare lastLoginAt: Date | null

  @HasMany(() => UserRole)
  declare userRoles?: UserRole[]

  @HasMany(() => AuditLog)
  declare auditLogs?: AuditLog[]
}
