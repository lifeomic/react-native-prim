import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { Component, useContext } from 'react'
import { StyleProp, StyleSheet, TextStyle, ViewStyle } from 'react-native'
import { useMemoOne } from 'use-memo-one'

interface Children {
  children?: React.ReactNode
}

// It might be useful to separate the Prim types from the function, but the
// inference is nice, and the types are less abbreviated during useage this way.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function configurePrim<
  Colors extends Record<string, TextStyle['color']>,
  SizeClass extends string,
  Sizes extends Record<string, ViewStyle['width']>,
  TextCategories extends Record<string, TextStyle>,
  BorderRadii extends Record<string, ViewStyle['borderRadius']>
>(config: {
  useDarkMode: () => 'light' | 'dark'
  colors: { light: Colors; dark: Colors }
  sizes: { [c in SizeClass]: Sizes }
  // useDeviceSizeClass is between experimental and half-baked idea on the fit-
  // for-use spectrum
  useDeviceSizeClass: () => SizeClass
  text: (colors: Colors, sizes: Sizes) => TextCategories
  borderRadii: (sizes: Sizes) => BorderRadii
}) {
  function ssWithValuesForAttribute<
    Attribute extends keyof ViewStyle | keyof TextStyle,
    Config extends Record<string, any>
  >(subConfig: Config, attribute: Attribute) {
    return StyleSheet.create<
      {
        [c in keyof Config]: {
          [ca in Attribute]: Config[c]
        }
      }
    >({
      ...(Object.entries(subConfig)
        .map(([name, size]) => ({ [name]: { [attribute]: size } }))
        // `any` is needed here because `Object.entries` erases the key type
        .reduce((styles, style) => ({ ...styles, ...style }), {}) as any),
    })
  }

  function primTheme(
    mode: 'light' | 'dark',
    colors: Colors,
    sizeClass: SizeClass,
    sizes: Sizes,
  ) {
    function ssForForAttributeWithRelativeSizes<
      Attribute extends keyof ViewStyle | keyof TextStyle
    >(attribute: Attribute) {
      return {
        ...ssWithValuesForAttribute(sizes, attribute),
        ...StyleSheet.create({
          full: { [attribute]: '100%' as const },
          half: { [attribute]: '50%' as const },
        }),
      }
    }

    const textColors = ssWithValuesForAttribute(colors, 'color')
    const textStyles = config.text(colors, sizes)
    return {
      mode,
      sizeClass,
      colors,
      flex: StyleSheet.create({
        one: {
          flex: 1 as const,
        },
        row: {
          flexDirection: 'row',
        },
        rowR: {
          flexDirection: 'row-reverse',
        },
        col: {
          flexDirection: 'column',
        },
        colR: {
          flexDirection: 'column-reverse',
        },
        wrap: { flexWrap: 'wrap' },
      }),
      flexGrow: StyleSheet.create({
        one: {
          flexGrow: 1 as const,
        },
        zero: {
          flexGrow: 0 as const,
        },
      }),
      items: StyleSheet.create({
        stretch: { alignItems: 'stretch' },
        start: { alignItems: 'flex-start' },
        center: { alignItems: 'center' },
        end: { alignItems: 'flex-end' },
        baseline: { alignItems: 'baseline' },
      }),
      self: StyleSheet.create({
        auto: { alignSelf: 'auto' },
        start: { alignSelf: 'flex-start' },
        center: { alignSelf: 'center' },
        end: { alignSelf: 'flex-end' },
        stretch: { alignSelf: 'stretch' },
      }),
      justify: StyleSheet.create({
        start: { justifyContent: 'flex-start' },
        center: { justifyContent: 'center' },
        end: { justifyContent: 'flex-end' },
        between: { justifyContent: 'space-between' },
        around: { justifyContent: 'space-around' },
      }),
      overflow: StyleSheet.create({
        hidden: { overflow: 'hidden' },
        visible: { overflow: 'visible' },
        scroll: { overflow: 'scroll' },
      }),
      bg: ssWithValuesForAttribute(colors, 'backgroundColor'),
      border: {
        color: ssWithValuesForAttribute(colors, 'borderColor'),
        width: ssWithValuesForAttribute(sizes, 'borderWidth'),
      },
      borderTop: {
        color: ssWithValuesForAttribute(colors, 'borderTopColor'),
        width: ssWithValuesForAttribute(sizes, 'borderTopWidth'),
      },
      borderBottom: {
        color: ssWithValuesForAttribute(colors, 'borderBottomColor'),
        width: ssWithValuesForAttribute(sizes, 'borderBottomWidth'),
      },
      borderRight: {
        color: ssWithValuesForAttribute(colors, 'borderRightColor'),
        width: ssWithValuesForAttribute(sizes, 'borderRightWidth'),
      },
      borderLeft: {
        color: ssWithValuesForAttribute(colors, 'borderLeftColor'),
        width: ssWithValuesForAttribute(sizes, 'borderLeftWidth'),
      },
      font: StyleSheet.create({
        medium: { fontWeight: '500' },
        semiBold: { fontWeight: '600' },
        bold: { fontWeight: '700' },
        italic: { fontStyle: 'italic' },
      }),
      text: {
        color: textColors,
        ...StyleSheet.create({
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
        ...textStyles,
      },

      // padding
      p: ssForForAttributeWithRelativeSizes('padding'),
      py: ssForForAttributeWithRelativeSizes('paddingVertical'),
      pt: ssForForAttributeWithRelativeSizes('paddingTop'),
      px: ssForForAttributeWithRelativeSizes('paddingHorizontal'),
      pb: ssForForAttributeWithRelativeSizes('paddingBottom'),
      ps: ssForForAttributeWithRelativeSizes('paddingStart'),
      pe: ssForForAttributeWithRelativeSizes('paddingEnd'),

      // margin
      m: ssForForAttributeWithRelativeSizes('margin'),
      mx: ssForForAttributeWithRelativeSizes('marginHorizontal'),
      my: ssForForAttributeWithRelativeSizes('marginVertical'),
      mt: ssForForAttributeWithRelativeSizes('marginTop'),
      mb: ssForForAttributeWithRelativeSizes('marginBottom'),
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
        config.borderRadii(sizes),
        'borderRadius',
      ),

      ...StyleSheet.create({
        absolute: { position: 'absolute' },
        relative: { position: 'relative' },
      }),
    }
  }

  type PrimTheme = ReturnType<typeof primTheme>
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
    const sizeClass = config.useDeviceSizeClass()
    const sizes = config.sizes[sizeClass]

    const prim = useMemoOne(() => primTheme(mode, colors, sizeClass, sizes), [
      mode,
      colors,
      sizeClass,
      sizes,
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
