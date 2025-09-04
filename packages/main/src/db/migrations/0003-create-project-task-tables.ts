import { DataTypes } from 'sequelize'
import type { QueryInterface } from 'sequelize'
import type { MigrationFn } from 'umzug'

export const name = '0003-create-project-task-tables'

const TASK_FTS_TABLE = `
  CREATE VIRTUAL TABLE tasks_fts USING fts5(
    taskId UNINDEXED,
    title,
    description
  );
`

const TASK_FTS_INSERT_TRIGGER = `
  CREATE TRIGGER tasks_ai AFTER INSERT ON tasks BEGIN
    INSERT INTO tasks_fts(taskId, title, description)
    VALUES (new.id, new.title, coalesce(new.description, ''));
  END;
`

const TASK_FTS_UPDATE_TRIGGER = `
  CREATE TRIGGER tasks_au AFTER UPDATE ON tasks BEGIN
    DELETE FROM tasks_fts WHERE taskId = old.id;
    INSERT INTO tasks_fts(taskId, title, description)
    SELECT new.id, new.title, coalesce(new.description, '')
    WHERE new.deletedAt IS NULL;
  END;
`

const TASK_FTS_DELETE_TRIGGER = `
  CREATE TRIGGER tasks_ad AFTER DELETE ON tasks BEGIN
    DELETE FROM tasks_fts WHERE taskId = old.id;
  END;
`

export const up: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.createTable('projects', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
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

  await queryInterface.createTable('project_members', {
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
    role: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'view'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  })

  await queryInterface.addConstraint('project_members', {
    fields: ['projectId', 'userId'],
    type: 'primary key',
    name: 'pk_project_members'
  })

  await queryInterface.createTable('tasks', {
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
    key: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    parentId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(24),
      allowNull: false,
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.STRING(16),
      allowNull: false,
      defaultValue: 'medium'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    assigneeId: {
      type: DataTypes.STRING(36),
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    },
    ownerUserId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
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
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  })

  await queryInterface.addConstraint('tasks', {
    fields: ['projectId', 'key'],
    type: 'unique',
    name: 'uq_tasks_project_key'
  })

  await queryInterface.addIndex('tasks', ['projectId'])
  await queryInterface.addIndex('tasks', ['assigneeId'])
  await queryInterface.addIndex('tasks', ['dueDate'])

  await queryInterface.createTable('comments', {
    id: {
      type: DataTypes.STRING(36),
      allowNull: false,
      primaryKey: true
    },
    taskId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    authorId: {
      type: DataTypes.STRING(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
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

  await queryInterface.sequelize.query(TASK_FTS_TABLE)
  await queryInterface.sequelize.query(TASK_FTS_INSERT_TRIGGER)
  await queryInterface.sequelize.query(TASK_FTS_UPDATE_TRIGGER)
  await queryInterface.sequelize.query(TASK_FTS_DELETE_TRIGGER)
}

export const down: MigrationFn<QueryInterface> = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS tasks_ad;')
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS tasks_au;')
  await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS tasks_ai;')
  await queryInterface.sequelize.query('DROP TABLE IF EXISTS tasks_fts;')

  await queryInterface.dropTable('comments')
  await queryInterface.dropTable('tasks')
  await queryInterface.dropTable('project_members')
  await queryInterface.dropTable('projects')
}
