/**
 * Test helper utilities for Category tests
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
    name = 'Test Category',
    itemLimit = '5',
    id = null
} = {}) {
    return {
        name,
        itemLimit: parseInt(itemLimit),
        ...(id && { id: parseInt(id) })
    };
}

export function verifyFormReset(form) {
    expect(form.reset).toHaveBeenCalled();
    expect(document.getElementById('categoryId').value).toBe('');
    expect(document.getElementById('categoryItemLimit').value).toBe('0');
    expect(form.querySelector('button[type="submit"]').textContent).toBe('Add Category');
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