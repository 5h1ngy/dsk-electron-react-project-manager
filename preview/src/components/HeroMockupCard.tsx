import { Card, Empty, Image, theme } from 'antd'
import { useMemo, useState, type ReactElement } from 'react'

import { useSurfacePalette } from '../hooks/useSurfacePalette'
import type { ThemeMode } from '../theme/foundations/palette'

interface HeroMockupCardProps {
  accent: string
  mode: ThemeMode
  heroShot: string
  title: string
}

const resolveHeroShotSrc = (raw: string): string => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) {
    return raw
  }
  const sanitized = raw.replace(/^\.?[\\/]+/, '')
  const relative = sanitized.startsWith('gallery/') || sanitized.startsWith('assets/')
    ? sanitized
    : sanitized.startsWith('public/')
      ? sanitized.replace(/^public[\\/]+/, '')
      : sanitized.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}${relative}`
}

export const HeroMockupCard = ({ accent, mode, heroShot, title }: HeroMockupCardProps): ReactElement => {
  const { token } = theme.useToken()
  const surfaces = useSurfacePalette(mode, accent)
  const [hovered, setHovered] = useState(false)
  const cardMaxWidth = token.sizeUnit * 240
  const hoverLift = token.padding
  const heroShotSrc = useMemo(() => resolveHeroShotSrc(heroShot), [heroShot])

  return (
    <Card
      bordered
      style={{
        width: '100%',
        maxWidth: cardMaxWidth,
        marginLeft: 'auto',
        borderRadius: token.borderRadiusOuter,
        background: surfaces.mockupCardBackground,
        borderColor: accent,
        boxShadow: mode === 'dark' ? token.boxShadowSecondary : token.boxShadow,
        transform: hovered
          ? `translateY(-${hoverLift}px) rotateX(2deg) rotateY(-2deg)`
          : 'translateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden'
      }}
      bodyStyle={{ padding: token.padding }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {heroShotSrc ? (
        <Image
          src={heroShotSrc}
          alt={title}
          preview={false}
          style={{
            width: '100%',
            borderRadius: token.borderRadiusLG,
            boxShadow: mode === 'dark' ? token.boxShadowSecondary : token.boxShadow,
            background: surfaces.mockupImageBackground
          }}
        />
      ) : (
        <Empty description={title} />
      )}
    </Card>
  )
}
