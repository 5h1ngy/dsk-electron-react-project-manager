import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
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

  @Column(DataType.INTEGER)
  declare folderId: number;

  declare folder: Folder;

  @Column(DataType.INTEGER)
  declare userId: number;

  declare user: User;
}