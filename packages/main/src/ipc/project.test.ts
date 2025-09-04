const handlers = new Map<string, (...args: any[]) => Promise<unknown>>()

jest.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: (...args: any[]) => Promise<unknown>) => {
      handlers.set(channel, handler)
    },
    listenerCount: () => 0,
    removeHandler: () => {}
  }
}))

const resolveActorMock = jest.fn()
const listProjectsMock = jest.fn()
const getProjectMock = jest.fn()
const createProjectMock = jest.fn()
const updateProjectMock = jest.fn()
const deleteProjectMock = jest.fn()
const addMemberMock = jest.fn()
const removeMemberMock = jest.fn()

jest.mock('../appContext', () => ({
  appContext: {
    authService: {
      resolveActor: resolveActorMock
    },
    projectService: {
      listProjects: listProjectsMock,
      getProject: getProjectMock,
      createProject: createProjectMock,
      updateProject: updateProjectMock,
      deleteProject: deleteProjectMock,
      addOrUpdateMember: addMemberMock,
      removeMember: removeMemberMock
    }
  }
}))

import { registerProjectIpc } from './project'

const actor = { userId: 'user-1', roles: ['Admin'] as const }

describe('project ipc handlers', () => {
  beforeEach(() => {
    handlers.clear()
    resolveActorMock.mockReset()
    resolveActorMock.mockResolvedValue(actor)
    listProjectsMock.mockReset()
    getProjectMock.mockReset()
    createProjectMock.mockReset()
    updateProjectMock.mockReset()
    deleteProjectMock.mockReset()
    addMemberMock.mockReset()
    removeMemberMock.mockReset()
  })

  it('handles project commands with authenticated actor', async () => {
    listProjectsMock.mockResolvedValue([])
    getProjectMock.mockResolvedValue({ id: 'p1' })
    createProjectMock.mockResolvedValue({ id: 'p1' })
    updateProjectMock.mockResolvedValue({ id: 'p1' })
    deleteProjectMock.mockResolvedValue(undefined)
    addMemberMock.mockResolvedValue({ id: 'p1' })
    removeMemberMock.mockResolvedValue({ id: 'p1' })

    registerProjectIpc()

    const listResponse = await handlers.get('project:list')!(undefined, 'token')
    expect(listResponse).toEqual({ ok: true, data: [] })
    expect(resolveActorMock).toHaveBeenCalledWith('token', { touch: true })

    const getResponse = await handlers.get('project:get')!(undefined, 'token', 'proj')
    expect(getResponse).toEqual({ ok: true, data: { id: 'p1' } })

    await handlers.get('project:delete')!(undefined, 'token', 'proj')
    expect(deleteProjectMock).toHaveBeenCalledWith(actor, 'proj')
  })

  it('returns error payload on failure', async () => {
    listProjectsMock.mockRejectedValue(new Error('boom'))
    registerProjectIpc()

    const result = await handlers.get('project:list')!(undefined, 'token')
    expect(result).toEqual({ ok: false, code: 'ERR_INTERNAL', message: 'boom' })
  })
})
