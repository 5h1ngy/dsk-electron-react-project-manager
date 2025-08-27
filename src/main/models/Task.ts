import { Table, Column, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inProgress',
  DONE = 'done',
  BLOCKED = 'blocked',
  REVIEW = 'review'
}

@Table({
  tableName: 'Tasks'
})
export class Task extends BaseModel<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string;

  @Column({
    type: DataType.ENUM(...Object.values(TaskStatus)),
    allowNull: false,
    defaultValue: TaskStatus.TODO
  })
  declare status: TaskStatus;

  @Column({
    type: DataType.ENUM(...Object.values(TaskPriority)),
    allowNull: false,
    defaultValue: TaskPriority.MEDIUM
  })
  declare priority: TaskPriority;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare dueDate: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  declare estimationDate: Date | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0
  })
  declare position: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

}
