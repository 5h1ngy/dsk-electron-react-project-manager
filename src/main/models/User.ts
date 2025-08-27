import { Table, Column, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, BeforeCreate, BeforeUpdate, } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import bcrypt from 'bcryptjs';

@Table({
  tableName: 'Users'
})
export class User extends BaseModel<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare password: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Method to check password
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  @BeforeCreate
  static hashPasswordBeforeCreate(instance: User): void {
    instance.password = bcrypt.hashSync(instance.password, 10);
  }

  @BeforeUpdate
  static hashPasswordBeforeUpdate(instance: User): void {
    if (instance.changed('password')) {
      instance.password = bcrypt.hashSync(instance.password, 10);
    }
  }
}
