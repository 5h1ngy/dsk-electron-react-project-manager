import '@ant-design/v5-patch-for-react-19'
import 'antd/dist/reset.css'
import '@renderer/i18n/config'

import { StrictMode } from 'react'
import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import App from '@renderer/App'
import { store } from '@renderer/store'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

const fontStack =
  "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif"

document.body.style.margin = '0'
document.body.style.minHeight = '100vh'
document.body.style.fontFamily = fontStack
document.body.style.backgroundColor = '#f5f5f5'

container.style.minHeight = '100vh'

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
