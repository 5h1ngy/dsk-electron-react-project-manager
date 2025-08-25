import { Sequelize, DataTypes, Model } from 'sequelize';

export class File extends Model {
  declare id: number;
  declare name: string;
  declare path: string;
  declare mimeType: string;
  declare size: number;
  declare userId: number;
  declare folderId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initFile = (sequelize: Sequelize) => {
  File.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      folderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Folders',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'File',
    }
  );

  return File;
};
