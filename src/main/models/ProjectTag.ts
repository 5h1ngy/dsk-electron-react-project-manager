import { Table, Column, Model, DataType, ForeignKey, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Project } from './Project';
import { Tag } from './Tag';

/**
 * Join table for many-to-many relationship between Project and Tag models
 */
@Table({
  tableName: 'project_tags',
  timestamps: true
})
export class ProjectTag extends Model<ProjectTag> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE'
  })
  declare projectId: number;

  @ForeignKey(() => Tag)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE'
  })
  declare tagId: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
