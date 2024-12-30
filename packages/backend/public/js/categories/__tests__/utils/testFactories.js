/**
 * Test data factories for Category related tests
 */

export function createMockCategory({
    id = 1,
    name = 'Test Category',
    itemLimit = 5,
    createdAt = new Date().toISOString(),
    ...overrides
} = {}) {
    return {
        id,
        name,
        itemLimit,
        createdAt,
        updatedAt: new Date().toISOString(),
        ...overrides
    };
}

export function createMockManager({
    settingsManager = createMockSettingsManager(),
    ...overrides
} = {}) {
    document.body.innerHTML = `
        <form id="categoryForm">
            <button type="submit">Submit</button>
        </form>
        <div id="categoryTableBody"></div>
        <select id="categoryItemLimit"></select>
        <button id="resetForm">Reset</button>
        <input id="categoryName" />
        <div id="categoryStats"></div>
        <input type="hidden" id="categoryId" />
    `;

    return {
        form: document.getElementById('categoryForm'),
        tableBody: document.getElementById('categoryTableBody'),
        itemLimitSelect: document.getElementById('categoryItemLimit'),
        resetButton: document.getElementById('resetForm'),
        nameInput: document.getElementById('categoryName'),
        categoryStats: document.getElementById('categoryStats'),
        settingsManager,
        sortableTable: createMockSortableTable(),
        lastUpdated: new Date(),
        ...overrides
    };
}

export function createMockSettingsManager({
    currentLimit = 10,
    ...overrides
} = {}) {
    return {
        getCurrentLimit: jest.fn().mockReturnValue(currentLimit),
        ...overrides
    };
}

export function createMockSortableTable({
    ...overrides
} = {}) {
    return {
        setupSortingControls: jest.fn(),
        getColumnIndex: jest.fn(key => {
            const indices = {
                name: 0,
                limit: 1,
                created: 2
            };
            return indices[key] || -1;
        }),
        ...overrides
    };
}

export function createMockEvent({
    type = 'click',
    preventDefault = jest.fn(),
    target = {},
    ...overrides
} = {}) {
    return {
        type,
        preventDefault,
        target,
        ...overrides
    };
}

export function createMockApiResponse({
    success = true,
    data = null,
    message = '',
    status = 200,
    ...overrides
} = {}) {
    return {
        success,
        data,
        message,
        status,
        ...overrides
    };
}

export async function createTestEnvironment({
    categoryCount = 3,
    withSettings = true
} = {}) {
    const categories = Array.from({ length: categoryCount }, (_, index) => 
        createMockCategory({ id: index + 1, name: `Test Category ${index + 1}` }));

    const settings = withSettings ? {
        globalUpperLimit: 10,
        updatedAt: new Date().toISOString()
    } : null;

    return {
        categories,
        settings,
        cleanup: () => {
            document.body.innerHTML = '';
            jest.clearAllMocks();
        }
    };
}