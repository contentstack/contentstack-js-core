/* eslint-disable */
export default {
  displayName: 'contentstack-js-core',
  preset: './jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  collectCoverage: true,
  coverageDirectory: './reports/contentstack-js-core/coverage/',
  "collectCoverageFrom": [
    "src/**",
    "!src/index.ts"
  ],
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports/contentstack-js-core/html',
        filename: 'index.html',
        expand: true,
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: 'reports/contentstack-js-core/junit',
        outputName: 'jest-junit.xml',
        ancestorSeparator: ' › ',
        uniqueOutputName: 'false',
        suiteNameTemplate: '{filepath}',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
};
