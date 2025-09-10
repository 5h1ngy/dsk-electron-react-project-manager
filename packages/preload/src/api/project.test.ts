import { ipcRenderer } from 'electron'
import { projectApi } from '@preload/api/project'

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}))

const invokeMock = ipcRenderer.invoke as jest.Mock

describe('project preload api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('invokes list channel with token', async () => {
    const response = { ok: true, data: [] }
    invokeMock.mockResolvedValue(response)

    const result = await projectApi.list('token-123')

    expect(invokeMock).toHaveBeenCalledWith('project:list', 'token-123')
    expect(result).toEqual(response)
  })

  it('throws on invalid response payload', async () => {
    invokeMock.mockResolvedValue({ bogus: true })
    await expect(projectApi.get('token', 'proj')).rejects.toThrow(
      'ERR_INVALID_IPC_RESPONSE:project:get'
    )
  })
})
