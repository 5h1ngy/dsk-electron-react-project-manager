import '@testing-library/jest-dom'
import React from 'react'

jest.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'react-markdown' }, children)
}))

jest.mock('remark-gfm', () => ({ __esModule: true, default: () => null }))
jest.mock('rehype-sanitize', () => ({ __esModule: true, default: () => null }))
