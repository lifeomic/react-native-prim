import { StyleSheet as RNStyleSheet } from 'react-native'

// This makes it clear in the snapshots which styles were created
// via StyleSheet.create({...})
export class StyleSheet {
  constructor(styles) {
    Object.assign(this, styles)
  }
}

let ssCreateSpy

beforeAll(() => {
  ssCreateSpy = jest.spyOn(RNStyleSheet, 'create')
  ssCreateSpy.mockImplementation((styles) => {
    return Object.keys(styles).reduce((updatedStyles, key) => {
      return {
        ...updatedStyles,
        [key]: new StyleSheet(styles[key]),
      }
    }, {})
  })
})
