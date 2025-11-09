import '@testing-library/jest-dom'
import React from 'react'

jest.mock('@uiw/react-markdown-preview', () => ({
  __esModule: true,
  default: ({ source }: { source?: string }) =>
    React.createElement('div', { 'data-testid': 'markdown-preview' }, source)
}))
