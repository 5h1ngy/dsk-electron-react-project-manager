/* eslint-disable react/display-name */
import { Card, Space, Typography, theme } from 'antd'
import type { Components } from 'react-markdown'
import React from 'react'

type ThemeToken = ReturnType<typeof theme.useToken>['token']

const buildHeading =
  (token: ThemeToken, level: 1 | 2 | 3 | 4 | 5) =>
  ({ children }: { children?: React.ReactNode }) => (
    <Typography.Title
      level={level}
      style={{
        marginTop: level === 1 ? token.marginXXL : token.marginXL,
        marginBottom: token.marginSM
      }}
    >
      {children}
    </Typography.Title>
  )

const renderInline = (content: React.ReactNode) => <Typography.Text>{content}</Typography.Text>

const renderParagraph =
  (token: ThemeToken) =>
  ({ children }: { children?: React.ReactNode }) => (
    <Typography.Paragraph style={{ marginBottom: token.marginSM }}>{children}</Typography.Paragraph>
  )

const renderBlockquote =
  (token: ThemeToken) =>
  ({ children }: { children?: React.ReactNode }) => (
    <Card
      size="small"
      style={{
        borderLeft: `${token.lineWidthBold}px solid ${token.colorBorder}`,
        background: token.colorFillQuaternary,
        marginBottom: token.marginMD
      }}
      styles={{
        body: {
          padding: token.paddingSM
        }
      }}
    >
      <Typography.Paragraph italic type="secondary" style={{ marginBottom: 0 }}>
        {children}
      </Typography.Paragraph>
    </Card>
  )

const isReactElement = (
  child: React.ReactNode
): child is React.ReactElement<{ children?: React.ReactNode }> => React.isValidElement(child)

const extractNodeContent = (node: React.ReactNode): React.ReactNode => {
  if (!isReactElement(node)) {
    return node
  }
  return node.props?.children ?? null
}

const renderList =
  (token: ThemeToken, ordered: boolean) =>
  ({ children }: { children?: React.ReactNode }) => {
    const items = React.Children.toArray(children)

    return (
      <Space
        direction="vertical"
        size={token.marginXS}
        style={{ width: '100%', marginBottom: token.marginSM }}
      >
        {items.map((item, index) => (
          <Space key={index} align="start" size={token.marginSM} style={{ width: '100%' }}>
            <Typography.Text strong>{ordered ? `${index + 1}.` : '•'}</Typography.Text>
            <Typography.Paragraph style={{ marginBottom: 0, flex: 1 }}>
              {extractNodeContent(item)}
            </Typography.Paragraph>
          </Space>
        ))}
      </Space>
    )
  }

const renderCode =
  (token: ThemeToken) =>
  ({ inline, children }: { inline?: boolean; children?: React.ReactNode }) => {
    if (inline) {
      return (
        <Typography.Text
          code
          style={{
            fontFamily: token.fontFamilyCode,
            background: token.colorFillTertiary,
            paddingInline: token.paddingXXS,
            borderRadius: token.borderRadiusSM
          }}
        >
          {children}
        </Typography.Text>
      )
    }

    return (
      <Card
        size="small"
        style={{
          background: token.colorFillTertiary,
          borderColor: token.colorBorder,
          marginBottom: token.marginSM
        }}
        styles={{
          body: {
            padding: token.paddingSM,
            overflowX: 'auto'
          }
        }}
      >
        <Typography.Paragraph
          code
          style={{
            marginBottom: 0,
            whiteSpace: 'pre-wrap',
            fontFamily: token.fontFamilyCode
          }}
        >
          {children}
        </Typography.Paragraph>
      </Card>
    )
  }

export const buildMarkdownComponents = (token: ThemeToken): Components => ({
  p: renderParagraph(token),
  h1: buildHeading(token, 2),
  h2: buildHeading(token, 3),
  h3: buildHeading(token, 4),
  h4: buildHeading(token, 5),
  h5: buildHeading(token, 5),
  h6: ({ children }) => (
    <Typography.Text
      strong
      style={{
        display: 'block',
        marginTop: token.marginLG,
        marginBottom: token.marginXS
      }}
    >
      {children}
    </Typography.Text>
  ),
  strong: ({ children }) => <Typography.Text strong>{children}</Typography.Text>,
  em: ({ children }) => <Typography.Text italic>{children}</Typography.Text>,
  a: ({ href, children }) => (
    <Typography.Link href={href ?? '#'} target="_blank" rel="noreferrer">
      {children}
    </Typography.Link>
  ),
  blockquote: renderBlockquote(token),
  ul: renderList(token, false),
  ol: renderList(token, true),
  code: renderCode(token),
  li: ({ children }) => renderInline(children)
})
