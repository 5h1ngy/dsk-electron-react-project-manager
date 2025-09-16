import type { ReactNode } from 'react'
import { Typography } from 'antd'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import './markdown.css'

export interface MarkdownViewerProps {
  value?: string | null
  emptyFallback?: ReactNode
}

export const MarkdownViewer = ({ value, emptyFallback }: MarkdownViewerProps) => {
  if (!value || value.trim().length === 0) {
    return emptyFallback ? (
      <>{emptyFallback}</>
    ) : (
      <Typography.Paragraph type="secondary">Nessun contenuto disponibile</Typography.Paragraph>
    )
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {value}
      </ReactMarkdown>
    </div>
  )
}

export default MarkdownViewer
