import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table
} from 'sequelize-typescript'

import { Project } from '@services/models/Project'
import { User } from '@services/models/User'
import { NoteTag } from '@services/models/NoteTag'
import { Task } from '@services/models/Task'
import { NoteTaskLink } from '@services/models/NoteTaskLink'

@Table({
  tableName: 'notes',
  timestamps: true
})
export class Note extends Model {
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
    type: DataType.STRING(160),
    allowNull: false
  })
  declare title: string

  @Column({
    field: 'body_md',
    type: DataType.TEXT,
    allowNull: false
  })
  declare bodyMd: string

  @ForeignKey(() => User)
  @Column({
    field: 'owner_user_id',
    type: DataType.STRING(36),
    allowNull: false
  })
  declare ownerUserId: string

  @Column({
    field: 'is_private',
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  declare isPrivate: boolean

  @Column({
    type: DataType.STRING(80),
    allowNull: true
  })
  declare notebook: string | null

  @BelongsTo(() => Project)
  declare project?: Project

  @BelongsTo(() => User, 'ownerUserId')
  declare owner?: User

  @HasMany(() => NoteTag)
  declare tags?: NoteTag[]

  @BelongsToMany(() => Task, () => NoteTaskLink)
  declare tasks?: Task[]
}
