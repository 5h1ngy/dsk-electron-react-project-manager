import '@ant-design/v5-patch-for-react-19'
import 'antd/dist/reset.css'
import './styles/global.css'
import './i18n/config'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const container = document.getElementById('root')

if (!container) {
  throw new Error('Root container not found')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
)
