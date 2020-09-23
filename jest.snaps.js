import { RegisteredStyle } from './jest.afterEnv'

const minPrettyFormatConfig = {
  spacingInnter: ' ',
  spacingOuter: ' ',
  indentation: '',
  indent: '',
  min: true,
}

const plugin = {
  test(val) {
    return val instanceof RegisteredStyle
  },
  serialize(regStyle, config, indentation, depth, refs, printer) {
    return (
      'Registered ' +
      printer(
        regStyle,
        {
          ...config,
          ...minPrettyFormatConfig,
          // remove this to prevent recursion
          plugins: config.plugins.filter((plug) => plug !== this),
        },
        '',
        depth,
        refs,
      )
    )
  },
}

module.exports = plugin
