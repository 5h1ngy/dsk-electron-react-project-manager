import { Sequelize, DataTypes, Model } from 'sequelize';

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

export class Task extends Model {
  declare id: number;
  declare title: string;
  declare description: string;
  declare status: TaskStatus;
  declare priority: TaskPriority;
  declare dueDate: Date | null;
  declare estimationDate: Date | null;
  declare projectId: number;
  declare position: number; // For ordering within status columns
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initTask = (sequelize: Sequelize) => {
  Task.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TaskStatus)),
        allowNull: false,
        defaultValue: TaskStatus.TODO,
      },
      priority: {
        type: DataTypes.ENUM(...Object.values(TaskPriority)),
        allowNull: false,
        defaultValue: TaskPriority.MEDIUM,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      estimationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id',
        },
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'Task',
    }
  );

  return Task;
};
