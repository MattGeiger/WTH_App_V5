/**
 * Custom assertions for Food Item tests
 */

export function expectFormValidationState(form, { isValid = true, errorMessage = null } = {}) {
    const submitButton = form.querySelector('button[type="submit"]');
    expect(submitButton.disabled).toBe(!isValid);
    
    if (errorMessage) {
        const messageArea = document.querySelector('.message-area');
        expect(messageArea.textContent).toContain(errorMessage);
        expect(messageArea.querySelector('.message--error')).toBeTruthy();
    }
}

export function expectTableStructure(tableBody) {
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        expect(cells.length).toBe(7); // Standard columns
        
        // Check cell types
        expect(cells[0].textContent).toBeTruthy(); // Name
        expect(cells[1].textContent).toBeTruthy(); // Category
        expect(cells[2].textContent).toBeTruthy(); // Status
        expect(cells[3].textContent).toBeDefined(); // Dietary
        expect(cells[4].textContent).toMatch(/No Limit|\d+ (Per Household|Per Person)/); // Limit
        expect(cells[5].textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date
        expect(cells[6].querySelectorAll('button').length).toBe(2); // Actions
    });
}

export function expectSortableHeaders(table) {
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        expect(header.classList.contains('table__header')).toBe(true);
        expect(header.querySelector('.sort-indicator')).toBeTruthy();
    });
}

export function expectValidStats(statsContainer, expectedStats) {
    const stats = statsContainer.querySelectorAll('.stats span');
    const statsText = Array.from(stats).map(span => span.textContent);
    
    expect(statsText).toContain(`Total Items: ${expectedStats.total}`);
    expect(statsText).toContain(`In Stock: ${expectedStats.inStock}`);
    expect(statsText).toContain(`Out of Stock: ${expectedStats.outOfStock}`);
    expect(statsText).toContain(`Limited: ${expectedStats.limited}`);
    expect(statsText).toContain(`Unlimited: ${expectedStats.unlimited}`);
    
    if (expectedStats.lastUpdated) {
        expect(statsText.some(text => text.includes('Last Updated:'))).toBe(true);
    }
}

export function expectFormData(formData, expectedData) {
    // Basic fields
    expect(formData.name).toBe(expectedData.name);
    expect(formData.categoryId).toBe(expectedData.categoryId);
    expect(formData.itemLimit).toBe(expectedData.itemLimit);
    expect(formData.limitType).toBe(expectedData.limitType);

    // Status flags
    const statusFlags = ['inStock', 'mustGo', 'lowSupply', 'readyToEat'];
    statusFlags.forEach(flag => {
        expect(formData[flag]).toBe(expectedData[flag] ?? false);
    });

    // Dietary flags
    const dietaryFlags = ['kosher', 'halal', 'vegetarian', 'vegan', 'glutenFree', 'organic'];
    dietaryFlags.forEach(flag => {
        expect(formData[flag]).toBe(expectedData[flag] ?? false);
    });
}

export function expectValidationErrors(errors, expectedErrors) {
    expect(errors.length).toBe(expectedErrors.length);
    expectedErrors.forEach((expected, index) => {
        expect(errors[index]).toEqual(expect.objectContaining({
            field: expected.field,
            message: expected.message,
            type: 'validation'
        }));
    });
}

export function expectApiCallSequence(apiMock, expectedCalls) {
    expect(apiMock.mock.calls.length).toBe(expectedCalls.length);
    expectedCalls.forEach((expected, index) => {
        const [endpoint, data] = apiMock.mock.calls[index];
        expect(endpoint).toBe(expected.endpoint);
        if (expected.data) {
            expect(data).toEqual(expect.objectContaining(expected.data));
        }
    });
}

export function expectDomChanges(beforeSnapshot, afterSnapshot) {
    const changes = {
        added: [],
        removed: [],
        modified: []
    };

    // Compare DOM trees and collect changes
    function compareNodes(before, after) {
        if (!before && after) {
            changes.added.push(after);
        } else if (before && !after) {
            changes.removed.push(before);
        } else if (before.nodeValue !== after.nodeValue) {
            changes.modified.push({
                element: after,
                oldValue: before.nodeValue,
                newValue: after.nodeValue
            });
        }

        // Recursively compare children
        const beforeChildren = Array.from(before?.childNodes || []);
        const afterChildren = Array.from(after?.childNodes || []);
        
        const maxLength = Math.max(beforeChildren.length, afterChildren.length);
        for (let i = 0; i < maxLength; i++) {
            compareNodes(beforeChildren[i], afterChildren[i]);
        }
    }

    compareNodes(beforeSnapshot, afterSnapshot);
    return changes;
}

export function expectFormReset(form) {
    // Input fields should be empty
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"], select');
    inputs.forEach(input => {
        expect(input.value).toBe('');
    });

    // Checkboxes should be unchecked
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        expect(checkbox.checked).toBe(false);
    });

    // Radio buttons should be in default state
    const radios = form.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        expect(radio.checked).toBe(radio.value === 'perHousehold');
    });

    // Submit button should be in add state
    const submitButton = form.querySelector('button[type="submit"]');
    expect(submitButton.textContent).toBe('Add Food Item');
}