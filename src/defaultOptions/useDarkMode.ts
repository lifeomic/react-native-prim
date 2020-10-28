import { useColorScheme } from 'react-native'

export const useDarkMode = (): 'dark' | 'light' => {
  const scheme = useColorScheme()
  if (scheme === 'dark') {
    return 'dark'
  }
  return 'light'
}
