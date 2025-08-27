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
import type { Project } from './Project';
import type { Tag } from './Tag';
import type { Attachment } from './Attachment';
import type { Note } from './Note';

enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inProgress',
  DONE = 'done',
  BLOCKED = 'blocked',
  REVIEW = 'review'
}

@Table({ tableName: 'Tasks' })
export class Task extends BaseModel<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare description: string | null;

  @Column({ type: DataType.ENUM(...Object.values(TaskStatus)), allowNull: false, defaultValue: TaskStatus.TODO })
  declare status: TaskStatus;

  @Column({ type: DataType.ENUM(...Object.values(TaskPriority)), allowNull: false, defaultValue: TaskPriority.MEDIUM })
  declare priority: TaskPriority;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare dueDate: Date | null;

  @AllowNull(true)
  @Column(DataType.DATE)
  declare estimationDate: Date | null;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare position: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @Column(DataType.INTEGER)
  declare projectId: number;

  declare project: Project;

  declare attachments: Attachment[];

  declare notes: Note[];

  declare tags: Tag[];
}