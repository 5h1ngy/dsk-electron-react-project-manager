import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript'
import { Project } from './Project'
import { User } from './User'
import { Comment } from './Comment'

export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

@DefaultScope(() => ({
  where: { deletedAt: null }
}))
@Table({
  tableName: 'tasks',
  timestamps: true,
  paranoid: true
})
export class Task extends Model {
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

  @Column({
    type: DataType.STRING(32),
    allowNull: false
  })
  declare key: string

  @ForeignKey(() => Task)
  @Column({
    type: DataType.STRING(36),
    allowNull: true
  })
  declare parentId: string | null

  @Column({
    type: DataType.STRING(160),
    allowNull: false
  })
  declare title: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string | null

  @Column({
    type: DataType.STRING(24),
    allowNull: false,
    defaultValue: 'todo'
  })
  declare status: TaskStatus

  @Column({
    type: DataType.STRING(16),
    allowNull: false,
    defaultValue: 'medium'
  })
  declare priority: TaskPriority

  @Column({
    type: DataType.DATEONLY,
    allowNull: true
  })
  declare dueDate: string | null

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: true
  })
  declare assigneeId: string | null

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare ownerUserId: string

  @BelongsTo(() => Project)
  declare project?: Project

  @BelongsTo(() => Task, 'parentId')
  declare parent?: Task | null

  @HasMany(() => Task, 'parentId')
  declare subtasks?: Task[]

  @BelongsTo(() => User, 'assigneeId')
  declare assignee?: User | null

  @BelongsTo(() => User, 'ownerUserId')
  declare owner?: User

  @HasMany(() => Comment)
  declare comments?: Comment[]
}
