import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdtemp, rm } from 'node:fs/promises'
import { QueryTypes } from 'sequelize'
import { initializeDatabase } from '../../db/database'
import { Project } from './Project'
import { User } from './User'
import { Task } from './Task'

const setupDatabase = async () => {
  const directory = await mkdtemp(join(tmpdir(), 'dsk-task-db-'))
  const storagePath = join(directory, 'data.sqlite')
  const sequelize = await initializeDatabase({
    resolveStoragePath: () => storagePath,
    logging: false
  })
  return { sequelize, directory }
}

describe('Task FTS triggers', () => {
  it('keeps tasks_fts table in sync with task lifecycle', async () => {
    const { sequelize, directory } = await setupDatabase()

    try {
      const admin = await User.findOne({ where: { username: 'admin' } })
      if (!admin) {
        throw new Error('Admin user not found after migration')
      }

      const project = await Project.create({
        id: 'proj-1',
        key: 'PROJ',
        name: 'Test project',
        description: null,
        createdBy: admin.id
      })

      const task = await Task.create({
        id: 'task-1',
        projectId: project.id,
        key: '1',
        parentId: null,
        title: 'Initial title',
        description: 'Initial description',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        assigneeId: null,
        ownerUserId: admin.id
      })

      const search = async (term: string) => {
        const expression = `"${term.replace(/"/g, '""')}"`
        try {
          return await sequelize.query<{ taskId: string }>(
            'SELECT taskId FROM tasks_fts WHERE tasks_fts MATCH ?',
            {
              replacements: [expression],
              type: QueryTypes.SELECT
            }
          )
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('FTS query failed', error)
          throw error
        }
      }

      let matches = await search('Initial')
      expect(matches).toEqual(expect.arrayContaining([{ taskId: task.id }]))

      await task.update({ title: 'Updated title' })
      matches = await search('Updated')
      expect(matches).toEqual(expect.arrayContaining([{ taskId: task.id }]))

      await task.destroy()
      matches = await search(task.id)
      expect(matches).toHaveLength(0)
    } finally {
      await sequelize.close()
      await rm(directory, { recursive: true, force: true })
    }
  })
})
