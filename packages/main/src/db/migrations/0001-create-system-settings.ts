import { DataTypes } from 'sequelize'
import type { MigrationFn } from 'umzug'
import type { QueryInterface } from 'sequelize'

export const name = '0001-create-system-settings'

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.createTable('system_settings', {
    key: {
      type: DataTypes.STRING(128),
      primaryKey: true,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })
}

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('system_settings')
}
