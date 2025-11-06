import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from 'sequelize-typescript'

import { Project } from '@main/models/Project'
import { User } from '@main/models/User'

@Table({
  tableName: 'wiki_pages',
  timestamps: true
})
export class WikiPage extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @Index('wiki_pages_project')
  @Index({ name: 'wiki_pages_project_slug', unique: true })
  @ForeignKey(() => Project)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare projectId: string

  @Column({
    type: DataType.STRING(160),
    allowNull: false
  })
  declare title: string

  @Index({ name: 'wiki_pages_project_slug', unique: true })
  @Column({
    type: DataType.STRING(160),
    allowNull: false
  })
  declare slug: string

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

  @Column({
    field: 'display_order',
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare displayOrder: number

  @ForeignKey(() => User)
  @Column({
    field: 'created_by',
    type: DataType.STRING(36),
    allowNull: false
  })
  declare createdBy: string

  @ForeignKey(() => User)
  @Column({
    field: 'updated_by',
    type: DataType.STRING(36),
    allowNull: false
  })
  declare updatedBy: string

  @BelongsTo(() => Project)
  declare project?: Project

  @BelongsTo(() => User, 'createdBy')
  declare createdByUser?: User

  @BelongsTo(() => User, 'updatedBy')
  declare updatedByUser?: User
}
