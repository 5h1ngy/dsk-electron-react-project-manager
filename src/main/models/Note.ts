import { Table, Column, DataType, ForeignKey, BelongsTo, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt, AllowNull } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { User } from './User';
import { Folder } from './Folder';
import { Task } from './Task';
import { Project } from './Project';

@Table({
  tableName: 'Notes'
})
export class Note extends BaseModel<Note> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare title: string | null;

  @AllowNull(true)
  @Column(DataType.TEXT)
  declare content: string | null;
  
  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare userId: number;

  @ForeignKey(() => Project)
  @AllowNull(true)
  @Column(DataType.INTEGER)
  declare projectId: number | null;
  
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
  
  @BelongsTo(() => Task)
  declare task: Task;

  @BelongsTo(() => Project)
  declare project: Project;
}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
