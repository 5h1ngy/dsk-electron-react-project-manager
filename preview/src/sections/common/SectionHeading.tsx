import { Flex, Typography, theme } from 'antd'
import { useRef } from 'react'
import { useBlurOnScroll } from '../../hooks/useBlurOnScroll'

type TextAlign = 'left' | 'center' | 'right'

interface SectionHeadingProps {
  title: string
  accent: string
  description?: string
  align?: TextAlign
  size?: number
  descriptionColor?: string
}

export const SectionHeading = ({
  title,
  accent,
  description,
  align = 'center',
  size = 56,
  descriptionColor
}: SectionHeadingProps) => {
  const { token } = theme.useToken()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLParagraphElement>(null)

  useBlurOnScroll(headingRef)
  useBlurOnScroll(descriptionRef)

  const alignmentMap: Record<TextAlign, 'flex-start' | 'center' | 'flex-end'> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  }

  return (
    <Flex
      vertical
      gap={token.marginXS}
      style={{ width: '100%', textAlign: align, alignItems: alignmentMap[align] }}
    >
      <Typography.Title
        ref={headingRef}
        level={2}
        style={{
          color: accent,
          marginBottom: 0,
          fontSize: size,
          letterSpacing: 1.3
        }}
      >
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Paragraph
          ref={descriptionRef}
          style={{
            color: descriptionColor ?? token.colorTextSecondary,
            marginBottom: 0,
            maxWidth: 640
          }}
        >
          {description}
        </Typography.Paragraph>
      ) : null}
    </Flex>
  )
}
