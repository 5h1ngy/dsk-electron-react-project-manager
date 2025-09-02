import { randomUUID } from 'node:crypto'
import { hash as argonHash } from '@node-rs/argon2'
import { DataTypes } from 'sequelize'
import type { MigrationFn } from 'umzug'
import type { QueryInterface } from 'sequelize'

export const name = '0002-create-auth-tables'

const ROLE_NAMES = ['Admin', 'Maintainer', 'Contributor', 'Viewer'] as const

const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'changeme!',
  displayName: 'Administrator'
}

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.createTable('roles', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    displayName: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  await queryInterface.createTable('user_roles', {
    userId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    roleId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  await queryInterface.addConstraint('user_roles', {
    fields: ['userId', 'roleId'],
    type: 'primary key',
    name: 'pk_user_roles'
  })

  await queryInterface.createTable('audit_logs', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    entity: {
      type: DataTypes.STRING(64),
      allowNull: false
    },
    entityId: {
      type: DataTypes.STRING(36),
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    action: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    diffJSON: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  const roleRows = ROLE_NAMES.map((roleName) => ({
    id: randomUUID(),
    name: roleName,
    createdAt: new Date(),
    updatedAt: new Date()
  }))

  await queryInterface.bulkInsert('roles', roleRows)

  const adminRole = roleRows.find((role) => role.name === 'Admin')
  if (!adminRole) {
    throw new Error('Admin role seed missing')
  }

  const adminId = randomUUID()
  const passwordHash = await argonHash(DEFAULT_ADMIN.password, {
    algorithm: 2,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1
  })

  await queryInterface.bulkInsert('users', [
    {
      id: adminId,
      username: DEFAULT_ADMIN.username,
      passwordHash,
      displayName: DEFAULT_ADMIN.displayName,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])

  await queryInterface.bulkInsert('user_roles', [
    {
      userId: adminId,
      roleId: adminRole.id,
      createdAt: new Date()
    }
  ])
}

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('audit_logs')
  await queryInterface.dropTable('user_roles')
  await queryInterface.dropTable('users')
  await queryInterface.dropTable('roles')
}
