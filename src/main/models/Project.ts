import { Table, Column, DataType, CreatedAt, UpdatedAt, PrimaryKey, AutoIncrement, ForeignKey, HasMany, BelongsToMany, BelongsTo } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Tag } from './Tag';
import { Task } from './Task';
import { User } from './User';
import { ProjectTag } from './ProjectTag';

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  declare userId: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  // Definizione delle relazioni con decoratori
  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => Task)
  declare tasks: Task[];

  @BelongsToMany(() => Tag, () => ProjectTag)
  declare tags: Tag[];
}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
