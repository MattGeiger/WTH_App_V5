/**
 * Test helper utilities for Food Item tests
 */

export async function waitForDomUpdate(timeout = 0) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}

export function simulateUserInput(element, value) {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

export function simulateFormSubmit(form) {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

export function createDomElement(type, attributes = {}, children = []) {
    const element = document.createElement(type);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            Object.entries(value).forEach(([dataKey, dataValue]) => {
                element.dataset[dataKey] = dataValue;
            });
        } else {
            element.setAttribute(key, value);
        }
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
}

export function findByTestId(container, testId) {
    return container.querySelector(`[data-testid="${testId}"]`);
}

export function queryAllByClass(container, className) {
    return Array.from(container.getElementsByClassName(className));
}

export function mockApiCall(mockFn, response, delay = 0) {
    return mockFn.mockImplementation(() => 
        new Promise(resolve => 
            setTimeout(() => resolve(response), delay)
        )
    );
}

export function createMockFormData({
    name = 'Test Item',
    categoryId = '1',
    itemLimit = '5',
    limitType = 'perHousehold',
    flags = {}
} = {}) {
    return {
        name,
        categoryId: parseInt(categoryId),
        itemLimit: parseInt(itemLimit),
        limitType,
        inStock: flags.inStock ?? false,
        mustGo: flags.mustGo ?? false,
        lowSupply: flags.lowSupply ?? false,
        readyToEat: flags.readyToEat ?? false,
        kosher: flags.kosher ?? false,
        halal: flags.halal ?? false,
        vegetarian: flags.vegetarian ?? false,
        vegan: flags.vegan ?? false,
        glutenFree: flags.glutenFree ?? false,
        organic: flags.organic ?? false
    };
}

export function verifyFormReset(form) {
    // Verify form element states
    expect(form.reset).toHaveBeenCalled();
    expect(document.getElementById('foodItemId').value).toBe('');
    expect(document.getElementById('limitTypeContainer').style.display).toBe('none');
    expect(form.querySelector('button[type="submit"]').textContent).toBe('Add Food Item');
}

export function expectValidationError(message) {
    return {
        asymmetricMatch: actual => {
            return actual.message === message && 
                   actual.type === 'validation' &&
                   actual.field !== undefined;
        },
        toString: () => `ValidationError(${message})`
    };
}

export function createTestTable() {
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    return { table, tbody };
}

/**
 * Verifies that DOM manipulation was performed efficiently
 * @param {Function} callback - Function that performs DOM manipulation
 * @returns {Promise<number>} - Number of reflows triggered
 */
export async function measureDomPerformance(callback) {
    const reflows = [];
    const originalOffsetHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetHeight'
    );

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        get() {
            reflows.push(new Error().stack);
            return 0;
        },
    });

    await callback();

    Object.defineProperty(
        HTMLElement.prototype,
        'offsetHeight',
        originalOffsetHeight
    );

    return reflows.length;
}

export function createTestContext() {
    return {
        errors: [],
        warnings: [],
        logs: [],
        clear() {
            this.errors = [];
            this.warnings = [];
            this.logs = [];
        },
        captureConsole() {
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalLog = console.log;

            console.error = (...args) => this.errors.push(args);
            console.warn = (...args) => this.warnings.push(args);
            console.log = (...args) => this.logs.push(args);

            return () => {
                console.error = originalError;
                console.warn = originalWarn;
                console.log = originalLog;
            };
        }
    };
}