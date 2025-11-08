import { Button, Card, Carousel, Image, Modal, Space, Typography, theme } from 'antd'
import { LeftOutlined, RightOutlined, ExpandOutlined } from '@ant-design/icons'
import type { CarouselRef } from 'antd/es/carousel'
import type { FC } from 'react'
import { useRef, useState } from 'react'
import { galleryShots } from '../data/site'
import { useBlurOnScroll } from '../hooks/useBlurOnScroll'

interface ScreensGalleryProps {
  accent: string
}

export const ScreensGallery: FC<ScreensGalleryProps> = ({ accent }) => {
  const { token } = theme.useToken()
  const carouselRef = useRef<CarouselRef>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [modalVisible, setModalVisible] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  useBlurOnScroll(headingRef)

  const currentShot = galleryShots[activeIndex]

  return (
    <Card
      data-motion="gallery"
      bordered={false}
      style={{ background: 'transparent', marginTop: token.marginXXL * 2 }}
      bodyStyle={{ padding: 0 }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Typography.Title
          ref={headingRef}
          level={2}
          style={{
            color: accent,
            marginBottom: token.margin,
            textAlign: 'center',
            fontSize: 56,
            letterSpacing: 1.3
          }}
        >
          Screens gallery
        </Typography.Title>
        <Card
          bordered={false}
          style={{
            borderRadius: token.borderRadiusXXL,
            background: token.colorBgContainer,
            position: 'relative',
            overflow: 'hidden',
            boxShadow:
              token.colorBgBase === '#040614'
                ? '0 30px 80px rgba(0,0,0,0.45)'
                : '0 25px 60px rgba(15,23,42,0.18)'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <Carousel
            ref={carouselRef}
            dots
            autoplay
            autoplaySpeed={5000}
            afterChange={(index) => setActiveIndex(index)}
            effect="scrollx"
            style={{ width: '100%' }}
          >
            {galleryShots.map((shot) => (
              <div key={shot}>
                <Image
                  src={shot}
                  alt="Product screen"
                  preview={false}
                  onClick={() => setModalVisible(true)}
                  style={{
                    width: '100%',
                    cursor: 'pointer',
                    borderRadius: token.borderRadiusXXL
                  }}
                />
              </div>
            ))}
          </Carousel>
          <Space
            style={{
              position: 'absolute',
              right: token.paddingXL,
              bottom: token.paddingXL
            }}
          >
            <Button
              shape="circle"
              icon={<LeftOutlined />}
              size="large"
              onClick={() => carouselRef.current?.prev()}
            />
            <Button
              shape="circle"
              icon={<RightOutlined />}
              size="large"
              onClick={() => carouselRef.current?.next()}
            />
            <Button
              type="primary"
              icon={<ExpandOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Full view
            </Button>
          </Space>
        </Card>
      </Space>
      <Modal
        open={modalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        centered
        width="90%"
        bodyStyle={{ padding: 0, background: '#000' }}
        styles={{ mask: { backdropFilter: 'blur(6px)' } }}
      >
        <Image src={currentShot} alt="Full screen" preview={false} width="100%" />
      </Modal>
    </Card>
  )
}
