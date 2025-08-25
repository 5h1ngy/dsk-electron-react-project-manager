import { Sequelize, DataTypes, Model } from 'sequelize';

export class Folder extends Model {
  declare id: number;
  declare name: string;
  declare userId: number;
  declare parentId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initFolder = (sequelize: Sequelize) => {
  Folder.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      parentId: {
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
      modelName: 'Folder',
    }
  );

  return Folder;
};
