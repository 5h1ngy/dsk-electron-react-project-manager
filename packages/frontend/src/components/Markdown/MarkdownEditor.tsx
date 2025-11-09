import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button, Card, Input, List, Segmented, Space, Typography, theme } from 'antd'
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
import type { TextAreaRef } from 'antd/es/input/TextArea'
import MarkdownPreview from '@uiw/react-markdown-preview'
import '@uiw/react-markdown-preview/markdown.css'
import { useThemeTokens } from '@renderer/theme/hooks/useThemeTokens'

export interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
  onCursorChange?: (value: string, cursor: number) => void
  suggestions?: MarkdownSuggestion[]
  onInsertSuggestion?: (item: MarkdownSuggestion) => void
  suggestionTrigger?: string
}

type EditorMode = 'write' | 'preview'

export interface MarkdownSuggestion {
  id: string
  label: string
  description?: string
  insertText?: string
}

export const MarkdownEditor = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  maxLength,
  onCursorChange,
  suggestions = [],
  onInsertSuggestion,
  suggestionTrigger = '[['
}: MarkdownEditorProps) => {
  const [mode, setMode] = useState<EditorMode>('write')
  const textareaRef = useRef<TextAreaRef | null>(null)
  const { token } = theme.useToken()
  const { spacing } = useThemeTokens()
  const [cursor, setCursor] = useState<number>(0)
  const [triggerIndex, setTriggerIndex] = useState<number | null>(null)
  const [query, setQuery] = useState<string>('')
  const [isSuggestOpen, setIsSuggestOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(0)
  const colorMode = useMemo(() => {
    const hex = token.colorBgBase?.replace('#', '')
    if (!hex || hex.length < 6) {
      return 'light'
    }
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.5 ? 'light' : 'dark'
  }, [token.colorBgBase])

  const emitCursorChange = () => {
    if (!onCursorChange) {
      return
    }
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    const currentValue = textarea?.value ?? value
    const caret = textarea?.selectionStart ?? currentValue.length
    setCursor(caret)
    onCursorChange(currentValue, caret)
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

  const updateSuggestionState = useCallback(
    (currentValue: string, caretPosition: number) => {
      if (!suggestions.length) {
        if (isSuggestOpen) {
          setIsSuggestOpen(false)
        }
        return
      }
      const searchRange = currentValue.slice(0, caretPosition)
      const triggerPos = searchRange.lastIndexOf(suggestionTrigger)
      if (triggerPos === -1) {
        setTriggerIndex(null)
        setIsSuggestOpen(false)
        setQuery('')
        return
      }

      const afterTrigger = searchRange.slice(triggerPos + suggestionTrigger.length)
      if (
        afterTrigger.includes(']') ||
        afterTrigger.includes('\n') ||
        afterTrigger.includes('\r')
      ) {
        setTriggerIndex(null)
        setIsSuggestOpen(false)
        setQuery('')
        return
      }

      setTriggerIndex(triggerPos)
      setQuery(afterTrigger)
      setIsSuggestOpen(true)
      setActiveSuggestion(0)
    },
    [suggestions, suggestionTrigger, isSuggestOpen]
  )

  useEffect(() => {
    updateSuggestionState(value, cursor)
  }, [value, cursor, updateSuggestionState])

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) {
      return suggestions
    }
    const normalized = query.trim().toLowerCase()
    return suggestions.filter((item) => {
      const labelMatch = item.label.toLowerCase().includes(normalized)
      const descMatch = item.description?.toLowerCase().includes(normalized)
      return labelMatch || Boolean(descMatch)
    })
  }, [query, suggestions])

  const closeSuggestions = () => {
    setIsSuggestOpen(false)
    setTriggerIndex(null)
    setQuery('')
    setActiveSuggestion(0)
  }

  const handleSuggestionInsert = (item: MarkdownSuggestion) => {
    const textarea = textareaRef.current?.resizableTextArea?.textArea
    if (!textarea || triggerIndex === null) {
      return
    }
    const beforeTrigger = value.slice(0, triggerIndex)
    const afterCaret = value.slice(cursor)
    const insertLabel = item.insertText ?? item.label
    const nextValue = `${beforeTrigger}${suggestionTrigger}${insertLabel}]]${afterCaret}`
    const nextCursor = beforeTrigger.length + suggestionTrigger.length + insertLabel.length + 2

    onChange(nextValue)
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(nextCursor, nextCursor)
      setCursor(nextCursor)
      emitCursorChange()
    })

    onInsertSuggestion?.(item)
    closeSuggestions()
  }

  useEffect(() => {
    if (!isSuggestOpen) {
      return
    }
    if (!filteredSuggestions.length) {
      setActiveSuggestion(0)
    } else if (activeSuggestion >= filteredSuggestions.length) {
      setActiveSuggestion(Math.max(filteredSuggestions.length - 1, 0))
    }
  }, [filteredSuggestions, isSuggestOpen, activeSuggestion])

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
            <Button
              key={item.label}
              size="small"
              disabled={disabled}
              icon={item.icon}
              onClick={() => applyFormatting(item.handler)}
              aria-label={item.label}
            />
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
        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          <Input.TextArea
            ref={textareaRef}
            value={value}
            onChange={(event) => {
              onChange(event.target.value)
              requestAnimationFrame(() => {
                const caret =
                  textareaRef.current?.resizableTextArea?.textArea?.selectionStart ??
                  event.target.value.length
                setCursor(caret)
                emitCursorChange()
              })
            }}
            placeholder={placeholder}
            autoSize={{ minRows: 8 }}
            disabled={disabled}
            maxLength={maxLength}
            onSelect={() => {
              emitCursorChange()
            }}
            onClick={() => {
              emitCursorChange()
            }}
            onKeyDown={(event) => {
              if (!isSuggestOpen) {
                return
              }
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault()
                const delta = event.key === 'ArrowDown' ? 1 : -1
                setActiveSuggestion((prev) => {
                  const count = filteredSuggestions.length
                  if (!count) {
                    return 0
                  }
                  return (prev + delta + count) % count
                })
              } else if (event.key === 'Enter' && filteredSuggestions[activeSuggestion]) {
                event.preventDefault()
                handleSuggestionInsert(filteredSuggestions[activeSuggestion])
              } else if (event.key === 'Escape') {
                event.preventDefault()
                closeSuggestions()
              }
            }}
            onKeyUp={() => {
              emitCursorChange()
            }}
            onBlur={() => {
              setTimeout(() => {
                closeSuggestions()
              }, 150)
            }}
          />
          {isSuggestOpen && filteredSuggestions.length ? (
            <Card
              size="small"
              style={{
                background: token.colorBgElevated,
                borderColor: token.colorBorderSecondary,
                boxShadow: token.boxShadowSecondary ?? token.boxShadow
              }}
              styles={{
                body: {
                  padding: token.paddingXS
                }
              }}
            >
              <List
                size="small"
                dataSource={filteredSuggestions.slice(0, 8)}
                split={false}
                renderItem={(item, index) => {
                  const isActive = index === activeSuggestion
                  return (
                    <List.Item
                      key={item.id}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSuggestionInsert(item)}
                      style={{
                        padding: token.paddingXS,
                        borderRadius: token.borderRadiusSM,
                        cursor: 'pointer',
                        background: isActive ? token.colorPrimaryBg : token.colorBgContainer
                      }}
                    >
                      <Space direction="vertical" size={token.marginXXS} style={{ width: '100%' }}>
                        <Typography.Text strong>{item.label}</Typography.Text>
                        {item.description ? (
                          <Typography.Text type="secondary">{item.description}</Typography.Text>
                        ) : null}
                      </Space>
                    </List.Item>
                  )
                }}
              />
            </Card>
          ) : null}
        </Space>
      ) : (
        <Card
          size="small"
          style={{
            minHeight: 160,
            background: token.colorBgContainer,
            borderColor: token.colorBorderSecondary
          }}
          styles={{
            body: {
              padding: spacing.md
            }
          }}
        >
          {value.trim() ? (
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
          ) : (
            <Typography.Text type="secondary">Nessun contenuto da mostrare</Typography.Text>
          )}
        </Card>
      )}
    </Space>
  )
}

export default MarkdownEditor
