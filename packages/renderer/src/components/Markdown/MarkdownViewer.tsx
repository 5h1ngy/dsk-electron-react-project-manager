import { useMemo, type ReactNode } from 'react'
import { Card, Typography, theme } from 'antd'
import MarkdownPreview from '@uiw/react-markdown-preview'
import '@uiw/react-markdown-preview/markdown.css'

export interface MarkdownViewerProps {
  value?: string | null
  emptyFallback?: ReactNode
}

const resolveColorMode = (hex: string | undefined): 'light' | 'dark' => {
  if (!hex) {
    return 'light'
  }
  const normalized = hex.replace('#', '')
  if (normalized.length < 6) {
    return 'light'
  }
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'light' : 'dark'
}

export const MarkdownViewer = ({ value, emptyFallback }: MarkdownViewerProps) => {
  const { token } = theme.useToken()
  const colorMode = useMemo(() => resolveColorMode(token.colorBgBase), [token.colorBgBase])

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
      <MarkdownPreview
        source={value}
        wrapperElement={{ 'data-color-mode': colorMode }}
        style={{
          background: 'transparent',
          color: token.colorText,
          fontFamily: token.fontFamily,
          fontSize: token.fontSize
        }}
      />
    </Card>
  )
}

export default MarkdownViewer
