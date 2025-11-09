import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { Note } from '@services/models/Note'

@Table({
  tableName: 'note_tags',
  timestamps: false
})
export class NoteTag extends Model {
  @ForeignKey(() => Note)
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare noteId: string

  @Column({
    type: DataType.STRING(40),
    allowNull: false,
    primaryKey: true
  })
  declare tag: string

  @BelongsTo(() => Note)
  declare note?: Note
}
