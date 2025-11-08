/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Card, theme } from 'antd'
import { useState } from 'react'
import type { ThemeMode } from '../theme/foundations/palette'
import { HeroGallery } from './HeroGallery'

interface HeroMockupCardProps {
  accent: string
  mode: ThemeMode
}

export const HeroMockupCard = ({ accent, mode }: HeroMockupCardProps) => {
  const { token } = theme.useToken()
  const [hovered, setHovered] = useState(false)
  const background =
    mode === 'dark'
      ? 'linear-gradient(145deg, rgba(15,23,42,0.95), rgba(5,6,17,0.95))'
      : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(241,245,255,0.9))'

  return (
    <Card
      bordered
      style={{
        width: '100%',
        maxWidth: 960,
        marginLeft: 'auto',
        borderRadius: token.borderRadiusXXL,
        background,
        borderColor: accent,
        boxShadow:
          mode === 'dark' ? '0 30px 80px rgba(0,0,0,0.5)' : '0 30px 60px rgba(15,23,42,0.2)',
        transform: hovered ? 'translateY(-12px) rotateX(2deg) rotateY(-2deg)' : 'translateY(0)',
        transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      bodyStyle={{ padding: token.padding, overflow: 'hidden' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <HeroGallery />
    </Card>
  )
}
