import '@ant-design/v5-patch-for-react-19'
import 'antd/dist/reset.css'
import '@renderer/i18n/config'

import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import App from '@renderer/App'
import { store } from '@renderer/store'
import { ensureHttpBridge } from '@renderer/platform/httpBridge'

ensureHttpBridge()

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
