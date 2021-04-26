import React, { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { render } from '@testing-library/react-native'
import configurePrim from '../configurePrim'
import { StyleSheet, View, Text } from 'react-native'

enum ScreenSize {
  se = 'se',
  x = 'x',
  tablet = 'tablet',
}
const spacing = {
  px: StyleSheet.hairlineWidth,
  sm: 22,
  lg: 44,
} as const

const borderWidth = {
  hairline: StyleSheet.hairlineWidth,
  sm: 1,
} as const

function testHooks(
  initialMode: 'light' | 'dark',
  initialScreenSize: ScreenSize,
) {
  // light/dark mode
  let setModeHook: ((mode: 'light' | 'dark') => void) | undefined
  function setMode(mode: 'light' | 'dark') {
    expect(setMode).toBeTruthy()
    act(() => setModeHook && setModeHook(mode))
  }

  // size class
  let setScreenSizeHook: ((sizeClass: ScreenSize) => void) | undefined
  function setScreenSize(sizeClass: ScreenSize) {
    expect(setScreenSizeHook).toBeTruthy()
    act(() => setScreenSizeHook && setScreenSizeHook(sizeClass))
  }

  return {
    setMode,
    useDarkMode: () => {
      const [mode, setMode] = useState<'light' | 'dark'>(initialMode)
      setModeHook = setMode
      return mode
    },
    setScreenSize,
    useScreenSize: (): ScreenSize => {
      const [sizeClass, setScreenSize] = useState<ScreenSize>(initialScreenSize)
      setScreenSizeHook = setScreenSize
      return sizeClass
    },
  }
}

function testOptions(
  initialMode: 'light' | 'dark',
  initialScreenSize: ScreenSize,
) {
  const { useDarkMode, useScreenSize, ...setters } = testHooks(
    initialMode,
    initialScreenSize,
  )
  return {
    options: {
      useScreenSize,
      useDarkMode,
      screenSizes: ScreenSize,
      spacing,
      colors: {
        light: { base: '#fff', trim: '#ddd', fg: '#000' },
        dark: { base: '#000', trim: '#333', fg: '#fff' },
      },
      borderRadius: { sm: 4, lg: 12 } as const,
      borderWidth,
      fontSize: { body: 14, title: 24 } as const,
      fontWeight: { regular: '400', bold: '600' } as const,
    },
    ...setters,
  }
}

function renderUsePrim(
  mode: 'light' | 'dark' = 'light',
  screenSize: ScreenSize = ScreenSize.se,
) {
  const { options, ...setters } = testOptions(mode, screenSize)
  const { PrimProvider, usePrim } = configurePrim(options)
  return {
    ...renderHook(() => usePrim(), { wrapper: PrimProvider }),
    ...setters,
  }
}

describe('usePrim', () => {
  it('styles light mode se sizeClass', () => {
    const { result } = renderUsePrim()
    expect(result.current).toMatchSnapshot()
  })

  it('styles dark mode x sizeClass', () => {
    const { result } = renderUsePrim('dark', ScreenSize.x)
    expect(result.current).toMatchSnapshot()
  })

  it('styles light mode tablet sizeClass', () => {
    const { result } = renderUsePrim('light', ScreenSize.tablet)
    expect(result.current).toMatchSnapshot()
  })

  it('updates styles w/ useDarkMode()', () => {
    const { result, setMode } = renderUsePrim()
    expect(result.current).toMatchObject({
      bg: {
        base: { backgroundColor: '#fff' },
        fg: { backgroundColor: '#000' },
      },
      border: { fg: { borderColor: '#000' } },
    })
    setMode('dark')
    expect(result.current).toMatchObject({
      bg: {
        base: { backgroundColor: '#000' },
        fg: { backgroundColor: '#fff' },
      },
      border: { fg: { borderColor: '#fff' } },
    })
    setMode('light')
    expect(result.current).toMatchObject({
      bg: {
        base: { backgroundColor: '#fff' },
        fg: { backgroundColor: '#000' },
      },
      border: { fg: { borderColor: '#000' } },
    })
  })

  it('size variant specific styles w/ useDeviceSizeClass()', () => {
    const { result, setScreenSize } = renderUsePrim()
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: { width: 22 } } },
      x: { w: { sm: undefined } },
      tablet: { w: { sm: undefined } },
    })
    setScreenSize(ScreenSize.tablet)
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: undefined } },
      x: { w: { sm: undefined } },
      tablet: { w: { sm: { width: 22 } } },
    })
    setScreenSize(ScreenSize.x)
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: undefined } },
      x: { w: { sm: { width: 22 } } },
      tablet: { w: { sm: undefined } },
    })
    setScreenSize(ScreenSize.se)
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: { width: 22 } } },
      x: { w: { sm: undefined } },
      tablet: { w: { sm: undefined } },
    })
  })
})

