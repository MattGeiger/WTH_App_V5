/**
 * @jest-environment jsdom
 */

import { createTableLayout } from '../../ui/table.js';
import { SortableTable } from '../../../utils/sortableTable.js';

// Mock dependencies
jest.mock('../../../utils/sortableTable.js');

describe('Table UI', () => {
    let container;
    let mockSortableTable;

    beforeEach(() => {
        // Setup DOM container
        container = document.createElement('div');
        document.body.appendChild(container);

        // Setup SortableTable mock
        mockSortableTable = {
            setupSortingControls: jest.fn(),
            getColumnIndex: jest.fn().mockReturnValue(0)
        };
        SortableTable.mockImplementation(() => mockSortableTable);
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('createTableLayout', () => {
        test('creates table with correct structure', () => {
            const table = createTableLayout();
            const tableElement = document.getElementById('categoryTable');

            expect(tableElement).not.toBeNull();
            expect(tableElement.tagName).toBe('TABLE');
            expect(tableElement.classList.contains('table')).toBe(true);
        });

        test('creates header with correct columns', () => {
            createTableLayout();
            const headers = document.querySelectorAll('th');

            expect(headers).toHaveLength(4);
            expect(headers[0].textContent).toBe('Name');
            expect(headers[1].textContent).toBe('Item Limit');
            expect(headers[2].textContent).toBe('Created');
            expect(headers[3].textContent).toBe('Actions');
        });

        test('adds correct header classes and attributes', () => {
            createTableLayout();
            const headers = document.querySelectorAll('th');

            headers.forEach(header => {
                expect(header.classList.contains('table__header')).toBe(true);
            });

            const sortableHeaders = Array.from(headers).slice(0, 3); // First 3 are sortable
            sortableHeaders.forEach(header => {
                expect(header.hasAttribute('data-sort')).toBe(true);
            });
        });

        test('initializes sortable table functionality', () => {
            const table = createTableLayout();
            expect(SortableTable).toHaveBeenCalledWith('categoryTableBody', expect.any(Function));
        });

        test('reuses existing table if present', () => {
            const existingTable = document.createElement('table');
            existingTable.id = 'categoryTable';
            container.appendChild(existingTable);

            createTableLayout();
            const tables = document.querySelectorAll('#categoryTable');
            expect(tables).toHaveLength(1);
        });
    });

    describe('displayCategories', () => {
        let table;

        beforeEach(() => {
            table = createTableLayout();
        });

        test('displays categories in table', () => {
            const categories = [
                {
                    id: 1,
                    name: 'Fresh Produce',
                    itemLimit: 5,
                    createdAt: '2024-01-01'
                },
                {
                    id: 2,
                    name: 'Canned Goods',
                    itemLimit: 0,
                    createdAt: '2024-01-02'
                }
            ];

            table.displayCategories(categories);
            const rows = document.querySelectorAll('tbody tr');

            expect(rows).toHaveLength(2);
            expect(rows[0].cells[0].textContent).toBe('Fresh Produce');
            expect(rows[0].cells[1].textContent).toBe('5');
            expect(rows[1].cells[0].textContent).toBe('Canned Goods');
            expect(rows[1].cells[1].textContent).toBe('No Limit');
        });

        test('formats dates correctly', () => {
            const categories = [{
                id: 1,
                name: 'Test Category',
                itemLimit: 5,
                createdAt: '2024-01-01T12:00:00Z'
            }];

            table.displayCategories(categories);
            const dateCell = document.querySelector('tbody tr td:nth-child(3)');
            expect(dateCell.textContent).toBe(new Date('2024-01-01').toLocaleDateString());
        });

        test('creates action buttons with correct attributes', () => {
            const categories = [{
                id: 1,
                name: 'Test Category',
                itemLimit: 5,
                createdAt: '2024-01-01'
            }];

            table.displayCategories(categories);
            
            const editBtn = document.querySelector('.edit-btn');
            const deleteBtn = document.querySelector('.delete-btn');

            expect(editBtn).not.toBeNull();
            expect(editBtn.dataset.id).toBe('1');
            expect(editBtn.dataset.name).toBe('Test Category');
            expect(editBtn.dataset.limit).toBe('5');
            expect(editBtn.getAttribute('aria-label')).toBe('Edit Test Category');

            expect(deleteBtn).not.toBeNull();
            expect(deleteBtn.dataset.id).toBe('1');
            expect(deleteBtn.getAttribute('aria-label')).toBe('Delete Test Category');
        });

        test('displays empty state when no categories', () => {
            table.displayCategories([]);
            const emptyState = document.querySelector('.table__cell--empty');

            expect(emptyState).not.toBeNull();
            expect(emptyState.textContent).toContain('No categories available');
            expect(emptyState.textContent).toContain('Add a category using the form above');
        });

        test('displays empty state for invalid input', () => {
            const invalidInputs = [null, undefined, '', {}, true, 42];
            
            invalidInputs.forEach(input => {
                table.displayCategories(input);
                const emptyState = document.querySelector('.table__cell--empty');
                expect(emptyState).not.toBeNull();
                expect(emptyState.textContent).toContain('No categories available');
            });
        });
    });

    describe('getSortValue', () => {
        let table;

        beforeEach(() => {
            table = createTableLayout();
        });

        test('sorts name column correctly', () => {
            const row = document.createElement('tr');
            row.innerHTML = '<td>Fresh Produce</td>';
            
            const value = table.getSortValue(row, 'name');
            expect(value).toBe('fresh produce');
        });

        test('sorts limit column correctly', () => {
            const row = document.createElement('tr');
            row.innerHTML = '<td></td><td>5</td>';
            
            const value = table.getSortValue(row, 'limit');
            expect(value).toBe(5);
        });

        test('handles "No Limit" value in limit column', () => {
            const row = document.createElement('tr');
            row.innerHTML = '<td></td><td>No Limit</td>';
            
            const value = table.getSortValue(row, 'limit');
            expect(value).toBe(-1);
        });

        test('sorts date column correctly', () => {
            const row = document.createElement('tr');
            const date = new Date('2024-01-01');
            row.innerHTML = `<td></td><td></td><td>${date.toLocaleDateString()}</td>`;
            
            SortableTable.dateSortValue = jest.fn().mockReturnValue(date.getTime());
            
            const value = table.getSortValue(row, 'created');
            expect(SortableTable.dateSortValue).toHaveBeenCalled();
        });

        test('handles invalid sort keys', () => {
            const row = document.createElement('tr');
            row.innerHTML = '<td>Test</td>';
            
            const value = table.getSortValue(row, 'invalid_key');
            expect(value).toBe('test');
        });
    });

    describe('Accessibility', () => {
        test('table has appropriate ARIA attributes', () => {
            const table = createTableLayout();
            const tableElement = document.getElementById('categoryTable');

            expect(tableElement.getAttribute('role')).toBe('grid');
            const headers = document.querySelectorAll('th');
            headers.forEach(header => {
                expect(header.getAttribute('scope')).toBe('col');
            });
        });

        test('action buttons have appropriate ARIA labels', () => {
            const categories = [{
                id: 1,
                name: 'Test Category',
                itemLimit: 5,
                createdAt: '2024-01-01'
            }];

            const table = createTableLayout();
            table.displayCategories(categories);

            const editBtn = document.querySelector('.edit-btn');
            const deleteBtn = document.querySelector('.delete-btn');

            expect(editBtn.getAttribute('aria-label')).toBe('Edit Test Category');
            expect(deleteBtn.getAttribute('aria-label')).toBe('Delete Test Category');
        });

        test('empty state has appropriate ARIA attributes', () => {
            const table = createTableLayout();
            table.displayCategories([]);

            const emptyState = document.querySelector('.table__cell--empty');
            expect(emptyState.getAttribute('colspan')).toBe('4');
            expect(emptyState.querySelector('.empty-state')).not.toBeNull();
            expect(emptyState.querySelector('.empty-state__hint')).not.toBeNull();
            expect(emptyState.getAttribute('role')).toBe('cell');
        });

        test('sortable headers have appropriate ARIA attributes', () => {
            createTableLayout();
            const sortableHeaders = document.querySelectorAll('[data-sort]');

            sortableHeaders.forEach(header => {
                expect(header.getAttribute('aria-sort')).toBe('none');
                expect(header.getAttribute('role')).toBe('columnheader');
                expect(header.getAttribute('tabindex')).toBe('0');
            });
        });
    });
});