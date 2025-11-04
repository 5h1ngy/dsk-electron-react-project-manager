import {
  BelongsTo,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'
import { Project } from '@main/models/Project'
import { Task } from '@main/models/Task'
import { User } from '@main/models/User'

@DefaultScope(() => ({
  where: { deletedAt: null },
  order: [
    ['entryDate', 'DESC'],
    ['createdAt', 'DESC']
  ]
}))
@Table({
  tableName: 'time_entries',
  timestamps: true,
  paranoid: true
})
export class TimeEntry extends Model {
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
  declare userId: string

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  declare entryDate: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare durationMinutes: number

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string | null

  @BelongsTo(() => Project, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare project?: Project

  @BelongsTo(() => Task, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare task?: Task

  @BelongsTo(() => User, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare user?: User
}
