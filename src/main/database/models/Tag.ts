import { Sequelize, DataTypes, Model } from 'sequelize';

export class Tag extends Model {
  declare id: number;
  declare name: string;
  declare color: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export const initTag = (sequelize: Sequelize) => {
  Tag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      color: {
        type: DataTypes.STRING(7), // Hex color code
        allowNull: false,
        defaultValue: '#1890ff', // Default Ant Design primary color
        validate: {
          is: /^#[0-9A-F]{6}$/i, // Validate that it's a hex color code
        },
      },
    },
    {
      sequelize,
      modelName: 'Tag',
    }
  );

  return Tag;
};
