import { ExpandOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Carousel,
  Empty,
  Flex,
  Image,
  Modal,
  Space,
  Typography,
  theme
} from 'antd'
import type { CarouselRef } from 'antd/es/carousel'
import { useMemo, useRef, useState, type ReactElement } from 'react'

import type { GalleryContent } from '../types/content'

interface HeroGalleryProps {
  content: GalleryContent
}

interface GalleryShot {
  key: string
  src: string
}

const resolveGallerySrc = (raw: string): string => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) {
    return raw
  }
  const sanitized = raw.replace(/^\.?[\\/]+/, '')
  const relativePath = sanitized.startsWith('gallery/')
    ? sanitized
    : `gallery/${sanitized.replace(/^gallery[\\/]+/, '')}`
  const base = import.meta.env.BASE_URL ?? '/'
  const normalizedBase = base.endsWith('/') ? base : `${base}/`

  if (typeof window !== 'undefined') {
    try {
      return new URL(relativePath, window.location.href).href
    } catch {
      // fall through to base concatenation
    }
  }

  return `${normalizedBase}${relativePath}`
}

export const HeroGallery = ({ content }: HeroGalleryProps): ReactElement => {
  const { token } = theme.useToken()
  const carouselRef = useRef<CarouselRef>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)

  const resolvedShots = useMemo<GalleryShot[]>(
    () =>
      (content.shots ?? [])
        .map((shot, index) => {
          const src = resolveGallerySrc(shot)
          return src ? { key: `${shot}-${index}`, src } : null
        })
        .filter((item): item is GalleryShot => Boolean(item)),
    [content.shots]
  )

  const currentShot = resolvedShots[activeIndex]?.src ?? resolvedShots[0]?.src ?? ''

  const goTo = (index: number) => {
    if (!resolvedShots.length) return
    const nextIndex = (index + resolvedShots.length) % resolvedShots.length
    carouselRef.current?.goTo(nextIndex, true)
    setActiveIndex(nextIndex)
  }

  if (!resolvedShots.length) {
    return (
      <Card
        bordered={false}
        style={{
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
          boxShadow: token.boxShadow
        }}
        bodyStyle={{ padding: token.paddingXL }}
      >
        <Empty description={content.alt} />
      </Card>
    )
  }

  return (
    <Flex vertical gap={token.marginLG}>
      <Card
        bordered={false}
        style={{
          borderRadius: token.borderRadiusLG,
          background: token.colorBgElevated,
          boxShadow: token.boxShadow
        }}
        bodyStyle={{ padding: token.padding }}
      >
        <Carousel
          ref={carouselRef}
          dots
          autoplay
          autoplaySpeed={4500}
          afterChange={(index) => setActiveIndex(index)}
          style={{ width: '100%' }}
        >
          {resolvedShots.map(({ key, src }) => (
            <Flex key={key} justify="center" style={{ width: '100%', padding: token.paddingXS }}>
              <Image
                src={src}
                alt={content.alt}
                preview={false}
                style={{
                  width: '100%',
                  borderRadius: token.borderRadiusLG,
                  boxShadow: token.boxShadowSecondary
                }}
              />
            </Flex>
          ))}
        </Carousel>

        <Flex justify="space-between" align="center" wrap style={{ marginTop: token.marginLG }}>
          <Space>
            <Button
              shape="circle"
              icon={<LeftOutlined />}
              onClick={() => goTo(activeIndex - 1)}
              aria-label={content.controls.previous}
            />
            <Button
              shape="circle"
              icon={<RightOutlined />}
              onClick={() => goTo(activeIndex + 1)}
              aria-label={content.controls.next}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<ExpandOutlined />}
              onClick={() => setModalOpen(true)}
              aria-label={content.controls.expand}
            />
          </Space>
          <Typography.Text style={{ color: token.colorTextSecondary }}>
            {`${activeIndex + 1} / ${resolvedShots.length}`}
          </Typography.Text>
        </Flex>
      </Card>

      <Flex wrap gap={token.marginSM}>
        {resolvedShots.map(({ key, src }, index) => {
          const active = index === activeIndex
          return (
            <Card
              key={key}
              hoverable
              onClick={() => goTo(index)}
              style={{
                width: 120,
                borderRadius: token.borderRadius,
                border: `1px solid ${active ? token.colorPrimary : token.colorBorderSecondary}`,
                boxShadow: active ? token.boxShadowSecondary : token.boxShadow,
                cursor: 'pointer'
              }}
              bodyStyle={{ padding: token.paddingXXS }}
            >
              <Image
                src={src}
                alt={content.alt}
                preview={false}
                style={{
                  width: '100%',
                  borderRadius: token.borderRadiusSM,
                  filter: active ? 'none' : 'grayscale(0.15)'
                }}
              />
            </Card>
          )
        })}
      </Flex>

      <Modal
        open={modalOpen}
        footer={null}
        centered
        width="90%"
        onCancel={() => setModalOpen(false)}
        styles={{ mask: { backdropFilter: 'blur(6px)' } }}
      >
        {currentShot ? (
          <Image
            src={currentShot}
            alt={content.modalAlt}
            preview={false}
            style={{ width: '100%' }}
          />
        ) : (
          <Empty description={content.modalAlt} />
        )}
      </Modal>
    </Flex>
  )
}
