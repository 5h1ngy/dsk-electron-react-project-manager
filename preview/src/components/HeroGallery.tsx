import { ExpandOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Carousel, Flex, Image, Modal, Space, theme } from 'antd'
import type { CarouselRef } from 'antd/es/carousel'
import { useMemo, useRef, useState, type ReactElement } from 'react'

import type { GalleryContent } from '../types/content'

interface HeroGalleryProps {
  content: GalleryContent
}

const resolveStaticSrc = (raw: string): string => {
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) {
    return raw
  }
  const trimmed = raw.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL ?? '/'
  if (base === '/' || base === '') {
    return trimmed ? `/${trimmed}` : ''
  }
  if (base === './') {
    return `./${trimmed}`
  }
  const normalized = base.endsWith('/') ? base : `${base}/`
  return `${normalized}${trimmed}`
}

export const HeroGallery = ({ content }: HeroGalleryProps): ReactElement => {
  const { token } = theme.useToken()
  const carouselRef = useRef<CarouselRef>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const resolvedShots = useMemo(
    () =>
      (content.shots ?? [])
        .map((shot) => ({ key: shot, src: resolveStaticSrc(shot) }))
        .filter((shot) => Boolean(shot.src)),
    [content.shots]
  )
  const currentShot = resolvedShots[activeIndex]?.src ?? resolvedShots[0]?.src ?? ''

  return (
    <>
      <Flex style={{ position: 'relative', width: '100%' }}>
        <Carousel
          ref={carouselRef}
          dots={false}
          autoplay
          autoplaySpeed={4500}
          style={{ width: '100%', borderRadius: token.borderRadiusLG }}
          afterChange={(index) => setActiveIndex(index)}
        >
          {resolvedShots.map(({ key, src }) => (
            <Image
              key={key}
              src={src}
              alt={content.alt}
              preview={false}
              style={{
                width: '100%',
                borderRadius: token.borderRadiusLG,
                boxShadow: '0 25px 60px rgba(0,0,0,0.35)'
              }}
            />
          ))}
        </Carousel>
        <Space
          style={{
            position: 'absolute',
            bottom: token.margin,
            right: token.margin,
            gap: token.marginXS
          }}
        >
          <Button
            shape="circle"
            icon={<LeftOutlined />}
            onClick={() => carouselRef.current?.prev()}
            aria-label={content.controls.previous}
          />
          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => carouselRef.current?.next()}
            aria-label={content.controls.next}
          />
          <Button
            type="primary"
            icon={<ExpandOutlined />}
            onClick={() => setModalOpen(true)}
            aria-label={content.controls.expand}
          />
        </Space>
      </Flex>

      <Modal
        open={modalOpen}
        footer={null}
        width="90%"
        centered
        onCancel={() => setModalOpen(false)}
        styles={{ mask: { backdropFilter: 'blur(4px)' } }}
      >
        {currentShot ? <Image src={currentShot} alt={content.modalAlt} preview={false} /> : null}
      </Modal>
    </>
  )
}
