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
>(_styles: T | StyleSheet.NamedStyles<T>): T {
  return {} as T
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
    function ssWithValuesForAttribute<
      Attribute extends keyof ViewStyle | keyof TextStyle,
      SubConfig extends Record<string, any>
    >(subConfigs: SubConfig, attribute: Attribute) {
      const styles: any = {}
      for (const configName in subConfigs) {
        styles[configName] = { [attribute]: subConfigs[configName] }
      }
      return ss<
        {
          [c in keyof SubConfig]: {
            [ca in Attribute]: SubConfig[c]
          }
        }
      >(styles)
    }
    const ssForForAttributeWithRelativeSizes = <
      Attribute extends keyof ViewStyle | keyof TextStyle
    >(
      attribute: Attribute,
    ) => {
      return {
        ...ssWithValuesForAttribute(this.options.spacing, attribute),
        ...ss({
          ['full' as const]: { [attribute]: '100%' as const },
          ['half' as const]: { [attribute]: '50%' as const },
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
        ...ssWithValuesForAttribute(colors, 'borderColor'),
        ...ssWithValuesForAttribute(this.options.borderWidth, 'borderWidth'),
      },
      borderTop: {
        ...ssWithValuesForAttribute(colors, 'borderTopColor'),
        ...ssWithValuesForAttribute(this.options.spacing, 'borderTopWidth'),
      },
      borderBottom: {
        ...ssWithValuesForAttribute(colors, 'borderBottomColor'),
        ...ssWithValuesForAttribute(this.options.spacing, 'borderBottomWidth'),
      },
      borderRight: {
        ...ssWithValuesForAttribute(colors, 'borderRightColor'),
        ...ssWithValuesForAttribute(this.options.spacing, 'borderRightWidth'),
      },
      borderLeft: {
        ...ssWithValuesForAttribute(colors, 'borderLeftColor'),
        ...ssWithValuesForAttribute(this.options.spacing, 'borderLeftWidth'),
      },
      font: {
        ...ssWithValuesForAttribute(this.options.fontWeight, 'fontWeight'),
        ...ss({
          italic: { fontStyle: 'italic' },
        }),
      },
      text: {
        ...ssWithValuesForAttribute(this.options.fontSize, 'fontSize'),
        ...ssWithValuesForAttribute(colors, 'color'),
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
        } as const),
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
        this.options.borderRadius,
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

      opacity: ss({
        0: { opacity: 0 },
        5: { opacity: 0.05 },
        10: { opacity: 0.1 },
        20: { opacity: 0.2 },
        25: { opacity: 0.25 },
        30: { opacity: 0.3 },
        40: { opacity: 0.4 },
        50: { opacity: 0.5 },
        60: { opacity: 0.6 },
        70: { opacity: 0.7 },
        75: { opacity: 0.75 },
        80: { opacity: 0.8 },
        90: { opacity: 0.9 },
        95: { opacity: 0.95 },
        100: { opacity: 1 },
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
        const screenSizeStyles: any = {}
        for (const screenSize in screenSizes) {
          screenSizeStyles[screenSize] =
            screenSize === selectedScreenSize ? enabledStyles : disabledStyles
        }
        return {
          mode: selectedMode,
          screenSize: selectedScreenSize,
          ...enabledStyles,
          ...(screenSizeStyles as {
            [k in keyof ScreenSize]: Styles
          }),
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
