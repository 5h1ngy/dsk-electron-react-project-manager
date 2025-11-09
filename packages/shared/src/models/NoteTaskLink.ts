import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { Note } from '@services/models/Note'
import { Task } from '@services/models/Task'

@Table({
  tableName: 'note_tasks',
  timestamps: false
})
export class NoteTaskLink extends Model {
  @ForeignKey(() => Note)
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare noteId: string

  @ForeignKey(() => Task)
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare taskId: string

  @BelongsTo(() => Note)
  declare note?: Note

  @BelongsTo(() => Task)
  declare task?: Task
}
