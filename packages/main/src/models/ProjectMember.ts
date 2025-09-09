import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'
import { Project } from './Project'
import { User } from './User'

export type ProjectMembershipRole = 'view' | 'edit' | 'admin'

@Table({
  tableName: 'project_members',
  timestamps: false
})
export class ProjectMember extends Model {
  @ForeignKey(() => Project)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    primaryKey: true
  })
  declare projectId: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: false,
    primaryKey: true
  })
  declare userId: string

  @Column({
    type: DataType.STRING(16),
    allowNull: false,
    defaultValue: 'view'
  })
  declare role: ProjectMembershipRole

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  declare createdAt: Date

  @BelongsTo(() => Project)
  declare project?: Project

  @BelongsTo(() => User)
  declare user?: User
}
