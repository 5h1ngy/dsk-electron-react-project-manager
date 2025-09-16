import { ipcRenderer } from 'electron'
import { noteApi } from '@preload/api/note'

jest.mock('electron', () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}))

const invokeMock = ipcRenderer.invoke as jest.Mock

describe('note preload api', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('delegates creation to IPC channel', async () => {
    const response = {
      ok: true,
      data: { id: 'note-1', projectId: 'proj-1', title: 'Nota' }
    }
    invokeMock.mockResolvedValue(response)

    const payload = { projectId: 'proj-1', title: 'Nota', body: 'Contenuto' }
    const result = await noteApi.create('token', payload as any)

    expect(invokeMock).toHaveBeenCalledWith('note:create', 'token', payload)
    expect(result).toEqual(response)
  })

  it('propaga errore per risposta non valida', async () => {
    invokeMock.mockResolvedValue({ wrong: true })
    await expect(
      noteApi.list('token', { projectId: 'proj-1' } as any)
    ).rejects.toThrow('ERR_INVALID_IPC_RESPONSE:note:list')
  })
})
