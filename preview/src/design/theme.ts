import type { ThemeConfig } from 'antd'

export const portfolioTheme: ThemeConfig = {
  token: {
    colorPrimary: '#ff7b4f',
    colorBgBase: '#05060c',
    colorTextBase: '#ffffff',
    fontFamily: `"Inter", "SF Pro Display", "Segoe UI", system-ui, sans-serif`,
    borderRadius: 14
  },
  components: {
    Button: {
      borderRadius: 999,
      controlHeightLG: 48
    },
    Card: {
      colorBgContainer: '#0c1020',
      borderRadius: 16
    }
  }
}
