/**
 * Test data factories for Food Item related tests
 */

export function createMockFoodItem({
    id = 1,
    name = 'Test Item',
    categoryId = 1,
    itemLimit = 5,
    limitType = 'perHousehold',
    inStock = true,
    ...overrides
} = {}) {
    return {
        id,
        name,
        categoryId,
        category: { id: categoryId, name: 'Test Category' },
        itemLimit,
        limitType,
        inStock,
        mustGo: false,
        lowSupply: false,
        readyToEat: false,
        kosher: false,
        halal: false,
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        organic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...overrides
    };
}

export function createMockManager({
    settingsManager = createMockSettingsManager(),
    ...overrides
} = {}) {
    // Set up basic DOM structure needed for manager
    document.body.innerHTML = `
        <form id="foodItemForm">
            <button type="submit">Submit</button>
        </form>
        <div id="foodItemTableBody"></div>
        <select id="itemLimitSelect"></select>
        <button id="resetFoodItemForm">Reset</button>
        <select id="foodItemCategory"></select>
        <input id="foodItemName" />
        <div id="foodItemStats"></div>
        <div id="foodItemId"></div>
    `;

    return {
        form: document.getElementById('foodItemForm'),
        tableBody: document.getElementById('foodItemTableBody'),
        itemLimitSelect: document.getElementById('itemLimitSelect'),
        resetButton: document.getElementById('resetFoodItemForm'),
        categorySelect: document.getElementById('foodItemCategory'),
        nameInput: document.getElementById('foodItemName'),
        foodItemStats: document.getElementById('foodItemStats'),
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
                category: 1,
                status: 2,
                dietary: 3,
                limit: 4,
                created: 5
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
    itemCount = 3,
    withCategories = true,
    withSettings = true
} = {}) {
    // Create test items
    const items = Array.from({ length: itemCount }, (_, index) => 
        createMockFoodItem({ id: index + 1, name: `Test Item ${index + 1}` }));

    // Create test categories if requested
    const categories = withCategories ? [
        { id: 1, name: 'Category 1', itemLimit: 5 },
        { id: 2, name: 'Category 2', itemLimit: 0 }
    ] : [];

    // Create test settings if requested
    const settings = withSettings ? {
        globalUpperLimit: 10,
        updatedAt: new Date().toISOString()
    } : null;

    return {
        items,
        categories,
        settings,
        cleanup: () => {
            document.body.innerHTML = '';
            jest.clearAllMocks();
        }
    };
}