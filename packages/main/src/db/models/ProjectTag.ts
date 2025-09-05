import { Column, DataType, ForeignKey, Model, Table, BelongsTo } from 'sequelize-typescript'
import { Project } from './Project'

@Table({
  tableName: 'project_tags',
  timestamps: false
})
export class ProjectTag extends Model {
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
  declare tag: string

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: Date

  @BelongsTo(() => Project)
  declare project?: Project
}
