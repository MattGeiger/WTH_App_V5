module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/foodItems/__tests__/**/*.test.js'
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Module name mapper for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'clover'],
  collectCoverageFrom: [
    '**/foodItems/**/*.js',
    '!**/foodItems/__tests__/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Test setup file
  setupFilesAfterEnv: [
    '<rootDir>/setup.js'
  ],

  // Mocking configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Error handling
  bail: false,
  verbose: true,

  // Performance
  maxConcurrency: 5,
  maxWorkers: '50%',

  // Timeouts
  testTimeout: 5000,
  slowTestThreshold: 1000,

  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ]
  ]
};