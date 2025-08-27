import { Table, Column, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  tableName: 'Projects'
})
export class Project extends BaseModel<Project> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  declare description: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
