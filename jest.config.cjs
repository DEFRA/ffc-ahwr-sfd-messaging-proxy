module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.test.js'
  ],
  coverageDirectory: 'test-output',
  coverageReporters: [
    'text-summary',
    'lcov'
  ],
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/test-output/',
    '<rootDir>/test/',
    '<rootDir>/jest.config.js',
    '<rootDir>/app/data',
    '<rootDir>/app/index.js'
  ],
  modulePathIgnorePatterns: [
    'node_modules'
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'jest tests',
        outputDirectory: 'test-output',
        outputName: 'junit.xml'
      },
      'jest-skipped-reporter'
    ]
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test/setup.js'
  ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ffc-ahwr-common-library)/)'
  ],
  testPathIgnorePatterns: [],
  verbose: false,
  workerIdleMemoryLimit: '500MB'
}
