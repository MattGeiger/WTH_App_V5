/**
 * @jest-environment jsdom
 */

import { CategoryManager } from '../../CategoryManager.js';
import { createFormLayout } from '../../ui/forms.js';
import { createTableLayout } from '../../ui/table.js';
import { createStatsView } from '../../ui/stats.js';
import { showMessage } from '../../../utils.js';
import { EVENTS } from '../../../main.js';

// Mock external dependencies
jest.mock('../../../utils.js');
jest.mock('../../../main.js', () => ({
    EVENTS: {
        CATEGORY_UPDATED: 'categoryUpdated',
        SETTINGS_UPDATED: 'settingsUpdated'
    },
    managers: {
        settings: {
            getCurrentLimit: jest.fn().mockReturnValue(10)
        }
    }
}));

describe('Category Module Integration', () => {
    let manager;
    let container;

    beforeEach(() => {
        // Setup DOM environment
        container = document.createElement('div');
        container.innerHTML = `
            <form id="categoryForm"></form>
            <div id="categoryTableBody"></div>
            <div id="categoryStats"></div>
        `;
        document.body.appendChild(container);

        // Mock API calls
        global.apiGet = jest.fn();
        global.apiPost = jest.fn();
        global.apiPut = jest.fn();
        global.apiDelete = jest.fn();

        // Initialize manager
        manager = new CategoryManager();

        // Clear all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('End-to-End Category Management', () => {
        test('complete category lifecycle', async () => {
            // 1. Initial load
            const initialCategories = [
                { id: 1, name: 'Existing Category', itemLimit: 5, createdAt: new Date() }
            ];
            global.apiGet.mockResolvedValueOnce({ data: initialCategories });
            
            await manager.loadCategories();
            expect(manager.tableBody.innerHTML).toContain('Existing Category');
            expect(manager.categoryStats.innerHTML).toContain('Total Categories: 1');

            // 2. Create new category
            const newCategory = { id: 2, name: 'New Category', itemLimit: 3, createdAt: new Date() };
            global.apiPost.mockResolvedValueOnce({ data: newCategory });
            global.apiGet.mockResolvedValueOnce({ 
                data: [...initialCategories, newCategory] 
            });

            manager.nameInput.value = 'New Category';
            manager.itemLimitSelect.value = '3';
            await manager.handleSubmit(new Event('submit'));

            expect(showMessage).toHaveBeenCalledWith(
                'Category created successfully',
                'success',
                'category'
            );
            expect(manager.tableBody.innerHTML).toContain('New Category');
            expect(manager.categoryStats.innerHTML).toContain('Total Categories: 2');

            // 3. Edit category
            const updatedCategory = { ...newCategory, name: 'Updated Category', itemLimit: 4 };
            global.apiPut.mockResolvedValueOnce({ data: updatedCategory });
            global.apiGet.mockResolvedValueOnce({ 
                data: [initialCategories[0], updatedCategory] 
            });

            manager.editCategory(2, 'Updated Category', 4);
            await manager.handleSubmit(new Event('submit'));

            expect(showMessage).toHaveBeenCalledWith(
                'Category updated successfully',
                'success',
                'category'
            );
            expect(manager.tableBody.innerHTML).toContain('Updated Category');

            // 4. Delete category
            window.confirm = jest.fn().mockReturnValue(true);
            global.apiDelete.mockResolvedValueOnce({});
            global.apiGet.mockResolvedValueOnce({ data: initialCategories });

            await manager.deleteCategory(2);

            expect(showMessage).toHaveBeenCalledWith(
                'Category deleted successfully',
                'success',
                'category'
            );
            expect(manager.tableBody.innerHTML).not.toContain('Updated Category');
            expect(manager.categoryStats.innerHTML).toContain('Total Categories: 1');
        });
    });

    describe('Component Integration', () => {
        test('form updates trigger table and stats refresh', async () => {
            const categories = [
                { id: 1, name: 'Test Category', itemLimit: 5, createdAt: new Date() }
            ];
            global.apiPost.mockResolvedValueOnce({ data: categories[0] });
            global.apiGet.mockResolvedValueOnce({ data: categories });

            manager.nameInput.value = 'Test Category';
            manager.itemLimitSelect.value = '5';
            await manager.handleSubmit(new Event('submit'));

            expect(manager.tableBody.innerHTML).toContain('Test Category');
            expect(manager.categoryStats.innerHTML).toContain('Total Categories: 1');
            expect(manager.categoryStats.innerHTML).toContain('With Limits: 1');
        });

        test('table sorting maintains data integrity', async () => {
            const categories = [
                { id: 1, name: 'A Category', itemLimit: 5, createdAt: new Date() },
                { id: 2, name: 'B Category', itemLimit: 3, createdAt: new Date() }
            ];
            global.apiGet.mockResolvedValueOnce({ data: categories });

            await manager.loadCategories();
            const rows = manager.tableBody.querySelectorAll('tr');
            expect(rows[0].cells[0].textContent).toBe('A Category');
            expect(rows[1].cells[0].textContent).toBe('B Category');
        });

        test('form validation prevents invalid submissions', async () => {
            manager.nameInput.value = 'ab'; // Too short
            await manager.handleSubmit(new Event('submit'));

            expect(global.apiPost).not.toHaveBeenCalled();
            expect(showMessage).toHaveBeenCalledWith(
                expect.stringContaining('three characters'),
                'error',
                'category'
            );
        });
    });

    describe('Error Handling Integration', () => {
        test('handles API errors gracefully', async () => {
            global.apiGet.mockRejectedValueOnce(new Error('Network error'));
            await manager.loadCategories();

            expect(showMessage).toHaveBeenCalledWith(
                'Network error',
                'error',
                'category'
            );
            expect(manager.tableBody.innerHTML).toContain('No categories available');
        });

        test('maintains state on failed operations', async () => {
            // Initial state
            const categories = [
                { id: 1, name: 'Initial Category', itemLimit: 5, createdAt: new Date() }
            ];
            global.apiGet.mockResolvedValueOnce({ data: categories });
            await manager.loadCategories();

            // Failed update
            global.apiPut.mockRejectedValueOnce(new Error('Update failed'));
            manager.editCategory(1, 'Updated Name', 6);
            await manager.handleSubmit(new Event('submit'));

            expect(showMessage).toHaveBeenCalledWith(
                'Update failed',
                'error',
                'category'
            );
            expect(manager.tableBody.innerHTML).toContain('Initial Category');
        });
    });

    describe('Event Handling Integration', () => {
        test('settings updates trigger limit dropdown refresh', () => {
            const event = new Event(EVENTS.SETTINGS_UPDATED);
            document.dispatchEvent(event);

            const options = manager.itemLimitSelect.options;
            expect(options.length).toBeGreaterThan(1);
            expect(options[0].value).toBe('0');
        });

        test('category updates trigger related component refreshes', async () => {
            const event = new Event(EVENTS.CATEGORY_UPDATED);
            document.dispatchEvent(event);

            expect(global.apiGet).toHaveBeenCalled();
        });
    });
});