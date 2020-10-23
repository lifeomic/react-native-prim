import { StyleSheet } from 'react-native'

export const borderRadius = {
  none: 0,
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  xxxl: 24,
} as const

export const borderWidth = {
  none: 0,
  hairline: StyleSheet.hairlineWidth,
  sm: 1,
  md: 2,
  lg: 4,
  xl: 8,
}
