import { Table, Column, Model, DataType, PrimaryKey, AutoIncrement, CreatedAt, UpdatedAt } from 'sequelize-typescript';

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

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

// Non necessario più l'inizializzazione manuale perché gestita da sequelize-typescript
