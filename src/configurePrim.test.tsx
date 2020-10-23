import React, { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { render } from '@testing-library/react-native'
import configurePrim from './configurePrim'
import { StyleSheet, View } from 'react-native'

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

function testPrim(
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
  let setSizeClassHook: ((sizeClass: ScreenSize) => void) | undefined
  function setSizeClass(sizeClass: ScreenSize) {
    expect(setSizeClassHook).toBeTruthy()
    act(() => setSizeClassHook && setSizeClassHook(sizeClass))
  }

  return {
    ...configurePrim({
      useDarkMode: () => {
        const [mode, setMode] = useState<'light' | 'dark'>(initialMode)
        setModeHook = setMode
        return mode
      },
      useScreenSize: (): ScreenSize => {
        const [sizeClass, setSizeClass] = useState<ScreenSize>(
          initialScreenSize,
        )
        setSizeClassHook = setSizeClass
        return sizeClass
      },
      screenSizes: ScreenSize,
      spacing,
      colors: {
        light: { base: '#fff', trim: '#ddd', fg: '#000' },
        dark: { base: '#000', trim: '#333', fg: '#fff' },
      },
      borderRadius: { sm: 4, lg: 12 },
      fontSize: { body: 14, title: 24 },
      fontWeight: { regular: '400', bold: '600' },
    }),
    setMode,
    setSizeClass,
  }
}

function renderUsePrim(
  mode: 'light' | 'dark' = 'light',
  screenSize: ScreenSize = ScreenSize.se,
) {
  const { PrimProvider, usePrim, ...testAPI } = testPrim(mode, screenSize)
  return {
    ...renderHook(() => usePrim(), { wrapper: PrimProvider }),
    ...testAPI,
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
    const { result, setSizeClass } = renderUsePrim()
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: { width: 22 } } },
      x: { w: { sm: undefined } },
      tablet: { w: { sm: undefined } },
    })
    setSizeClass(ScreenSize.tablet)
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: undefined } },
      x: { w: { sm: undefined } },
      tablet: { w: { sm: { width: 22 } } },
    })
    setSizeClass(ScreenSize.x)
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: undefined } },
      x: { w: { sm: { width: 22 } } },
      tablet: { w: { sm: undefined } },
    })
    setSizeClass(ScreenSize.se)
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      se: { w: { sm: { width: 22 } } },
      x: { w: { sm: undefined } },
      tablet: { w: { sm: undefined } },
    })
  })
})

const { PrimProvider, primmed, setMode, setSizeClass } = testPrim(
  'dark',
  ScreenSize.tablet,
)

function renderPrimped(component: Parameters<typeof render>[0]) {
  return render(component, { wrapper: PrimProvider })
}

describe('primp', () => {
  it('includes primped styles + style props', () => {
    const Card = primmed(View, (prm) => [
      prm.se.border.trim,
      prm.x.borderLeft.fg,
      prm.border.px,
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
                "borderWidth": 0.5,
              },
              StyleSheet {
                "minHeight": 44,
              },
              StyleSheet {
                "borderWidth": 22,
              },
            ],
            Object {
              "backgroundColor": "coral",
            },
          ]
        }
      />
    `)
    setSizeClass(ScreenSize.x)
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
                "borderWidth": 0.5,
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
