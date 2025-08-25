import { Sequelize, DataTypes, Model } from 'sequelize';

export class Attachment extends Model {
  declare id: number;
  declare name: string;
  declare path: string;
  declare mimeType: string;
  declare size: number;
  declare taskId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initAttachment = (sequelize: Sequelize) => {
  Attachment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      taskId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Tasks',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Attachment',
    }
  );

  return Attachment;
};
