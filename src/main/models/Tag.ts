import { Table, Column, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  tableName: 'Tags'
})
export class Tag extends BaseModel<Tag> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true
  })
  declare name: string;

  @Column({
    type: DataType.STRING(7),
    allowNull: false,
    defaultValue: '#1890ff',
    validate: {
      is: /^#[0-9A-F]{6}$/i
    }
  })
  declare color: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
