# react-native-prim
Prim is a customizable TypeScript atomic styles framework for React Native.

### Basics

In the root component of your screen or app:
```TypeScript
import { PrimProvider, usePrim } from '@lifeomic/prim'

const App: React.FC = () => (
  <PrimProvider>
    <RootAppNavigation />
  </PrimProvider>
)
```

In your primmly dressed components:
```TypeScript
const Title = primmed(Text, prim => [
  prim.text.xxl,
  prim.text.color.gray900,
  prim.font.bold,
])

const Body = primmed(Text, prim => [
  prim.text.base,
  prim.text.color.gray900,
  prim.font.medium,
])

const Caption = primmed(Text, prim => [
  prim.text.sm,
  prim.text.color.gray600,
  prim.font.medium,
  prim.text.capitalize,
])

const ArticleCard: React.FC<{ article: Article }> = ({ article }) => {
  const prim = usePrim()
  return (
    <View style=[
      prim.p[4],
      prim.border[1],
      prim.border.gray100,
      prim.rounded.lg,
      prim.overflow.hidden,
    ]>
      <Caption>article.formattedDate</Title>
      <Title style={prim.mt[2]}>
        {article.title}
      </Title>
      <Body style={prim.mt[2]}>
        {article.body}
      </Title>
    </View>
  )
}
```


### Acknowledgements

Prim was inspired by [tailwindcss](https://tailwindcss.com). Much of it's API
as well as some of it's default theme will be familiar to tailwind users.
