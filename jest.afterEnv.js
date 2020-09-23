import { StyleSheet } from 'react-native'

export class RegisteredStyle {
  constructor(styles) {
    Object.assign(this, styles)
  }
}

let ssCreateSpy

beforeAll(() => {
  ssCreateSpy = jest.spyOn(StyleSheet, 'create')
  ssCreateSpy.mockImplementation((styles) => {
    return Object.keys(styles).reduce((updatedStyles, key) => {
      return {
        ...updatedStyles,
        [key]: new RegisteredStyle(styles[key]),
      }
    }, {})
  })
})
