import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  BelongsToMany,
} from 'sequelize-typescript';

import { BaseModel } from './BaseModel';
import type { Project } from './Project';
import type { Task } from './Task';

@Table({ tableName: 'Tags' })
export class Tag extends BaseModel<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare name: string;

  @Column({
    type: DataType.STRING(7),
    allowNull: false,
    defaultValue: '#1890ff',
    validate: { is: /^#[0-9A-F]{6}$/i }
  })
  declare color: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BelongsToMany(() => require('./Project').Project, { through: () => require('./ProjectTag').ProjectTag, foreignKey: 'tagId', otherKey: 'projectId', as: 'projects' })
  declare projects: Project[];

  @BelongsToMany(() => require('./Task').Task, { through: () => require('./TaskTag').TaskTag, foreignKey: 'tagId', otherKey: 'taskId', as: 'tasks' })
  declare tasks: Task[];
}