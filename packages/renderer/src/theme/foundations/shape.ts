export interface ShapeTokens {
  radiusSM: number
  radius: number
  radiusLG: number
  radiusXL: number
  controlHeightSM: number
  controlHeight: number
  controlHeightLG: number
}

export const shapeTokens: ShapeTokens = {
  radiusSM: 6,
  radius: 8,
  radiusLG: 12,
  radiusXL: 16,
  controlHeightSM: 32,
  controlHeight: 38,
  controlHeightLG: 46
}

export const buildShapeTokenOverrides = () => ({
  borderRadiusSM: shapeTokens.radiusSM,
  borderRadius: shapeTokens.radius,
  borderRadiusLG: shapeTokens.radiusLG,
  borderRadiusOuter: shapeTokens.radiusXL,
  controlRadius: shapeTokens.radius,
  controlHeightSM: shapeTokens.controlHeightSM,
  controlHeight: shapeTokens.controlHeight,
  controlHeightLG: shapeTokens.controlHeightLG
})
