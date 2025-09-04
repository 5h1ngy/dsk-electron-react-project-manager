import { ipcRenderer } from 'electron'
import { taskApi } from './task'

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}))

const invokeMock = ipcRenderer.invoke as jest.Mock

describe('task preload api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('invokes create channel with payload', async () => {
    const response = {
      ok: true,
      data: { id: 'task-1', projectId: 'proj-1', key: 'PROJ-1' }
    }
    invokeMock.mockResolvedValue(response)

    const payload = { projectId: 'proj-1', title: 'Test task' }
    const result = await taskApi.create('token', payload as any)

    expect(invokeMock).toHaveBeenCalledWith('task:create', 'token', payload)
    expect(result).toEqual(response)
  })

  it('throws on invalid response payload', async () => {
    invokeMock.mockResolvedValue({ wrong: true })
    await expect(taskApi.list('token', 'proj')).rejects.toThrow(
      'ERR_INVALID_IPC_RESPONSE:task:list'
    )
  })
})
