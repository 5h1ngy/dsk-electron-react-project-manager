import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table
} from 'sequelize-typescript'

import { Project } from '@main/models/Project'

@Table({
  tableName: 'task_statuses',
  timestamps: true
})
export class TaskStatus extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @Index({ name: 'task_status_project_key', unique: true })
  @ForeignKey(() => Project)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare projectId: string

  @Index({ name: 'task_status_project_key', unique: true })
  @Column({
    type: DataType.STRING(48),
    allowNull: false
  })
  declare key: string

  @Column({
    type: DataType.STRING(80),
    allowNull: false
  })
  declare label: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare position: number

  @BelongsTo(() => Project)
  declare project?: Project
}

