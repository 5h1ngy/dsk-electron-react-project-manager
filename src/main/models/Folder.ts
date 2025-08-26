import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany, BelongsToMany, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { Tag } from './Tag';
import { File } from './File';
import { Task } from './Task';

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
  
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare userId: number;
  
  @ForeignKey(() => Folder)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare parentId: number | null;
  
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
  
  @BelongsTo(() => Folder, 'parentId')
  declare parent: Folder;
  
  @HasMany(() => Folder, 'parentId')
  declare subfolders: Folder[];
  
  @HasMany(() => File)
  declare files: File[];
  
  @BelongsToMany(() => Tag, 'FolderTags')
  declare tags: Tag[];
  
  @BelongsTo(() => Task)
  declare task: Task;
}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
