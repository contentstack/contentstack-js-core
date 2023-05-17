module.exports = {
  // This is one of the patterns that jest finds by default https://jestjs.io/docs/configuration#testmatch-arraystring
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'js', 'mjs', 'html'],
  coverageReporters: ['json', 'html', 'json-summary', 'text', 'lcov'],
  transform: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '^.+\\.(ts|js|html)$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'require', 'default'],
  },
};
