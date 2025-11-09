import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { WikiPage } from '@services/models/WikiPage'
import { User } from '@services/models/User'

@Table({
  tableName: 'wiki_revisions',
  timestamps: true,
  updatedAt: false
})
export class WikiRevision extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @ForeignKey(() => WikiPage)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare pageId: string

  @Column({
    type: DataType.STRING(160),
    allowNull: false
  })
  declare title: string

  @Column({
    type: DataType.STRING(240),
    allowNull: true
  })
  declare summary: string | null

  @Column({
    field: 'content_md',
    type: DataType.TEXT('long'),
    allowNull: false
  })
  declare contentMd: string

  @ForeignKey(() => User)
  @Column({
    field: 'created_by',
    type: DataType.STRING(36),
    allowNull: false
  })
  declare createdBy: string

  @BelongsTo(() => WikiPage, { onDelete: 'CASCADE' })
  declare page?: WikiPage

  @BelongsTo(() => User, 'createdBy')
  declare author?: User
}
