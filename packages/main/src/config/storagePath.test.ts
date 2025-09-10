import { join } from 'node:path'

import { StoragePathResolver } from '@main/config/storagePath'

describe('StoragePathResolver', () => {
  it('honours explicit override paths', () => {
    const resolver = new StoragePathResolver({ appIdentifier: 'TestApp' })
    const override = 'C:\\tmp\\custom.sqlite'

    expect(resolver.resolve({ overridePath: override })).toBe(override)
  })

  it('computes Windows roaming path when APPDATA is present', () => {
    const resolver = new StoragePathResolver({
      appIdentifier: 'TestApp',
      platform: 'win32',
      environment: { APPDATA: 'C:\\Users\\demo\\AppData\\Roaming' } as NodeJS.ProcessEnv,
      homeDirectoryProvider: () => 'C:\\Users\\demo'
    })

    const result = resolver.resolve()
    expect(result).toBe(
      join('C:\\Users\\demo\\AppData\\Roaming', 'TestApp', 'storage', 'app.sqlite')
    )
  })

  it('falls back to ~/.config on linux-like platforms', () => {
    const resolver = new StoragePathResolver({
      appIdentifier: 'TestApp',
      platform: 'linux',
      environment: {} as NodeJS.ProcessEnv,
      homeDirectoryProvider: () => '/home/demo'
    })

    expect(resolver.resolve()).toBe(join('/home/demo/.config', 'TestApp', 'storage', 'app.sqlite'))
  })
})

