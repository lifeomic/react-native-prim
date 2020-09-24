import React, { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'
import { render } from '@testing-library/react-native'
import configurePrim from './prim'
import { StyleSheet, View } from 'react-native'

const sizeClasses = {
  se: {
    px: StyleSheet.hairlineWidth,
    sm: 22,
    lg: 44,
  },
  x: {
    px: StyleSheet.hairlineWidth,
    sm: 32,
    lg: 64,
  },
  tablet: {
    px: StyleSheet.hairlineWidth,
    sm: 44,
    lg: 72,
  },
}

type SizeClass = keyof typeof sizeClasses

function testPrim(initialMode: 'light' | 'dark', initialSizeClass: SizeClass) {
  // light/dark mode
  let setModeHook: ((mode: 'light' | 'dark') => void) | undefined
  function setMode(mode: 'light' | 'dark') {
    expect(setMode).toBeTruthy()
    act(() => setModeHook(mode))
  }

  // size class
  let setSizeClassHook: ((sizeClass: SizeClass) => void) | undefined
  function setSizeClass(sizeClass: SizeClass) {
    expect(setSizeClassHook).toBeTruthy()
    act(() => setSizeClassHook(sizeClass))
  }

  return {
    ...configurePrim({
      useDarkMode: () => {
        const [mode, setMode] = useState<'light' | 'dark'>(initialMode)
        setModeHook = setMode
        return mode
      },
      useDeviceSizeClass: () => {
        const [sizeClass, setSizeClass] = useState<SizeClass>(initialSizeClass)
        setSizeClassHook = setSizeClass
        return sizeClass
      },

      sizes: sizeClasses,
      colors: {
        light: { base: '#fff', trim: '#ddd', fg: '#000' },
        dark: { base: '#000', trim: '#333', fg: '#fff' },
      },
      borderRadii: () => ({ sm: 4, lg: 12 }),
      text: (colors, sizes) =>
        StyleSheet.create({
          body: { color: colors.fg, fontSize: sizes.sm },
          h1: { color: colors.fg, fontSize: sizes.lg },
        }),
    }),
    setMode,
    setSizeClass,
  }
}

function renderUsePrim(
  mode: 'light' | 'dark' = 'light',
  sizeClass: SizeClass = 'se',
) {
  const { PrimProvider, usePrim, ...testAPI } = testPrim(mode, sizeClass)
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
    const { result } = renderUsePrim('dark', 'x')
    expect(result.current).toMatchSnapshot()
  })

  it('styles light mode tablet sizeClass', () => {
    const { result } = renderUsePrim('light', 'tablet')
    expect(result.current).toMatchSnapshot()
  })

  it('updates styles w/ useDarkMode()', () => {
    const { result, setMode } = renderUsePrim()
    expect(result.current).toMatchObject({
      bg: {
        base: { backgroundColor: '#fff' },
        fg: { backgroundColor: '#000' },
      },
      border: { color: { fg: { borderColor: '#000' } } },
    })
    setMode('dark')
    expect(result.current).toMatchObject({
      bg: {
        base: { backgroundColor: '#000' },
        fg: { backgroundColor: '#fff' },
      },
      border: { color: { fg: { borderColor: '#fff' } } },
    })
    setMode('light')
    expect(result.current).toMatchObject({
      bg: {
        base: { backgroundColor: '#fff' },
        fg: { backgroundColor: '#000' },
      },
      border: { color: { fg: { borderColor: '#000' } } },
    })
  })

  it('updates styles w/ useDeviceSizeClass()', () => {
    const { result, setSizeClass } = renderUsePrim()
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      ps: { lg: { paddingStart: 44 } },
    })
    setSizeClass('tablet')
    expect(result.current).toMatchObject({
      w: { sm: { width: 44 } },
      ps: { lg: { paddingStart: 72 } },
    })
    setSizeClass('x')
    expect(result.current).toMatchObject({
      w: { sm: { width: 32 } },
      ps: { lg: { paddingStart: 64 } },
    })
    setSizeClass('se')
    expect(result.current).toMatchObject({
      w: { sm: { width: 22 } },
      ps: { lg: { paddingStart: 44 } },
    })
  })
})

const { PrimProvider, primp, setMode, setSizeClass } = testPrim(
  'dark',
  'tablet',
)

function renderPrimped(component: Parameters<typeof render>[0]) {
  return render(component, { wrapper: PrimProvider })
}

describe('primp', () => {
  it('includes primped styles + style props', () => {
    const Card = primp(View, (prm) => [
      prm.border.color.trim,
      prm.borderLeft.color.fg,
      prm.border.width.px,
      prm.minH.lg,
    ])
    const { toJSON } = renderPrimped(
      <Card style={{ backgroundColor: 'coral' }} />,
    )
    expect(toJSON()).toMatchInlineSnapshot(`
      <View
        style={
          Array [
            Array [
              Registered { "borderColor": "#333" },
              Registered { "borderLeftColor": "#fff" },
              Registered { "borderWidth": 0.5 },
              Registered { "minHeight": 72 },
            ],
            Object {
              "backgroundColor": "coral",
            },
          ]
        }
      />
    `)
    setSizeClass('x')
    setMode('light')
    expect(toJSON()).toMatchInlineSnapshot(`
      <View
        style={
          Array [
            Array [
              Registered { "borderColor": "#ddd" },
              Registered { "borderLeftColor": "#000" },
              Registered { "borderWidth": 0.5 },
              Registered { "minHeight": 64 },
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

    const PrimpedImpairative = primp(Impairative, (prm) => [prm.bg.base])
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

    expect(primp(Avatar, (prm) => prm.flex.one).fragments).toEqual(
      userGQLFragments,
    )
  })
})
