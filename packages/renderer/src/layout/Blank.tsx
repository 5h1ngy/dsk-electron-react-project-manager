import type { JSX } from 'react'
import { Space, Layout } from 'antd'

import { LanguageSwitcher } from '@renderer/components/LanguageSwitcher'
import { ThemeControls } from '@renderer/components/ThemeControls'
import {
  BLANK_CONTENT_STYLE,
  BLANK_HEADER_CONTENT_STYLE,
  BLANK_HEADER_STYLE,
  BLANK_LAYOUT_STYLE
} from '@renderer/layout/Blank.helpers'
import type { BlankLayoutProps } from '@renderer/layout/Blank.types'

const { Header, Content } = Layout

const Blank = ({ children }: BlankLayoutProps): JSX.Element => (
  <Layout style={BLANK_LAYOUT_STYLE}>
    <Header style={BLANK_HEADER_STYLE}>
      <Space align="center" size="middle" style={BLANK_HEADER_CONTENT_STYLE}>
        <LanguageSwitcher />
        <ThemeControls />
      </Space>
    </Header>
    <Content style={BLANK_CONTENT_STYLE}>
      {children}
    </Content>
  </Layout>
)

export default Blank
