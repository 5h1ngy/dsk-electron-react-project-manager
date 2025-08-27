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
} from 'sequelize-typescript';

import { BaseModel } from './BaseModel';
import type { User } from './User';
import type { Folder } from './Folder';

@Table({ tableName: 'Files' })
export class File extends BaseModel<File> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare path: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare size: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @ForeignKey(() => require('./Folder').Folder)
  @Column(DataType.INTEGER)
  declare folderId: number;

  @BelongsTo(() => require('./Folder').Folder, { foreignKey: 'folderId', as: 'folder' })
  declare folder: Folder;

  @ForeignKey(() => require('./User').User)
  @Column(DataType.INTEGER)
  declare userId: number;

  @BelongsTo(() => require('./User').User, { foreignKey: 'userId', as: 'user' })
  declare user: User;
}