import React from 'react'
import { render } from '@testing-library/react-native'
import configurePrim from './prim'
import { StyleSheet, View } from 'react-native'

const sizes = {
  sm: 22,
  lg: 44,
}

const sizeClasses = {
  default: sizes,
}

const { usePrim, PrimProvider } = configurePrim({
  useDarkMode: () => 'light',
  useDeviceSizeClass: () => 'default',
  sizes: sizeClasses,
  colors: {
    light: { base: '#fff', fg: '#000' },
    dark: { base: '#000', fg: '#fff' },
  },
  borderRadii: () => ({ sm: 4, lg: 12 }),
  text: (colors, sizes) =>
    StyleSheet.create({
      body: { color: colors.fg, fontSize: sizes.sm },
      h1: { color: colors.fg, fontSize: sizes.lg },
    }),
})

const primRender = (elements: React.ReactElement) =>
  render(<PrimProvider>{elements}</PrimProvider>)

describe('prim size attributes', () => {
  it('w', () => {
    const TestComponent = () => {
      const prim = usePrim()
      return <View style={[prim.w.lg, prim.absolute]} />
    }
    const { toJSON } = primRender(<TestComponent />)
    expect(toJSON()).toMatchInlineSnapshot(`
      <View
        style={
          Array [
            Registered { "width": 44 },
            Registered { "position": "absolute" },
          ]
        }
      />
    `)
  })
})
