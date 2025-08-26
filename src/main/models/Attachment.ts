import { Table, Column, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Task } from './Task';

@Table({
  tableName: 'Attachments'
})
export class Attachment extends BaseModel<Attachment> {
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
    type: DataType.STRING,
    allowNull: false
  })
  declare path: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  declare mimeType: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false
  })
  declare size: number;

  @ForeignKey(() => Task)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare taskId: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Relazioni
  @BelongsTo(() => Task)
  declare task: Task;
}
