import { Table, Column, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import type { Task } from './Task';

@Table({
  tableName: 'Notes'
})
export class Note extends BaseModel<Note> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare taskId: number | null;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare title: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare content: string | null;
  
  @CreatedAt
  declare createdAt: Date;
  
  @UpdatedAt
  declare updatedAt: Date;

  @ForeignKey(() => require('./Task').Task as typeof Task)
  @BelongsTo(() => require('./Task').Task as typeof Task)
  declare task: Task;

}
