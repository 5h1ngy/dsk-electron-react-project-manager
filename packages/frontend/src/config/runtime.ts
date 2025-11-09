import type { RuntimeTarget } from '@services/config/env.types'

const normalizeRuntimeTarget = (value?: string): RuntimeTarget => {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'desktop') {
    return 'desktop'
  }
  return 'webapp'
}

const resolveRuntimeTarget = (): RuntimeTarget => {
  const fromImportMeta =
    typeof import.meta !== 'undefined'
      ? ((import.meta.env?.VITE_APP_RUNTIME as string | undefined) ?? undefined)
      : undefined

  const fromProcess =
    typeof process !== 'undefined'
      ? process.env?.VITE_APP_RUNTIME ?? process.env?.APP_RUNTIME
      : undefined

  return normalizeRuntimeTarget(fromImportMeta ?? fromProcess)
}

const target = resolveRuntimeTarget()

export const runtime = Object.freeze({
  target,
  isDesktop: target === 'desktop',
  isWebapp: target === 'webapp'
})

export type { RuntimeTarget }
