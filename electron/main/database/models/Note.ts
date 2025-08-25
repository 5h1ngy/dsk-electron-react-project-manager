import { Sequelize, DataTypes, Model } from 'sequelize';

export class Note extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare userId: number;
  declare folderId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initNote = (sequelize: Sequelize) => {
  Note.init(
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
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: 'Note',
    }
  );

  return Note;
};
