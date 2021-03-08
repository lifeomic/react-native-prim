import hoistNonReactStatics from 'hoist-non-react-statics'
import React, { useContext } from 'react'
import { TextStyle, ViewStyle, StyleSheet, StyleProp } from 'react-native'
import { useMemoOne } from 'use-memo-one'

type Children = {
  children?: React.ReactNode
}

type CreateStyleSheet = typeof StyleSheet.create

type ColorsConstraint = Record<string, ViewStyle['backgroundColor']>
type ScreenSizeConstraint = Record<string, string>
type SpacingConstraint = Record<string, ViewStyle['width']>
type BorderRadiusConstraint = Record<string, ViewStyle['borderRadius']>
type BorderWidthConstraint = Record<string, ViewStyle['borderWidth']>
type FontSizeConstraint = Record<string, TextStyle['fontSize']>
type FontWeightConstraint = Record<string, TextStyle['fontWeight']>

type PrimOptions<
  Colors extends ColorsConstraint,
  ScreenSize extends ScreenSizeConstraint,
  Spacing extends SpacingConstraint,
  BorderRadii extends BorderRadiusConstraint,
  BorderWidth extends BorderWidthConstraint,
  FontSize extends FontSizeConstraint,
  FontWeight extends FontWeightConstraint
> = {
  colors: { light: Colors; dark: Colors }
  useDarkMode: () => 'light' | 'dark'
  screenSizes: ScreenSize
  useScreenSize: () => keyof ScreenSize
  spacing: Spacing
  borderRadius: BorderRadii
  borderWidth: BorderWidth
  fontSize: FontSize
  fontWeight: FontWeight
}

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

type PrimStyles<
  C extends ColorsConstraint,
  Ss extends ScreenSizeConstraint,
  Sp extends SpacingConstraint,
  Br extends BorderRadiusConstraint,
  Bw extends BorderWidthConstraint,
  Fs extends FontSizeConstraint,
  Fw extends FontWeightConstraint
> = ReturnType<PrimConfiguration<C, Ss, Sp, Br, Bw, Fs, Fw>['primStyles']>

type PrimTheme<
  C extends ColorsConstraint,
  Ss extends ScreenSizeConstraint,
  Sp extends SpacingConstraint,
  Br extends BorderRadiusConstraint,
  Bw extends BorderWidthConstraint,
  Fs extends FontSizeConstraint,
  Fw extends FontWeightConstraint
> = PrimStyles<C, Ss, Sp, Br, Bw, Fs, Fw> &
  {
    [k in keyof Ss]: PrimStyles<C, Ss, Sp, Br, Bw, Fs, Fw>
  } & {
    mode: 'light' | 'dark'
    screenSize: keyof Ss
  }

// PrimConfiguration came about because it is not possible (as of TS 4.0.3) to
// infer the return type of a generic function.Solution: wrap the function in a
// generic class.See https://stackoverflow.com/a/59072991. For now it is merely
// an implementation detail.The public interface of Prim does not expose it.
class PrimConfiguration<
  Colors extends ColorsConstraint,
  ScreenSize extends ScreenSizeConstraint,
  Spacing extends SpacingConstraint,
  BorderRadii extends BorderRadiusConstraint,
  BorderWidth extends BorderWidthConstraint,
  FontSize extends FontSizeConstraint,
  FontWeight extends FontWeightConstraint
