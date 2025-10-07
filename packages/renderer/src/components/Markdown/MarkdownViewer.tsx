import { useMemo, type ReactNode } from 'react'
import { Card, Typography, theme } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'

import { buildMarkdownComponents } from '@renderer/components/Markdown/markdownRenderers'

export interface MarkdownViewerProps {
  value?: string | null
  emptyFallback?: ReactNode
}

export const MarkdownViewer = ({ value, emptyFallback }: MarkdownViewerProps) => {
  const { token } = theme.useToken()
  const components = useMemo(() => buildMarkdownComponents(token), [token])

  if (!value || value.trim().length === 0) {
    return emptyFallback ? (
      <>{emptyFallback}</>
    ) : (
      <Typography.Paragraph type="secondary">Nessun contenuto disponibile</Typography.Paragraph>
    )
  }

  return (
    <Card
      size="small"
      bordered={false}
      style={{
        background: token.colorBgContainer,
        boxShadow: 'none'
      }}
      styles={{
        body: {
          padding: token.paddingLG
        }
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={components}
      >
        {value}
      </ReactMarkdown>
    </Card>
  )
}

export default MarkdownViewer
