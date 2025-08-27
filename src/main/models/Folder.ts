import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull
} from 'sequelize-typescript';

import { BaseModel } from './BaseModel';
import type { Note } from './Note';
import type { File } from './File';

@Table({ tableName: 'Folders' })
export class Folder extends BaseModel<Folder> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @AllowNull(true)
  @ForeignKey(() => Folder)
  @Column(DataType.INTEGER)
  declare parentId: number | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @HasMany(() => Folder, { foreignKey: 'parentId', as: 'subfolders' })
  declare subfolders: Folder[];

  @BelongsTo(() => Folder, { foreignKey: 'parentId', as: 'parent' })
  declare parent: Folder;

  @HasMany(() => require('./File').File, { foreignKey: 'folderId', as: 'files' })
  declare files: File[];

  @HasMany(() => require('./Note').Note, { foreignKey: 'folderId', as: 'notes' })
  declare notes: Note[];
}