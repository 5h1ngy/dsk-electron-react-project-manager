import { Table, Column, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  tableName: 'Files'
})
export class File extends BaseModel<File> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare path: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare mimeType: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare size: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
