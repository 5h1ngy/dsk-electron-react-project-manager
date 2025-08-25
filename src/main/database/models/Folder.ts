import { Sequelize, DataTypes, Model, BelongsToManyAddAssociationMixin, BelongsToManyAddAssociationsMixin, BelongsToManyRemoveAssociationMixin, BelongsToManyRemoveAssociationsMixin, BelongsToManyHasAssociationMixin, BelongsToManyHasAssociationsMixin, BelongsToManyGetAssociationsMixin, BelongsToManyCountAssociationsMixin, BelongsToManySetAssociationsMixin, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyAddAssociationsMixin, HasManySetAssociationsMixin, HasManyRemoveAssociationMixin, HasManyRemoveAssociationsMixin, HasManyHasAssociationMixin, HasManyHasAssociationsMixin, HasManyCountAssociationsMixin } from 'sequelize';
import { Tag } from './Tag';
import { File } from './File';
import { Folder as FolderModel } from './Folder';

export class Folder extends Model {
  declare id: number;
  declare name: string;
  declare userId: number;
  declare parentId: number | null;
  declare createdAt: Date;
  declare updatedAt: Date;
  
  // Association methods for Tags (many-to-many)
  declare getTags: BelongsToManyGetAssociationsMixin<Tag>;
  declare addTag: BelongsToManyAddAssociationMixin<Tag, number>;
  declare addTags: BelongsToManyAddAssociationsMixin<Tag, number>;
  declare setTags: BelongsToManySetAssociationsMixin<Tag, number>;
  declare removeTag: BelongsToManyRemoveAssociationMixin<Tag, number>;
  declare removeTags: BelongsToManyRemoveAssociationsMixin<Tag, number>;
  declare hasTag: BelongsToManyHasAssociationMixin<Tag, number>;
  declare hasTags: BelongsToManyHasAssociationsMixin<Tag, number>;
  declare countTags: BelongsToManyCountAssociationsMixin;
  
  // Association methods for Files (one-to-many)
  declare getFiles: HasManyGetAssociationsMixin<File>;
  declare addFile: HasManyAddAssociationMixin<File, number>;
  declare addFiles: HasManyAddAssociationsMixin<File, number>;
  declare setFiles: HasManySetAssociationsMixin<File, number>;
  declare removeFile: HasManyRemoveAssociationMixin<File, number>;
  declare removeFiles: HasManyRemoveAssociationsMixin<File, number>;
  declare hasFile: HasManyHasAssociationMixin<File, number>;
  declare hasFiles: HasManyHasAssociationsMixin<File, number>;
  declare countFiles: HasManyCountAssociationsMixin;
  
  // Association methods for Subfolders (one-to-many)
  declare getSubfolders: HasManyGetAssociationsMixin<FolderModel>;
  declare addSubfolder: HasManyAddAssociationMixin<FolderModel, number>;
  declare addSubfolders: HasManyAddAssociationsMixin<FolderModel, number>;
  declare setSubfolders: HasManySetAssociationsMixin<FolderModel, number>;
  declare removeSubfolder: HasManyRemoveAssociationMixin<FolderModel, number>;
  declare removeSubfolders: HasManyRemoveAssociationsMixin<FolderModel, number>;
  declare hasSubfolder: HasManyHasAssociationMixin<FolderModel, number>;
  declare hasSubfolders: HasManyHasAssociationsMixin<FolderModel, number>;
  declare countSubfolders: HasManyCountAssociationsMixin;
  
  // Per retrocompatibilità con il codice esistente
  $set: any;
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
