module.exports = {
  clearMocks: true,
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['dist/', 'utils/'],
  setupFilesAfterEnv: ['<rootDir>/jest.afterEnv.js'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
}
