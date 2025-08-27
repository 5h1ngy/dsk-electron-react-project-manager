import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
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
  @Column(DataType.INTEGER)
  declare parentId: number | null;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  declare subfolders: Folder[];

  declare parent: Folder;

  declare files: File[];

  declare notes: Note[];
}