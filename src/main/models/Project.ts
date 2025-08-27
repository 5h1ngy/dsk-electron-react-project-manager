import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
  BelongsToMany,
  AllowNull
} from 'sequelize-typescript';

import { BaseModel } from './BaseModel';
import type { User } from './User';
import type { Tag } from './Tag';
import type { Task } from './Task';
import type { Note } from './Note';

@Table({ tableName: 'Projects' })
export class Project extends BaseModel<Project> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @ForeignKey(() => require('./User').User)
  @Column(DataType.INTEGER)
  declare userId: number;

  @BelongsTo(() => require('./User').User, { foreignKey: 'userId', as: 'user' })
  declare user: User;

  @HasMany(() => require('./Task').Task, { foreignKey: 'projectId', as: 'tasks' })
  declare tasks: Task[];

  @HasMany(() => require('./Note').Note, { foreignKey: 'projectId', as: 'notes' })
  declare notes: Note[];

  @BelongsToMany(() => require('./Tag').Tag, { through: () => require('./ProjectTag').ProjectTag, foreignKey: 'projectId', otherKey: 'tagId', as: 'tags' })
  declare tags: Tag[];
}