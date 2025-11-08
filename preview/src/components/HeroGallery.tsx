/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { ExpandOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Carousel, Flex, Image, Modal, Space, theme } from 'antd'
import type { CarouselRef } from 'antd/es/carousel'
import { useRef, useState } from 'react'
import { galleryShots } from '../data/site'

export const HeroGallery = () => {
  const { token } = theme.useToken()
  const carouselRef = useRef<CarouselRef>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

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
          {galleryShots.map((shot) => (
            <Image
              key={shot}
              src={shot}
              alt="Product preview"
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
            aria-label="Show previous preview"
          />
          <Button
            shape="circle"
            icon={<RightOutlined />}
            onClick={() => carouselRef.current?.next()}
            aria-label="Show next preview"
          />
          <Button
            type="primary"
            icon={<ExpandOutlined />}
            onClick={() => setModalOpen(true)}
            aria-label="Expand preview"
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
        <Image src={galleryShots[activeIndex]} alt="Fullscreen preview" preview={false} />
      </Modal>
    </>
  )
}
