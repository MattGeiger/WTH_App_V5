module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'json'],

  // Module name mapper for imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/__tests__/coverage',
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  collectCoverageFrom: [
    '<rootDir>/handlers/**/*.js',
    '<rootDir>/ui/**/*.js',
    '<rootDir>/utils/**/*.js',
    '!<rootDir>/__tests__/**',
    '!<rootDir>/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Coverage paths
  rootDir: '../',

  // Test setup file
  setupFilesAfterEnv: [
    '<rootDir>/__tests__/setup.js'
  ],

  // Transform configuration 
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      configFile: './public/js/categories/__tests__/babel.config.js' 
    }]
  },

  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(lodash-es|other-es-module)/)'
  ],

  // Module directories
  moduleDirectories: ['node_modules', '<rootDir>'],

  // Test configuration
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
  slowTestThreshold: 1000
};