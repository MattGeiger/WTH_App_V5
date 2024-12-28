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
    }
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// Utility function to wait for DOM updates
global.waitForDomChange = () => new Promise(resolve => setTimeout(resolve, 0));

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