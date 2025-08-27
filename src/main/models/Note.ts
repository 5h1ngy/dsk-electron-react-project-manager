import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
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
  @Column(DataType.INTEGER)
  declare taskId: number | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare projectId: number | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare title: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare content: string | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare folderId: number | null;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare userId: number | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  declare task: Task;

  declare project: Project;

  declare folder: Folder;

  declare user: User;
}