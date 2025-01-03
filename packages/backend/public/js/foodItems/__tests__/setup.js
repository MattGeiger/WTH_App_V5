import * as assertions from './utils/assertions';
import * as testHelpers from './utils/testHelpers';
import * as testFactories from './utils/testFactories';

// Enable fake timers
jest.useFakeTimers();

// Mock window.localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock window.fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve('')
    })
);

// Mock window.alert and window.confirm
global.alert = jest.fn();
global.confirm = jest.fn(() => true);

// Add custom matchers
expect.extend({
    toHaveBeenCalledOnceWith(received, ...expectedArgs) {
        const pass = received.mock.calls.length === 1 &&
            JSON.stringify(received.mock.calls[0]) === JSON.stringify(expectedArgs);
        
        return {
            pass,
            message: () => pass
                ? `Expected function not to have been called once with ${expectedArgs}`
                : `Expected function to have been called once with ${expectedArgs}`
        };
    },
    // Add our custom assertions as matchers
    toHaveValidFormState(form, options) {
        assertions.expectFormValidationState(form, options);
        return { pass: true };
    },
    toHaveValidTableStructure(tableBody) {
        assertions.expectTableStructure(tableBody);
        return { pass: true };
    },
    toHaveSortableHeaders(table) {
        assertions.expectSortableHeaders(table);
        return { pass: true };
    },
    toHaveValidStats(container, expectedStats) {
        assertions.expectValidStats(container, expectedStats);
        return { pass: true };
    }
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Add test utilities to global scope
global.testHelpers = testHelpers;
global.testFactories = testFactories;
global.assertions = assertions;

// Add common test utilities
global.waitForDomChange = testHelpers.waitForDomUpdate;
global.createTestContext = testHelpers.createTestContext;
global.measureDomPerformance = testHelpers.measureDomPerformance;

// Add factory methods
global.createMockFoodItem = testFactories.createMockFoodItem;
global.createMockManager = testFactories.createMockManager;
global.createTestEnvironment = testFactories.createTestEnvironment;

// Cleanup after each test
afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    // Reset timers
    jest.runOnlyPendingTimers();
    // Clear DOM
    document.body.innerHTML = '';
    // Clear local storage
    localStorage.clear();
    // Reset fetch mock
    fetch.mockClear();
});

// Test environment configuration
beforeAll(() => {
    // Suppress console.error in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Set timezone for consistent date handling
    process.env.TZ = 'UTC';
});