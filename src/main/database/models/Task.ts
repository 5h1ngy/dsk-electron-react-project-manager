import { Sequelize, DataTypes, Model, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManySetAssociationsMixin, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin } from 'sequelize';
import { Tag } from './Tag';
import { Attachment } from './Attachment';

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
  
  // Association methods
  declare getTags: BelongsToManyGetAssociationsMixin<Tag>;
  declare addTag: BelongsToManyAddAssociationMixin<Tag, number>;
  declare addTags: BelongsToManyAddAssociationsMixin<Tag, number>;
  declare setTags: BelongsToManySetAssociationsMixin<Tag, number>;
  declare removeTag: BelongsToManyRemoveAssociationMixin<Tag, number>;
  declare removeTags: BelongsToManyRemoveAssociationsMixin<Tag, number>;
  declare hasTag: BelongsToManyHasAssociationMixin<Tag, number>;
  declare hasTags: BelongsToManyHasAssociationsMixin<Tag, number>;
  declare countTags: BelongsToManyCountAssociationsMixin;
  
  declare getAttachments: HasManyGetAssociationsMixin<Attachment>;
  declare addAttachment: HasManyAddAssociationMixin<Attachment, number>;
  declare addAttachments: HasManyAddAssociationsMixin<Attachment, number>;
  declare setAttachments: HasManySetAssociationsMixin<Attachment, number>;
  declare removeAttachment: HasManyRemoveAssociationMixin<Attachment, number>;
  declare removeAttachments: HasManyRemoveAssociationsMixin<Attachment, number>;
  declare hasAttachment: HasManyHasAssociationMixin<Attachment, number>;
  declare hasAttachments: HasManyHasAssociationsMixin<Attachment, number>;
  declare countAttachments: HasManyCountAssociationsMixin;
  
  // For backward compatibility with existing code
  $set: any;
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
