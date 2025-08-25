import { Sequelize, DataTypes, Model, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import { Tag } from './Tag';

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
  
  // Per retrocompatibilità con il codice esistente
  $set: any;
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
