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
import { Project } from '@main/models/Project'
import { Task } from '@main/models/Task'

export type SprintStatus = 'planned' | 'active' | 'completed' | 'archived'

@DefaultScope(() => ({
  where: { deletedAt: null },
  order: [['startDate', 'ASC']]
}))
@Table({
  tableName: 'sprints',
  timestamps: true,
  paranoid: true
})
export class Sprint extends Model {
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
    type: DataType.STRING(120),
    allowNull: false
  })
  declare name: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare goal: string | null

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  declare startDate: string

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  declare endDate: string

  @Column({
    type: DataType.STRING(24),
    allowNull: false,
    defaultValue: 'planned'
  })
  declare status: SprintStatus

  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  declare capacityMinutes: number | null

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare sequence: number

  @BelongsTo(() => Project)
  declare project?: Project

  @HasMany(() => Task)
  declare tasks?: Task[]
}
