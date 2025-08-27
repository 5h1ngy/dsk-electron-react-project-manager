import { Table, Column, DataType, ForeignKey, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';

@Table({
  tableName: 'Folders'
})
export class Folder extends BaseModel<Folder> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;
  
  @ForeignKey(() => Folder)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare parentId: number | null;
  
  @CreatedAt
  declare createdAt: Date;
  
  @UpdatedAt
  declare updatedAt: Date;

}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
