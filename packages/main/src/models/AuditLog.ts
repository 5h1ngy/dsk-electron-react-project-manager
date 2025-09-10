import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'
import { User } from '@main/models/User'

@Table({
  tableName: 'audit_logs',
  timestamps: false
})
export class AuditLog extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @Column({
    type: DataType.STRING(64),
    allowNull: false
  })
  declare entity: string

  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare entityId: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: true
  })
  declare userId: string | null

  @BelongsTo(() => User)
  declare user?: User

  @Column({
    type: DataType.STRING(32),
    allowNull: false
  })
  declare action: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare diffJSON: string | null

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: Date
}
