import {
  BelongsTo,
  Column,
  DataType,
  HasMany,
  Model,
  Table,
  ForeignKey
} from 'sequelize-typescript'
import { User } from './User'
import { ProjectMember } from './ProjectMember'
import { Task } from './Task'

@Table({
  tableName: 'projects',
  timestamps: true
})
export class Project extends Model {
  @Column({
    type: DataType.STRING(36),
    primaryKey: true
  })
  declare id: string

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    unique: true
  })
  declare key: string

  @Column({
    type: DataType.STRING(120),
    allowNull: false
  })
  declare name: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string | null

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(36),
    allowNull: false
  })
  declare createdBy: string

  @BelongsTo(() => User, 'createdBy')
  declare creator?: User

  @HasMany(() => ProjectMember)
  declare members?: ProjectMember[]

  @HasMany(() => Task)
  declare tasks?: Task[]
}
