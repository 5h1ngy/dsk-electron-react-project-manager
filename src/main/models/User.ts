import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';

import { BaseModel } from './BaseModel';
import type { Project } from './Project';
import type { Note } from './Note';
import type { Folder } from './Folder';
import type { File } from './File';

type UserAttributes = {
  id?: number;
  username: string;
  email: string;
  password: string
};

@Table({ tableName: 'Users' })
export class User extends BaseModel<User> implements UserAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare username: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true, validate: { isEmail: true } })
  declare email: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare password: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BeforeCreate
  static hashPasswordBeforeCreate(instance: User) {
    instance.password = bcrypt.hashSync(instance.password, 10);
  }

  @BeforeUpdate
  static hashPasswordBeforeUpdate(instance: User) {
    if (instance.changed('password')) {
      instance.password = bcrypt.hashSync(instance.password, 10);
    }
  }

  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  declare projects: Project[];

  declare notes: Note[];

  declare folders: Folder[];

  declare files: File[];
}