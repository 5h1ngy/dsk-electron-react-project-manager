import type { ReactNode } from 'react'

const ReactMarkdownMock = ({ children }: { children?: ReactNode }) => (
  <div data-testid="react-markdown">{children}</div>
)

export default ReactMarkdownMock
