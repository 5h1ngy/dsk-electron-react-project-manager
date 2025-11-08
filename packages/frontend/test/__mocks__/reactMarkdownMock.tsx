import React from 'react'

const ReactMarkdownMock = ({ children }: { children?: React.ReactNode }) =>
  React.createElement('div', { 'data-testid': 'react-markdown-mock' }, children)

export default ReactMarkdownMock
