import { colors } from './colors'
import { spacing } from './spacing'
import { fontWeight, fontSize } from './font'
import { borderRadius, borderWidth } from './border'
import { useDarkMode } from './useDarkMode'
import { ScreenSize, useScreenSize } from './ScreenSize'

const defaultOptions = {
  colors,
  spacing,
  fontWeight,
  fontSize,
  borderRadius,
  borderWidth,
  useDarkMode,
  useScreenSize,
  screenSizes: ScreenSize,
}

export default defaultOptions
