module.exports = {
    projects: [
        {
            displayName: 'backend',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/src/tests/*.test.ts',
                '<rootDir>/src/services/**/*.test.ts'
            ],
            transform: {
                '^.+\\.(ts|tsx)$': 'ts-jest'
            },
            setupFilesAfterEnv: [
                '<rootDir>/src/tests/setup.ts'
            ],
            moduleNameMapper: {
                '^@/(.*)$': '<rootDir>/src/$1'
            }
        },
        {
            displayName: 'frontend',
            testEnvironment: 'jsdom',
            testMatch: [
                '<rootDir>/src/tests/frontend/*.test.js'
            ],
            transform: {
                '^.+\\.(js|jsx)$': 'babel-jest'
            },
            setupFilesAfterEnv: [
                '<rootDir>/src/tests/frontend/setup.js'
            ]
        }
    ],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    testTimeout: 30000,
    detectOpenHandles: true
}