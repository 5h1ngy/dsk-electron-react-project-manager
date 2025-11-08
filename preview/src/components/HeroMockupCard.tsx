import { Card, Flex, theme } from 'antd'
import { useState, type ReactElement } from 'react'

import type { GalleryContent } from '../types/content'
import type { ThemeMode } from '../theme/foundations/palette'
import { darken, lighten } from '../theme/utils'

import { HeroGallery } from './HeroGallery'

interface HeroMockupCardProps {
  accent: string
  mode: ThemeMode
  gallery: GalleryContent
}

export const HeroMockupCard = ({ accent, mode, gallery }: HeroMockupCardProps): ReactElement => {
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)
  const background =
    mode === 'dark'
      ? darken(token.colorBgElevated, 0.08)
      : lighten(token.colorBgElevated, 0.06)
  const galleryOverflowOffset = token.marginXXXL + token.marginXL
  const cardMaxWidth = token.sizeUnit * 240
  const hoverLift = token.padding

  return (
    <Card
      bordered
      style={{
        width: '100%',
        maxWidth: cardMaxWidth,
        marginLeft: 'auto',
        borderRadius: token.borderRadiusOuter,
        background,
        borderColor: accent,
        boxShadow:
          mode === 'dark' ? token.boxShadowSecondary : token.boxShadow,
        transform: hovered
          ? `translateY(-${hoverLift}px) rotateX(2deg) rotateY(-2deg)`
          : 'translateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'visible'
      }}
      bodyStyle={{ padding: token.padding, overflow: 'visible' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex
        style={{
          position: 'relative',
          right: `-${galleryOverflowOffset}px`,
          width: `calc(100% + ${galleryOverflowOffset}px)`
        }}
      >
        <HeroGallery content={gallery} />
      </Flex>
    </Card>
  )
}
