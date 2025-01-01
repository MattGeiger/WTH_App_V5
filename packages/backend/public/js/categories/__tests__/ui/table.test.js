/**
 * @jest-environment jsdom
 */

import { createTableLayout, displayCategories, getSortValue } from '../../ui/table.js';

describe('Table UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="tableContainer">
                <div id="categoryTableContainer"></div>
            </div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.restoreAllMocks();
    });

    describe('createTableLayout', () => {
        test('creates table with correct structure', () => {
            const table = createTableLayout();
            document.getElementById('categoryTableContainer').appendChild(table);
            
            expect(table.id).toBe('categoryTable');
            expect(table.tagName).toBe('TABLE');
            expect(table.classList.contains('table')).toBe(true);
            expect(table.getAttribute('role')).toBe('grid');
        });

        test('creates header with correct columns', () => {
            const table = createTableLayout();
            document.getElementById('categoryTableContainer').appendChild(table);
            
            const headers = table.querySelectorAll('th');
            expect(headers).toHaveLength(4);
            expect(headers[0].textContent).toBe('Name');
            expect(headers[1].textContent).toBe('Item Limit');
            expect(headers[2].textContent).toBe('Created');
            expect(headers[3].textContent).toBe('Actions');
        });

        test('adds correct header attributes', () => {
            const table = createTableLayout();
            document.getElementById('categoryTableContainer').appendChild(table);
            
            const headers = table.querySelectorAll('th');
            headers.forEach((header, index) => {
                expect(header.getAttribute('scope')).toBe('col');
                expect(header.dataset.sortKey).toBeTruthy();
                if (index < 3) { // All except Actions are sortable
                    expect(header.classList.contains('sortable')).toBe(true);
                    expect(header.getAttribute('aria-sort')).toBe('none');
                } else {
                    expect(header.classList.contains('sortable')).toBe(false);
                    expect(header.getAttribute('aria-sort')).toBeNull();
                }
            });
        });

        test('reuses existing table if present', () => {
            const existingTable = document.createElement('table');
            existingTable.id = 'categoryTable';
            document.getElementById('categoryTableContainer').appendChild(existingTable);

            const table = createTableLayout();
            expect(table).toBe(existingTable);
        });
    });

    describe('displayCategories', () => {
        let table;

        beforeEach(() => {
            table = createTableLayout();
            document.getElementById('categoryTableContainer').appendChild(table);
        });

        test('displays categories in table', () => {
            const categories = [
                { id: 1, name: 'Fresh Produce', itemLimit: 5, created: new Date('2024-01-01') },
                { id: 2, name: 'Canned Goods', itemLimit: 0, created: new Date('2024-01-02') }
            ];

            displayCategories(categories);
            const rows = table.querySelectorAll('tbody tr');

            expect(rows).toHaveLength(2);
            expect(rows[0].cells[0].textContent).toBe('Fresh Produce');
            expect(rows[0].cells[1].textContent).toBe('5');
            expect(rows[1].cells[0].textContent).toBe('Canned Goods');
            expect(rows[1].cells[1].textContent).toBe('No Limit');
        });

        test('handles missing tbody gracefully', () => {
            document.body.innerHTML = '';
            displayCategories([{ id: 1, name: 'Test', itemLimit: 5 }]);
            // Should not throw error
        });

        test('handles missing or invalid dates', () => {
            const categories = [
                { id: 1, name: 'Test 1', itemLimit: 5, created: 'invalid-date' },
                { id: 2, name: 'Test 2', itemLimit: 5 }
            ];

            displayCategories(categories);
            const rows = table.querySelectorAll('tbody tr');
            expect(rows[0].cells[2].textContent).toBe('Invalid Date');
            expect(rows[1].cells[2].textContent).toBe('Invalid Date');
        });

        test('formats dates correctly', () => {
            const testDate = new Date('2024-01-01');
            const categories = [
                { id: 1, name: 'Test', itemLimit: 5, created: testDate }
            ];

            displayCategories(categories);
            const dateCell = table.querySelector('tbody tr td:nth-child(3)');
            expect(dateCell.textContent).toBe(testDate.toLocaleDateString());
        });

        test('creates action buttons with correct attributes', () => {
            const categories = [
                { id: 1, name: 'Test Category', itemLimit: 5, created: new Date() }
            ];

            displayCategories(categories);
            
            const editBtn = table.querySelector('.edit-btn');
            const deleteBtn = table.querySelector('.delete-btn');

            expect(editBtn.dataset.id).toBe('1');
            expect(editBtn.dataset.name).toBe('Test Category');
            expect(editBtn.dataset.limit).toBe('5');
            expect(editBtn.getAttribute('aria-label')).toBe('Edit Test Category');

            expect(deleteBtn.dataset.id).toBe('1');
            expect(deleteBtn.getAttribute('aria-label')).toBe('Delete Test Category');
        });

        test('escapes HTML in category data', () => {
            const categories = [
                { 
                    id: 1, 
                    name: '<script>alert("xss")</script>', 
                    itemLimit: 5, 
                    created: new Date() 
                }
            ];

            displayCategories(categories);
            const nameCell = table.querySelector('tbody tr td:first-child');
            expect(nameCell.innerHTML).not.toContain('<script>');
        });

        test('displays empty state when no categories', () => {
            displayCategories([]);
            const emptyState = table.querySelector('.table__cell--empty');

            expect(emptyState).not.toBeNull();
            expect(emptyState.textContent).toContain('No categories available');
            expect(emptyState.getAttribute('colspan')).toBe('4');
            expect(emptyState.getAttribute('role')).toBe('cell');
        });

        test('handles invalid input gracefully', () => {
            [null, undefined, '', {}, true, 42].forEach(input => {
                displayCategories(input);
                const emptyState = table.querySelector('.table__cell--empty');
                expect(emptyState).not.toBeNull();
                expect(emptyState.textContent).toContain('No categories available');
            });
        });
    });

    describe('getSortValue', () => {
        let table;
        let row;

        beforeEach(() => {
            table = createTableLayout();
            document.getElementById('categoryTableContainer').appendChild(table);
            row = document.createElement('tr');
            for (let i = 0; i < 4; i++) {
                row.appendChild(document.createElement('td'));
            }
        });

        test('returns lowercase text for name column', () => {
            row.cells[0].textContent = 'Fresh Produce';
            expect(getSortValue(row, 'name')).toBe('fresh produce');
        });

        test('returns numeric value for limit column', () => {
            row.cells[1].textContent = '5';
            expect(getSortValue(row, 'limit')).toBe(5);
        });

        test('returns -1 for "No Limit"', () => {
            row.cells[1].textContent = 'No Limit';
            expect(getSortValue(row, 'limit')).toBe(-1);
        });

        test('returns timestamp for date column', () => {
            const date = new Date('2024-01-01');
            row.cells[2].textContent = date.toLocaleDateString();
            const result = getSortValue(row, 'created');
            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThan(0);
        });

        test('handles invalid dates in created column', () => {
            row.cells[2].textContent = 'Invalid Date';
            expect(getSortValue(row, 'created')).toBe(0);
        });

        test('handles missing cell for sort key', () => {
            expect(getSortValue(row, 'nonexistent')).toBe('');
        });

        test('handles empty or malformed rows', () => {
            const emptyRow = document.createElement('tr');
            expect(getSortValue(emptyRow, 'name')).toBe('');
            expect(getSortValue(emptyRow, 'limit')).toBe('');
            expect(getSortValue(emptyRow, 'created')).toBe('');
        });
    });
});