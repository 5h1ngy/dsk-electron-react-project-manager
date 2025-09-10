import { app, session, type Session, type WebContents } from 'electron'
import { URL } from 'node:url'

const OFFLINE_PROTOCOLS = new Set(['file:', 'data:', 'devtools:', 'about:'])

const isLocalhostUrl = (url: URL): boolean =>
  url.hostname === 'localhost' || url.hostname === '127.0.0.1'

export const buildContentSecurityPolicy = (allowDevInlineScripts: boolean): string => {
  const scriptSources = ["'self'"]
  if (allowDevInlineScripts) {
    scriptSources.push("'unsafe-inline'")
  }

  const connectSources = ["'self'"]
  if (allowDevInlineScripts) {
    connectSources.push('ws://127.0.0.1:*', 'ws://localhost:*')
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSources.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connectSources.join(' ')}`,
    "frame-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'"
  ].join('; ')
}

const registerContentSecurityPolicy = (
  targetSession: Session,
  allowDevInlineScripts: boolean
): void => {
  const csp = buildContentSecurityPolicy(allowDevInlineScripts)

  targetSession.webRequest.onHeadersReceived((details, callback) => {
    const responseHeaders = details.responseHeaders ?? {}
    responseHeaders['Content-Security-Policy'] = [csp]
    callback({ responseHeaders })
  })
}

export const shouldAllowRequest = (url: URL, isPackaged: boolean): boolean => {
  if (OFFLINE_PROTOCOLS.has(url.protocol)) {
    return true
  }

  if (!isPackaged && isLocalhostUrl(url)) {
    return true
  }

  return false
}

type BeforeRequestHandler = (
  details: Electron.OnBeforeRequestListenerDetails,
  callback: (response: Electron.CallbackResponse) => void
) => void

export const createNetworkBlockerHandler = (isPackaged: boolean): BeforeRequestHandler => {
  return (details, callback) => {
    try {
      const requestedUrl = new URL(details.url)
      const allow = shouldAllowRequest(requestedUrl, isPackaged)
      callback({ cancel: !allow })
    } catch {
      callback({ cancel: true })
    }
  }
}

const registerNetworkBlocker = (targetSession: Session): void => {
  targetSession.webRequest.onBeforeRequest(
    { urls: ['*://*/*'] },
    createNetworkBlockerHandler(app.isPackaged)
  )
}

const registerWebContentsGuards = (): void => {
  app.on('web-contents-created', (_, contents: WebContents) => {
    contents.on('will-navigate', (event) => {
      event.preventDefault()
    })

    contents.setWindowOpenHandler(() => ({ action: 'deny' }))
  })
}

export const registerSecurityHooks = (): void => {
  const defaultSession = session.defaultSession
  const allowDevInlineScripts = !app.isPackaged

  defaultSession.setPermissionRequestHandler((_, __, callback) => {
    callback(false)
  })

  registerContentSecurityPolicy(defaultSession, allowDevInlineScripts)
  registerNetworkBlocker(defaultSession)
  registerWebContentsGuards()
}
