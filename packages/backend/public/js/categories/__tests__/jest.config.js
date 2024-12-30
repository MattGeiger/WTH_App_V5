module.exports = {
  testEnvironment: 'jsdom',
  
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],

  moduleFileExtensions: ['js', 'json'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },

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

  rootDir: '../',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { 
      configFile: './public/js/categories/__tests__/babel.config.js' 
    }]
  },

  transformIgnorePatterns: [
    '/node_modules/(?!(lodash-es|other-es-module)/)'
  ],

  moduleDirectories: ['node_modules', '<rootDir>'],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Add fake timers configuration
  fakeTimers: {
    enableGlobally: true,
    timerLimit: 5000
  },

  verbose: true,
  maxConcurrency: 5,
  maxWorkers: '50%',
  testTimeout: 5000,
  slowTestThreshold: 1000
};