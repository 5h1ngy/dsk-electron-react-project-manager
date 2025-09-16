import { useMemo, useRef, useState } from 'react'
import { Button, Input, Segmented, Space, Tooltip } from 'antd'
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  CodeOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons'
import type { SegmentedValue } from 'antd/es/segmented'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import type { TextAreaRef } from 'antd/es/input/TextArea'
import './markdown.css'

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  onCursorChange?: (value: string, cursor: number) => void
}

type EditorMode = 'write' | 'preview'

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  maxLength,
  onCursorChange
}: MarkdownEditorProps) => {
  const [mode, setMode] = useState<EditorMode>('write')
  const textareaRef = useRef<TextAreaRef | null>(null)

  const emitCursorChange = () => {
    if (!onCursorChange) {
      return
    }
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    const currentValue = textarea?.value ?? value
    const cursor = textarea?.selectionStart ?? currentValue.length
    onCursorChange(currentValue, cursor)
  }

  const handleModeChange = (next: SegmentedValue) => {
    setMode(next as EditorMode)
  }

  const applyFormatting = (template: (selection: string) => string) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    if (!textarea) {
      onChange(template(value))
      return
    }
    const { selectionStart, selectionEnd } = textarea
    const before = value.slice(0, selectionStart)
    const selected = value.slice(selectionStart, selectionEnd)
    const after = value.slice(selectionEnd)

    const formatted = template(selected || '')
    const nextValue = `${before}${formatted}${after}`
    onChange(nextValue)

    requestAnimationFrame(() => {
      const caret = before.length + formatted.length
      textarea.focus()
      textarea.setSelectionRange(caret, caret)
      emitCursorChange()
    })
  }

  const toolbar = useMemo(
    () => [
      {
        icon: <BoldOutlined />,
        label: 'Grassetto',
        handler: (selection: string) => `**${selection || 'testo'}**`
      },
      {
        icon: <ItalicOutlined />,
        label: 'Corsivo',
        handler: (selection: string) => `*${selection || 'testo'}*`
      },
      {
        icon: <CodeOutlined />,
        label: 'Inline code',
        handler: (selection: string) => `\`${selection || 'code'}\``
      },
      {
        icon: <UnorderedListOutlined />,
        label: 'Lista puntata',
        handler: (selection: string) =>
          selection
            ? selection
                .split('\n')
                .map((line) => `- ${line || 'elemento'}`)
                .join('\n')
            : '- elemento'
      },
      {
        icon: <OrderedListOutlined />,
        label: 'Lista numerata',
        handler: (selection: string) =>
          selection
            ? selection
                .split('\n')
                .map((line, index) => `${index + 1}. ${line || 'elemento'}`)
                .join('\n')
            : '1. elemento'
      }
    ],
    []
  )

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Space
        style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
        wrap
        size={12}
      >
        <Space size={4} wrap>
          {toolbar.map((item) => (
            <Tooltip title={item.label} key={item.label}>
              <Button
                size="small"
                disabled={disabled}
                icon={item.icon}
                onClick={() => applyFormatting(item.handler)}
              />
            </Tooltip>
          ))}
        </Space>
        <Segmented
          size="small"
          value={mode}
          onChange={handleModeChange}
          options={[
            {
              value: 'write',
              label: (
                <span>
                  <EditOutlined /> Scrivi
                </span>
              )
            },
            {
              value: 'preview',
              label: (
                <span>
                  <EyeOutlined /> Anteprima
                </span>
              )
            }
          ]}
        />
      </Space>

      {mode === 'write' ? (
        <Input.TextArea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
            requestAnimationFrame(emitCursorChange)
          }}
          placeholder={placeholder}
          autoSize={{ minRows: 8 }}
          disabled={disabled}
          maxLength={maxLength}
          onSelect={emitCursorChange}
          onClick={emitCursorChange}
          onKeyUp={emitCursorChange}
        />
      ) : (
        <div
          className="markdown-body"
          style={{ minHeight: 160, padding: 12, border: '1px solid #d9d9d9', borderRadius: 8 }}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {value}
            </ReactMarkdown>
          ) : (
            <span style={{ color: '#9ca3af' }}>Nessun contenuto da mostrare</span>
          )}
        </div>
      )}
    </Space>
  )
}

export default MarkdownEditor
