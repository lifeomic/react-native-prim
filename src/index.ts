import configurePrim from './configurePrim'
import defaultOptions from './defaultOptions'

export { default as configurePrim } from './configurePrim'
export { default as defaultOptions } from './defaultOptions'

export const { PrimProvider, usePrim, primmed } = configurePrim(defaultOptions)
