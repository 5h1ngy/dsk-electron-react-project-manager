import { Table, Column, DataType, ForeignKey, BelongsTo, BelongsToMany, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { Folder } from './Folder';
import { Tag } from './Tag';
import { Task } from './Task';

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
  
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare userId: number;
  
  @ForeignKey(() => Folder)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare folderId: number | null;
  
  @ForeignKey(() => Task)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare taskId: number | null;
  
  @CreatedAt
  declare createdAt: Date;
  
  @UpdatedAt
  declare updatedAt: Date;
  
  // Relazioni
  @BelongsTo(() => User)
  declare user: User;
  
  @BelongsTo(() => Folder)
  declare folder: Folder;
  
  @BelongsToMany(() => Tag, 'FileTags')
  declare tags: Tag[];
  
  @BelongsTo(() => Task)
  declare task: Task;
}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
