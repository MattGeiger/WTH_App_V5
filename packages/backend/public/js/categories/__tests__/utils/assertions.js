/**
 * Custom assertions for Category tests
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
        expect(cells.length).toBe(4); // Standard columns for categories
        
        // Check cell types
        expect(cells[0].textContent).toBeTruthy(); // Name
        expect(cells[1].textContent).toMatch(/No Limit|\d+/); // Item Limit
        expect(cells[2].textContent).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/); // Date
        expect(cells[3].querySelectorAll('button').length).toBe(2); // Actions
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
    
    expect(statsText).toContain(`Total Categories: ${expectedStats.total}`);
    expect(statsText).toContain(`Limited: ${expectedStats.limited}`);
    expect(statsText).toContain(`Unlimited: ${expectedStats.unlimited}`);
    
    if (expectedStats.lastUpdated) {
        expect(statsText.some(text => text.includes('Last Updated:'))).toBe(true);
    }
}

export function expectFormData(formData, expectedData) {
    expect(formData.name).toBe(expectedData.name);
    expect(formData.itemLimit).toBe(expectedData.itemLimit);
    if (expectedData.id) {
        expect(formData.id).toBe(expectedData.id);
    }
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

export function expectFormReset(form) {
    // Text input should be empty
    const nameInput = form.querySelector('#categoryName');
    expect(nameInput.value).toBe('');

    // Item limit should be default
    const limitSelect = form.querySelector('#categoryItemLimit');
    expect(limitSelect.value).toBe('0');

    // Hidden ID field should be empty
    const idInput = form.querySelector('#categoryId');
    expect(idInput.value).toBe('');

    // Submit button should be in add state
    const submitButton = form.querySelector('button[type="submit"]');
    expect(submitButton.textContent).toBe('Add Category');
}