import {
  Table,
  Model,
} from 'sequelize-typescript';

@Table({ tableName: 'TaskTags', timestamps: false })
export class TaskTag extends Model<TaskTag> { }
