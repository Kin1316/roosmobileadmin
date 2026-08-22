module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: [
    'react-native-gesture-handler/jestSetup',
    '@testing-library/jest-native/extend-expect',
    './jest.setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|react-clone-referenced-element|@react-navigation/.+|@react-native-community/.+))',
  ],
};