> {
  private readonly options: PrimOptions<
    Colors,
    ScreenSize,
    Spacing,
    BorderRadii,
    BorderWidth,
    FontSize,
    FontWeight
  >

  constructor(
    options: PrimOptions<
      Colors,
      ScreenSize,
      Spacing,
      BorderRadii,
      BorderWidth,
      FontSize,
      FontWeight
    >,
  ) {
    this.options = options
  }

  readonly primStyles = (colors: Colors, ss: CreateStyleSheet) => {
    function valuesForAttribute<
      Attribute extends keyof ViewStyle | keyof TextStyle,
      SubConfig extends Record<string, any>
    >(
      subConfigs: SubConfig,
      attribute: Attribute,
    ): {
      [c in keyof SubConfig]: {
        [ca in Attribute]: SubConfig[c]
      }
    } {
      return (
        Object.entries(subConfigs)
          .map(([name, size]) => ({
            [name]: { [attribute]: size },
          }))
          // `any` is needed here because `Object.entries` erases the key type
          .reduce((styles, style) => ({ ...styles, ...style }), {}) as any
      )
    }
    const spacingWRelativeForAttribute = <
      Attribute extends keyof ViewStyle | keyof TextStyle
    >(
      attribute: Attribute,
    ) => {
      return {
        ...valuesForAttribute(this.options.spacing, attribute),
        ['full' as const]: { [attribute]: '100%' as const },
        ['half' as const]: { [attribute]: '50%' as const },
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
      bg: ss(valuesForAttribute(colors, 'backgroundColor')),
      border: ss({
        ...valuesForAttribute(colors, 'borderColor'),
        ...valuesForAttribute(this.options.borderWidth, 'borderWidth'),
      }),
      borderTop: ss({
        ...valuesForAttribute(colors, 'borderTopColor'),
        ...valuesForAttribute(this.options.spacing, 'borderTopWidth'),
      }),
      borderBottom: ss({
        ...valuesForAttribute(colors, 'borderBottomColor'),
        ...valuesForAttribute(this.options.spacing, 'borderBottomWidth'),
      }),
      borderRight: ss({
        ...valuesForAttribute(colors, 'borderRightColor'),
        ...valuesForAttribute(this.options.spacing, 'borderRightWidth'),
      }),
      borderLeft: ss({
        ...valuesForAttribute(colors, 'borderLeftColor'),
        ...valuesForAttribute(this.options.spacing, 'borderLeftWidth'),
      }),
      font: ss({
        ...valuesForAttribute(this.options.fontWeight, 'fontWeight'),
        italic: { fontStyle: 'italic' },
      }),
      text: ss({
        ...valuesForAttribute(this.options.fontSize, 'fontSize'),
        ...valuesForAttribute(colors, 'color'),
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

      // padding
      p: ss(spacingWRelativeForAttribute('padding')),
      px: ss(spacingWRelativeForAttribute('paddingHorizontal')),
      py: ss(spacingWRelativeForAttribute('paddingVertical')),
      pt: ss(spacingWRelativeForAttribute('paddingTop')),
      pr: ss(spacingWRelativeForAttribute('paddingRight')),
      pb: ss(spacingWRelativeForAttribute('paddingBottom')),
      pl: ss(spacingWRelativeForAttribute('paddingLeft')),
      ps: ss(spacingWRelativeForAttribute('paddingStart')),
      pe: ss(spacingWRelativeForAttribute('paddingEnd')),

      // margin
      m: ss(spacingWRelativeForAttribute('margin')),
      mx: ss(spacingWRelativeForAttribute('marginHorizontal')),
      my: ss(spacingWRelativeForAttribute('marginVertical')),
      mt: ss(spacingWRelativeForAttribute('marginTop')),
      mr: ss(spacingWRelativeForAttribute('marginRight')),
      mb: ss(spacingWRelativeForAttribute('marginBottom')),
      ml: ss(spacingWRelativeForAttribute('marginLeft')),
      ms: ss(spacingWRelativeForAttribute('marginStart')),
      me: ss(spacingWRelativeForAttribute('marginEnd')),

      // sizing
      w: ss(spacingWRelativeForAttribute('width')),
      minW: ss(spacingWRelativeForAttribute('minWidth')),
      maxW: ss(spacingWRelativeForAttribute('maxWidth')),
      h: ss(spacingWRelativeForAttribute('height')),
      minH: ss(spacingWRelativeForAttribute('minHeight')),
      maxH: ss(spacingWRelativeForAttribute('maxHeight')),

      rounded: ss(
        valuesForAttribute(this.options.borderRadius, 'borderRadius'),
      ),

      pos: ss({
        absolute: { position: 'absolute' },
        relative: { position: 'relative' },
      }),

      z: ss({
        [0]: { zIndex: 0 },
        [10]: { zIndex: 10 },
        [20]: { zIndex: 20 },
        [30]: { zIndex: 30 },
        [40]: { zIndex: 40 },
        [50]: { zIndex: 50 },
      } as const),

      inset: ss({
        zero: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
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
      } as const),
    }
  }

  readonly createPrimThemeHook: () => () => PrimTheme<
    Colors,
    ScreenSize,
    Spacing,
    BorderRadii,
    BorderWidth,
    FontSize,
    FontWeight
  > = () => {
    type Styles = PrimStyles<
      Colors,
      ScreenSize,
      Spacing,
      BorderRadii,
      BorderWidth,
      FontSize,
      FontWeight
    >

    const { useDarkMode, useScreenSize, screenSizes, colors } = this.options
    const primStyles = this.primStyles

    return () => {
      const selectedMode = useDarkMode()
      const selectedColors = colors[selectedMode]
      const selectedScreenSize = useScreenSize()

      const prim = useMemoOne(() => {
        const enabledStyles = primStyles(selectedColors, StyleSheet.create)
        const disabledStyles = primStyles(selectedColors, disabledStyleSheet)
        const screenSizeStyles = Object.keys(screenSizes).reduce(
          (screenSizes, screenSize) => ({
            ...screenSizes,
            [screenSize]:
              screenSize === selectedScreenSize
                ? enabledStyles
                : disabledStyles,
          }),
          {},
        ) as {
          [k in keyof ScreenSize]: Styles
        }
        return {
          mode: selectedMode,
          screenSize: selectedScreenSize,
          ...enabledStyles,
          ...screenSizeStyles,
        }
      }, [selectedMode, colors, selectedScreenSize])

      return prim
    }
  }
}

// leveraging type inference ftw!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function configurePrim<
  Colors extends ColorsConstraint,
  ScreenSize extends ScreenSizeConstraint,
  Spacing extends SpacingConstraint,
  BorderRadii extends BorderRadiusConstraint,
  BorderWidth extends BorderWidthConstraint,
  FontSize extends FontSizeConstraint,
  FontWeight extends FontWeightConstraint,
  CustomAtoms extends Record<string, StyleProp<any>> = Record<string, unknown>
>(
  options: PrimOptions<
    Colors,
    ScreenSize,
    Spacing,
    BorderRadii,
    BorderWidth,
    FontSize,
    FontWeight
  >,
  customAtoms: (
    prim: PrimTheme<
      Colors,
      ScreenSize,
      Spacing,
      BorderRadii,
      BorderWidth,
      FontSize,
      FontWeight
    >,
  ) => CustomAtoms = () => ({} as CustomAtoms),
) {
  const usePrimTheme = new PrimConfiguration(options).createPrimThemeHook()
  type ThisTheme = PrimTheme<
    Colors,
    ScreenSize,
    Spacing,
    BorderRadii,
    BorderWidth,
    FontSize,
    FontWeight
  >
  type CustomTheme = ThisTheme & CustomAtoms

  const PrimContext = React.createContext<null | CustomTheme>(null)
  const usePrim = () => {
    // the exported PrimProvider does not allow the PrimeTheme to be null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const primTheme = useContext(PrimContext)!
    return primTheme
  }

  const PrimProvider: React.FC = ({ children }) => {
    const theme = usePrimTheme()
    const value = useMemoOne(() => {
      return {
        ...theme,
        ...customAtoms(theme),
      }
    }, [theme])
    return <PrimContext.Provider value={value}>{children}</PrimContext.Provider>
  }

  function primmed<
    P extends { style?: StyleProp<TextStyle> },
    T extends React.ComponentClass<P>
  >(
    Component: T,
    styles: (prim: CustomTheme) => StyleProp<TextStyle>,
  ): React.ForwardRefExoticComponent<
    P & Children & { ref?: React.Ref<InstanceType<T>> }
  > &
    hoistNonReactStatics.NonReactStatics<T>
  function primmed<
    P extends { style?: StyleProp<any> },
    T extends React.ComponentClass<P>
  >(
    Component: T,
    styles: (prim: CustomTheme) => StyleProp<ViewStyle>,
  ): React.ForwardRefExoticComponent<
    P & Children & { ref?: React.Ref<InstanceType<T>> }
  > &
    hoistNonReactStatics.NonReactStatics<T>
  function primmed<
    P extends { ref?: React.Ref<T>; style?: StyleProp<any> },
    T extends React.ForwardRefExoticComponent<P>
  >(
    Component: React.ForwardRefExoticComponent<P>,
    styles: (prim: CustomTheme) => StyleProp<ViewStyle>,
  ): React.ForwardRefExoticComponent<P & Children> &
    hoistNonReactStatics.NonReactStatics<T>
  function primmed<P extends { style?: StyleProp<any> }, T extends React.FC<P>>(
    Component: T,
    styles: (prim: CustomTheme) => StyleProp<ViewStyle>,
  ): React.ForwardRefExoticComponent<P & Children> &
    hoistNonReactStatics.NonReactStatics<T>
  function primmed<
    P extends { style?: StyleProp<any> },
    T extends React.ComponentType<P>
  >(Component: T, styles: (prim: CustomTheme) => StyleProp<ViewStyle>) {
    const PrimmedComponent: React.FC<P & { forwardedRef?: React.Ref<T> }> = ({
      forwardedRef,
      ...props
    }) => {
      const prim = usePrim()
      const primmedStyles = styles(prim)
      return (
        <Component
          {...(props as any)}
          style={[primmedStyles, props.style]}
          ref={forwardedRef}
        />
      )
    }
    PrimmedComponent.displayName = `Primmed.${
      Component.displayName || Component.name
    }`

    const ForwardRefComponent = React.forwardRef((props, ref) => (
      // I don't know how to implement this without breaking out of the types.
      // The overloads are ensuring correct usage, so we should be good?
      <PrimmedComponent {...(props as any)} forwardedRef={ref} />
    ))
    return hoistNonReactStatics(ForwardRefComponent, Component)
  }

  return {
    primmed,
    usePrim,
    PrimProvider,
  }
}
