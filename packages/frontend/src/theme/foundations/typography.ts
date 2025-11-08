export interface TypographyScale {
  fontFamily: string
  body: number
  bodyLineHeight: number
  small: number
  smallLineHeight: number
  h1: number
  h1LineHeight: number
  h2: number
  h2LineHeight: number
  h3: number
  h3LineHeight: number
  h4: number
  h4LineHeight: number
  h5: number
  h5LineHeight: number
}

export const typographyScale: TypographyScale = {
  fontFamily: `Inter, "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif`,
  body: 14,
  bodyLineHeight: 1.45,
  small: 12,
  smallLineHeight: 1.4,
  h1: 32,
  h1LineHeight: 1.18,
  h2: 26,
  h2LineHeight: 1.22,
  h3: 22,
  h3LineHeight: 1.28,
  h4: 18,
  h4LineHeight: 1.32,
  h5: 16,
  h5LineHeight: 1.35
}

export const buildTypographyTokens = () => ({
  fontFamily: typographyScale.fontFamily,
  fontSize: typographyScale.body,
  fontSizeSM: typographyScale.small,
  fontSizeLG: typographyScale.h5,
  fontSizeHeading1: typographyScale.h1,
  fontSizeHeading2: typographyScale.h2,
  fontSizeHeading3: typographyScale.h3,
  fontSizeHeading4: typographyScale.h4,
  fontSizeHeading5: typographyScale.h5,
  lineHeight: typographyScale.bodyLineHeight,
  lineHeightSM: typographyScale.smallLineHeight,
  lineHeightLG: 1.4,
  lineHeightHeading1: typographyScale.h1LineHeight,
  lineHeightHeading2: typographyScale.h2LineHeight,
  lineHeightHeading3: typographyScale.h3LineHeight,
  lineHeightHeading4: typographyScale.h4LineHeight,
  lineHeightHeading5: typographyScale.h5LineHeight
})
