import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'
import { Task } from '@main/models/Task'
import { User } from '@main/models/User'

@Table({
  tableName: 'comments',
  timestamps: true
})
export class Comment extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @ForeignKey(() => Task)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare taskId: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare authorId: string

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  declare body: string

  @BelongsTo(() => Task)
  declare task?: Task

  @BelongsTo(() => User, 'authorId')
  declare author?: User
}
