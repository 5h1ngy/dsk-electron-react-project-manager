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

  @Column(DataType.INTEGER)
  declare userId: number;

  declare user: User;

  declare tasks: Task[];

  declare notes: Note[];

  declare tags: Tag[];
}