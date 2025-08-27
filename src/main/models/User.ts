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
  HasMany,
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

  @HasMany(() => require('./Project').Project, { foreignKey: 'userId', as: 'projects' })
  declare projects: Project[];

  @HasMany(() => require('./Note').Note, { foreignKey: 'userId', as: 'notes' })
  declare notes: Note[];

  @HasMany(() => require('./Folder').Folder, { foreignKey: 'userId', as: 'folders' })
  declare folders: Folder[];

  @HasMany(() => require('./File').File, { foreignKey: 'userId', as: 'files' })
  declare files: File[];
}