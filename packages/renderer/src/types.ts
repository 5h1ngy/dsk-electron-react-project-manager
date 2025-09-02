export interface IpcSuccess<T> {
  ok: true
  data: T
}

export interface IpcError {
  ok: false
  code: string
  message: string
}

export type IpcResponse<T> = IpcSuccess<T> | IpcError
