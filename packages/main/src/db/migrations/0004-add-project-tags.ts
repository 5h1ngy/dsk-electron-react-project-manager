import { DataTypes } from 'sequelize'
import type { QueryInterface } from 'sequelize'
import type { MigrationFn } from 'umzug'

export const name = '0004-add-project-tags'

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.createTable('project_tags', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'projects',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    tag: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  await queryInterface.addIndex('project_tags', ['projectId'])
  await queryInterface.addConstraint('project_tags', {
    fields: ['projectId', 'tag'],
    type: 'unique',
    name: 'uq_project_tags_project_tag'
  })
}

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('project_tags')
}
