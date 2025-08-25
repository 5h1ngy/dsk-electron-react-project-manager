import { Sequelize, DataTypes, Model } from 'sequelize';

export class Project extends Model {
  declare id: number;
  declare name: string;
  declare description: string;
  declare userId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initProject = (sequelize: Sequelize) => {
  Project.init(
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
      description: {
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
    },
    {
      sequelize,
      modelName: 'Project',
    }
  );

  return Project;
};
