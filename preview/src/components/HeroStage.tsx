/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Card, Col, Flex, Row, theme } from 'antd'
import { useMemo } from 'react'
import type { ThemeMode } from '../theme/foundations/palette'
import { HeroControls } from './HeroControls'
import { HeroHeadline } from './HeroHeadline'
import { HeroMockupCard } from './HeroMockupCard'

interface HeroStageProps {
  accent: string
  mode: ThemeMode
  toggleMode: () => void
  setAccent: (value: string) => void
}

export const HeroStage = ({ accent, mode, toggleMode, setAccent }: HeroStageProps) => {
  const { token } = theme.useToken()

  const layeredBackground = useMemo(
    () =>
      mode === 'light'
        ? `radial-gradient(circle at 15% 25%, ${accent}24, transparent 45%),
           radial-gradient(circle at 90% 0%, ${accent}20, transparent 55%),
           repeating-linear-gradient(120deg, rgba(15,23,42,0.05), rgba(15,23,42,0.05) 2px, transparent 2px, transparent 16px),
           linear-gradient(135deg, #eef2ff 0%, #ffffff 55%, #e9ecff 100%)`
        : `radial-gradient(circle at 20% 20%, ${accent}33, transparent 52%),
           radial-gradient(circle at 80% 0%, ${accent}29, transparent 48%),
           repeating-linear-gradient(125deg, rgba(148,163,184,0.12), rgba(148,163,184,0.12) 2px, transparent 2px, transparent 18px),
           linear-gradient(130deg, #040814 0%, #050b1b 50%, #020307 100%)`,
    [accent, mode]
  )

  return (
    <Card
      data-motion="hero"
      bordered={false}
      style={{
        minHeight: '90vh',
        borderRadius: token.borderRadiusXL,
        padding: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: layeredBackground,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        boxShadow: mode === 'dark' ? '0 0 140px rgba(0,0,0,0.4)' : '0 0 80px rgba(15,23,42,0.15)'
      }}
      bodyStyle={{ padding: `${token.paddingXL * 2}px ${token.paddingXL * 2.5}px` }}
    >
      <Flex vertical gap={token.marginXL} style={{ width: '100%' }}>
        <HeroControls accent={accent} setAccent={setAccent} mode={mode} toggleMode={toggleMode} />
        <Row align="middle" gutter={[48, 48]} style={{ minHeight: '100%' }}>
          <Col xs={24} lg={9}>
            <HeroHeadline accent={accent} />
          </Col>
          <Col xs={24} lg={15}>
            <HeroMockupCard accent={accent} mode={mode} />
          </Col>
        </Row>
      </Flex>
    </Card>
  )
}
