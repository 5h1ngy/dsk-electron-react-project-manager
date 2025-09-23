import { ipcRenderer } from 'electron'
import { taskStatusApi } from '@preload/api/taskStatus'

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}))

const invokeMock = ipcRenderer.invoke as jest.Mock

describe('taskStatus preload api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('invokes create channel with payload', async () => {
    const response = {
      ok: true,
      data: { id: 'status-1', projectId: 'proj-1', key: 'todo', label: 'To Do', position: 1 }
    }
    invokeMock.mockResolvedValue(response)

    const payload = { projectId: 'proj-1', label: 'To Do' }
    const result = await taskStatusApi.create('token', payload as any)

    expect(invokeMock).toHaveBeenCalledWith('taskStatus:create', 'token', payload)
    expect(result).toEqual(response)
  })

  it('throws on invalid response payload', async () => {
    invokeMock.mockResolvedValue({ wrong: true })
    await expect(
      taskStatusApi.list('token', { projectId: 'proj-1' } as any)
    ).rejects.toThrow('ERR_INVALID_IPC_RESPONSE:taskStatus:list')
  })
})