const { options, setMode, setScreenSize } = testOptions(
  'dark',
  ScreenSize.tablet,
)
const { PrimProvider, primmed } = configurePrim(options)

function renderPrimped(component: Parameters<typeof render>[0]) {
  return render(component, { wrapper: PrimProvider })
}

describe('primmed', () => {
  it('includes primmed styles + style props', () => {
    const Card = primmed(View, (prm) => [
      prm.se.border.trim,
      prm.x.borderLeft.fg,
      prm.border.sm,
      prm.minH.lg,
      prm.tablet.border.sm,
    ])
    const { toJSON } = renderPrimped(
      <Card style={{ backgroundColor: 'coral' }} />,
    )
    expect(toJSON()).toMatchInlineSnapshot(`
      <View
        style={
          Array [
            Array [
              undefined,
              undefined,
              StyleSheet {
                "borderWidth": 1,
              },
              StyleSheet {
                "minHeight": 44,
              },
              StyleSheet {
                "borderWidth": 1,
              },
            ],
            Object {
              "backgroundColor": "coral",
            },
          ]
        }
      />
    `)
    setScreenSize(ScreenSize.x)
    setMode('light')
    expect(toJSON()).toMatchInlineSnapshot(`
      <View
        style={
          Array [
            Array [
              undefined,
              StyleSheet {
                "borderLeftColor": "#000",
              },
              StyleSheet {
                "borderWidth": 1,
              },
              StyleSheet {
                "minHeight": 44,
              },
              undefined,
            ],
            Object {
              "backgroundColor": "coral",
            },
          ]
        }
      />
    `)
  })

  it('forwards refs', () => {
    const op = jest.fn()
    class Impairative extends React.Component {
      impairativeOp = op

      render() {
        return <View />
      }
    }

    const PrimpedImpairative = primmed(Impairative, (prm) => [prm.bg.base])
    renderPrimped(
      <PrimpedImpairative ref={(ref) => ref && ref.impairativeOp(42)} />,
    )
    expect(op).toHaveBeenCalledWith(42)
  })

  it('hoists non-react statics', () => {
    interface FragmentComponent extends React.FC {
      fragments: Record<string, string>
    }

    const userGQLFragments = { user: 'fragment AvatarUser on User { id }' }
    const Avatar: FragmentComponent = () => <View />
    Avatar.fragments = userGQLFragments

    expect(primmed(Avatar, (prm) => prm.flex.one).fragments).toEqual(
      userGQLFragments,
    )
  })
})

describe('Custom Atoms', () => {
  it('includes custom atoms in the prim theme', () => {
    const { options, setScreenSize, setMode } = testOptions(
      'dark',
      ScreenSize.tablet,
    )
    const { PrimProvider, primmed } = configurePrim(options, (prim) => ({
      h1: [prim.text.fg, prim.tablet.maxW.lg, prim.se.maxW.sm],
    }))

    const H1 = primmed(Text, (prim) => prim.h1)
    const { toJSON } = render(<H1>Hello!</H1>, { wrapper: PrimProvider })
    expect(toJSON()).toMatchInlineSnapshot(`
      <Text
        style={
          Array [
            Array [
              StyleSheet {
                "color": "#fff",
              },
              StyleSheet {
                "maxWidth": 44,
              },
              undefined,
            ],
            undefined,
          ]
        }
      >
        Hello!
      </Text>
    `)

    setScreenSize(ScreenSize.se)
    setMode('light')
    expect(toJSON()).toMatchInlineSnapshot(`
      <Text
        style={
          Array [
            Array [
              StyleSheet {
                "color": "#000",
              },
              undefined,
              StyleSheet {
                "maxWidth": 22,
              },
            ],
            undefined,
          ]
        }
      >
        Hello!
      </Text>
    `)
  })
})
