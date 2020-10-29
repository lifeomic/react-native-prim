import { useWindowDimensions } from 'react-native'

export enum ScreenSize {
  mini = 'mini',
  x = 'x',
  max = 'max',
  tablet = 'tablet',
  lg = 'lg',
  xl = 'xl',
  xxl = 'xxl',
}

const sizeForWidth = (w: number): ScreenSize => {
  if (w <= 350) {
    return ScreenSize.mini
  }
  if (w <= 400) {
    return ScreenSize.x
  }
  if (w <= 500) {
    return ScreenSize.max
  }
  if (w <= 800) {
    return ScreenSize.tablet
  }
  if (w <= 1100) {
    return ScreenSize.lg
  }
  if (w <= 1300) {
    return ScreenSize.xl
  }
  return ScreenSize.xxl
}

export const useScreenSize = (): ScreenSize => {
  const { width } = useWindowDimensions()
  return sizeForWidth(width)
}
