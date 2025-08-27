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
  AllowNull
} from 'sequelize-typescript';

import { BaseModel } from './BaseModel';
import type { User } from './User';
import type { Project } from './Project';
import type { Task } from './Task';
import type { Folder } from './Folder';

@Table({ tableName: 'Notes' })
export class Note extends BaseModel<Note> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(true)
  @ForeignKey(() => require('./Task').Task)
  @Column(DataType.INTEGER)
  declare taskId: number | null;

  @AllowNull(true)
  @ForeignKey(() => require('./Project').Project)
  @Column(DataType.INTEGER)
  declare projectId: number | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare title: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare content: string | null;

  @AllowNull(true)
  @ForeignKey(() => require('./Folder').Folder)
  @Column(DataType.INTEGER)
  declare folderId: number | null;

  @AllowNull(true)
  @ForeignKey(() => require('./User').User)
  @Column(DataType.INTEGER)
  declare userId: number | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsTo(() => require('./Task').Task, { foreignKey: 'taskId', as: 'task' })
  declare task: Task;

  @BelongsTo(() => require('./Project').Project, { foreignKey: 'projectId', as: 'project' })
  declare project: Project;

  @BelongsTo(() => require('./Folder').Folder, { foreignKey: 'folderId', as: 'folder' })
  declare folder: Folder;

  @BelongsTo(() => require('./User').User, { foreignKey: 'userId', as: 'user' })
  declare user: User;
}