import React, { Component, useContext } from 'react'
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { useMemoOne } from 'use-memo-one'

type StringValueEnum = {
  [id: string]: string
}

type CreateStyleSheet = typeof StyleSheet.create

const disabledStyleSheet: CreateStyleSheet = function <
  T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>
>(styles: T | StyleSheet.NamedStyles<T>): T {
  return Object.entries(styles).reduce(
    (styles, [key]) => ({
      ...styles,
      [key]: undefined,
    }),
    {},
  ) as T
}

interface Children {
  children?: React.ReactNode
}

// It might be useful to separate the Prim types from the function, but the
// inference is nice, and the types are less abbreviated during useage this way.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function configurePrim<
  Colors extends Record<string, TextStyle['color']>,
  ScreenSize extends StringValueEnum,
  Sizes extends Record<string, ViewStyle['width']>,
  BorderRadii extends Record<string, ViewStyle['borderRadius']>
>(config: {
  useDarkMode: () => 'light' | 'dark'
  colors: { light: Colors; dark: Colors }
  screenSizes: ScreenSize
  sizes: Sizes
  // useDeviceSizeClass is between experimental and half-baked idea on the fit-
  // for-use spectrum
  useScreenSize: () => keyof ScreenSize
  borderRadii: (sizes: Sizes) => BorderRadii
}) {
  function primStyles(colors: Colors, ss: CreateStyleSheet) {
    function ssWithValuesForAttribute<
      Attribute extends keyof ViewStyle | keyof TextStyle,
      SubConfig extends Record<string, any>
    >(subConfigs: SubConfig, attribute: Attribute) {
      return ss<
        {
          [c in keyof SubConfig]: {
            [ca in Attribute]: SubConfig[c]
          }
        }
      >({
        ...(Object.entries(subConfigs)
          .map(([name, size]) => ({
            [name]: { [attribute]: size },
          }))
          // `any` is needed here because `Object.entries` erases the key type
          .reduce((styles, style) => ({ ...styles, ...style }), {}) as any),
      })
    }
    function ssForForAttributeWithRelativeSizes<
      Attribute extends keyof ViewStyle | keyof TextStyle
    >(attribute: Attribute) {
      return {
        ...ssWithValuesForAttribute(config.sizes, attribute),
        ...ss({
          full: { [attribute]: '100%' as const },
          half: { [attribute]: '50%' as const },
        }),
      }
    }

    return {
      colors,
      flex: ss({
        one: { flex: 1 as const },
        row: { flexDirection: 'row' },
        rowR: { flexDirection: 'row-reverse' },
        col: { flexDirection: 'column' },
        colR: { flexDirection: 'column-reverse' },
        wrap: { flexWrap: 'wrap' },
        noWrap: { flexWrap: 'nowrap' },
        grow: { flexGrow: 1 as const },
        grow0: { flexGrow: 0 as const },
        shrink: { flexShrink: 1 as const },
        shrink0: { flexShrink: 0 as const },
      }),
      items: ss({
        stretch: { alignItems: 'stretch' },
        start: { alignItems: 'flex-start' },
        center: { alignItems: 'center' },
        end: { alignItems: 'flex-end' },
        baseline: { alignItems: 'baseline' },
      }),
      self: ss({
        auto: { alignSelf: 'auto' },
        start: { alignSelf: 'flex-start' },
        center: { alignSelf: 'center' },
        end: { alignSelf: 'flex-end' },
        stretch: { alignSelf: 'stretch' },
      }),
      content: ss({
        center: { alignContent: 'center' },
        start: { alignContent: 'flex-start' },
        end: { alignContent: 'flex-end' },
        between: { alignContent: 'space-between' },
        around: { alignContent: 'space-around' },
        stretch: { alignContent: 'stretch' },
      }),
      justify: ss({
        start: { justifyContent: 'flex-start' },
        center: { justifyContent: 'center' },
        end: { justifyContent: 'flex-end' },
        between: { justifyContent: 'space-between' },
        around: { justifyContent: 'space-around' },
        evenly: { justifyContent: 'space-evenly' },
      }),
      overflow: ss({
        hidden: { overflow: 'hidden' },
        visible: { overflow: 'visible' },
        scroll: { overflow: 'scroll' },
      }),
      bg: ssWithValuesForAttribute(colors, 'backgroundColor'),
      border: {
        color: ssWithValuesForAttribute(colors, 'borderColor'),
        width: ssWithValuesForAttribute(config.sizes, 'borderWidth'),
      },
      borderTop: {
        color: ssWithValuesForAttribute(colors, 'borderTopColor'),
        width: ssWithValuesForAttribute(config.sizes, 'borderTopWidth'),
      },
      borderBottom: {
        color: ssWithValuesForAttribute(colors, 'borderBottomColor'),
        width: ssWithValuesForAttribute(config.sizes, 'borderBottomWidth'),
      },
      borderRight: {
        color: ssWithValuesForAttribute(colors, 'borderRightColor'),
        width: ssWithValuesForAttribute(config.sizes, 'borderRightWidth'),
      },
      borderLeft: {
        color: ssWithValuesForAttribute(colors, 'borderLeftColor'),
        width: ssWithValuesForAttribute(config.sizes, 'borderLeftWidth'),
      },
      font: ss({
        medium: { fontWeight: '500' },
        semiBold: { fontWeight: '600' },
        bold: { fontWeight: '700' },
        italic: { fontStyle: 'italic' },
      }),
      text: {
        color: ssWithValuesForAttribute(colors, 'color'),
        ...ss({
          left: { textAlign: 'left' },
          center: { textAlign: 'center' },
          right: { textAlign: 'right' },
          justify: { textAlign: 'justify' },
          underline: {
            textDecorationStyle: 'solid',
            textDecorationLine: 'underline',
          },
          lineThrough: {
            textDecorationStyle: 'solid',
            textDecorationLine: 'line-through',
          },
          noUnderline: {
            textDecorationLine: 'none',
          },
          uppercase: {
            textTransform: 'uppercase',
          },
          lowercase: {
            textTransform: 'lowercase',
          },
          capitalize: {
            textTransform: 'capitalize',
          },
          noTextTransform: {
            textTransform: 'none',
          },
        }),
      },

      // padding
      p: ssForForAttributeWithRelativeSizes('padding'),
      px: ssForForAttributeWithRelativeSizes('paddingHorizontal'),
      py: ssForForAttributeWithRelativeSizes('paddingVertical'),
      pt: ssForForAttributeWithRelativeSizes('paddingTop'),
      pr: ssForForAttributeWithRelativeSizes('paddingRight'),
      pb: ssForForAttributeWithRelativeSizes('paddingBottom'),
      pl: ssForForAttributeWithRelativeSizes('paddingLeft'),
      ps: ssForForAttributeWithRelativeSizes('paddingStart'),
      pe: ssForForAttributeWithRelativeSizes('paddingEnd'),

      // margin
      m: ssForForAttributeWithRelativeSizes('margin'),
      mx: ssForForAttributeWithRelativeSizes('marginHorizontal'),
      my: ssForForAttributeWithRelativeSizes('marginVertical'),
      mt: ssForForAttributeWithRelativeSizes('marginTop'),
      mr: ssForForAttributeWithRelativeSizes('marginRight'),
      mb: ssForForAttributeWithRelativeSizes('marginBottom'),
      ml: ssForForAttributeWithRelativeSizes('marginLeft'),
      ms: ssForForAttributeWithRelativeSizes('marginStart'),
      me: ssForForAttributeWithRelativeSizes('marginEnd'),

      // sizing
      w: ssForForAttributeWithRelativeSizes('width'),
      minW: ssForForAttributeWithRelativeSizes('minWidth'),
      maxW: ssForForAttributeWithRelativeSizes('maxWidth'),
      h: ssForForAttributeWithRelativeSizes('height'),
      minH: ssForForAttributeWithRelativeSizes('minHeight'),
      maxH: ssForForAttributeWithRelativeSizes('maxHeight'),

      rounded: ssWithValuesForAttribute(
        config.borderRadii(config.sizes),
        'borderRadius',
      ),

      ...ss({
        absolute: { position: 'absolute' },
        relative: { position: 'relative' },
      }),

      ...ss({
        z00: { zIndex: 0 },
        z10: { zIndex: 10 },
        z20: { zIndex: 20 },
        z30: { zIndex: 30 },
        z40: { zIndex: 40 },
        z50: { zIndex: 50 },
      }),

      inset: ss({
        zero: {
          top: 0 as const,
          right: 0 as const,
          bottom: 0 as const,
          left: 0 as const,
        },
        x0: {
          right: 0,
          left: 0,
        },
        y0: {
          top: 0,
          bottom: 0,
        },
        top0: {
          top: 0,
        },
        right0: {
          top: 0,
        },
        bottom0: {
          top: 0,
        },
        left0: {
          top: 0,
        },
      }),
    }
  }

  type PrimStyles = ReturnType<typeof primStyles>
  type PrimTheme = {
    mode: 'light' | 'dark'
    screenSize: keyof ScreenSize
  } & PrimStyles &
    {
      [v in keyof ScreenSize]: PrimStyles
    }

  function primTheme(
    currentMode: 'light' | 'dark',
    currentVariant: keyof ScreenSize,
    colors: Colors,
  ): PrimTheme {
    const onPrimStyles = primStyles(colors, StyleSheet.create)
    const offPrimStyles = primStyles(colors, disabledStyleSheet)
    const screenSizeStyles = Object.keys(config.screenSizes).reduce(
      (screenSizes, screenSize) => ({
        ...screenSizes,
        [screenSize]:
          screenSize === currentVariant ? onPrimStyles : offPrimStyles,
      }),
      {},
    ) as {
      [k in keyof ScreenSize]: PrimStyles
    }
    return {
      mode: currentMode,
      screenSize: currentVariant,
      ...onPrimStyles,
      ...screenSizeStyles,
    }
  }

  const PrimContext = React.createContext<null | PrimTheme>(null)
  const usePrim = () => {
    // the exported PrimProvider does not allow the PrimeTheme to be null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const primTheme = useContext(PrimContext)!
    return primTheme
  }

  const PrimProvider: React.FC = ({ children }) => {
    const mode = config.useDarkMode()
    const colors = config.colors[mode]
    const screenSize = config.useScreenSize()

    const prim = useMemoOne(() => primTheme(mode, screenSize, colors), [
      mode,
      colors,
      screenSize,
    ])

    return <PrimContext.Provider value={prim}>{children}</PrimContext.Provider>
  }

  function primp<
    P extends { style?: StyleProp<TextStyle> },
    T extends React.ComponentClass<P>
  >(
    Component: T,
    styles: (prim: PrimTheme) => StyleProp<TextStyle>,
  ): React.ForwardRefExoticComponent<
    P & Children & { ref?: React.Ref<InstanceType<T>> }
  > &
    hoistNonReactStatics.NonReactStatics<T>
  function primp<
    P extends { style?: StyleProp<any> },
    T extends React.ComponentClass<P>
  >(
    Component: T,
    styles: (prim: PrimTheme) => StyleProp<ViewStyle>,
  ): React.ForwardRefExoticComponent<
    P & Children & { ref?: React.Ref<InstanceType<T>> }
  > &
    hoistNonReactStatics.NonReactStatics<T>
  function primp<
    P extends { ref?: React.Ref<T>; style?: StyleProp<any> },
    T extends React.ForwardRefExoticComponent<P>
  >(
    Component: React.ForwardRefExoticComponent<P>,
    styles: (prim: PrimTheme) => StyleProp<ViewStyle>,
  ): React.ForwardRefExoticComponent<P & Children> &
    hoistNonReactStatics.NonReactStatics<T>
  function primp<P extends { style?: StyleProp<any> }, T extends React.FC<P>>(
    Component: T,
    styles: (prim: PrimTheme) => StyleProp<ViewStyle>,
  ): React.ForwardRefExoticComponent<P & Children> &
    hoistNonReactStatics.NonReactStatics<T>
  function primp<
    P extends { style?: StyleProp<any> },
    T extends React.ComponentType<P>
  >(Component: T, styles: (prim: PrimTheme) => StyleProp<ViewStyle>) {
    const PrimpedComponent: React.FC<
      P & { forwardedRef?: React.Ref<Component> }
    > = ({ forwardedRef, ...props }) => {
      const prim = usePrim()
      const primpedStyles = styles(prim)
      return (
        <Component
          {...(props as any)}
          style={[primpedStyles, props.style]}
          ref={forwardedRef}
        />
      )
    }
    PrimpedComponent.displayName = `Primped.${
      Component.displayName || Component.name
    }`

    const ForwardRefComponent = React.forwardRef((props, ref) => (
      // I don't know how to implement this without breaking out of the types.
      // The overloads are ensuring correct usage, so we should be good?
      <PrimpedComponent {...(props as any)} forwardedRef={ref} />
    ))
    return hoistNonReactStatics(ForwardRefComponent, Component)
  }

  return {
    primp,
    usePrim,
    PrimProvider,
  }
}
