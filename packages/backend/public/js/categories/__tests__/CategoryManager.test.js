/**
 * @jest-environment jsdom
 */

import { CategoryManager } from '../CategoryManager.js';
import { showMessage } from '../../utils.js';
import { EVENTS } from '../../main.js';

// Mock dependencies
jest.mock('../../utils.js');
jest.mock('../../main.js', () => ({
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

describe('CategoryManager', () => {
    let manager;
    let container;

    beforeEach(() => {
        // Setup DOM
        container = document.createElement('div');
        container.innerHTML = `
            <form id="categoryForm">
                <input type="hidden" id="categoryId" value="" />
                <input type="text" id="categoryName" value="" />
                <select id="categoryItemLimit">
                    <option value="0">No Limit</option>
                </select>
                <button type="submit">Add Category</button>
                <button type="button" id="resetForm">Reset</button>
            </form>
            <div id="categoryTableBody"></div>
            <div id="categoryStats"></div>
        `;
        document.body.appendChild(container);

        // Initialize manager
        manager = new CategoryManager();

        // Clear mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        test('initializes with correct elements', () => {
            expect(manager.form).not.toBeNull();
            expect(manager.tableBody).not.toBeNull();
            expect(manager.nameInput).not.toBeNull();
            expect(manager.itemLimitSelect).not.toBeNull();
            expect(manager.resetButton).not.toBeNull();
            expect(manager.categoryStats).not.toBeNull();
        });

        test('sets up initial item limit dropdown', () => {
            const options = manager.itemLimitSelect.options;
            expect(options[0].value).toBe('0');
            expect(options[0].text).toBe('No Limit');
            expect(options.length).toBeGreaterThan(1);
        });

        test('initializes sortable table', () => {
            expect(manager.sortableTable).toBeDefined();
        });
    });

    describe('event handling', () => {
        test('handles form submission', async () => {
            const submitEvent = new Event('submit');
            manager.handleSubmit = jest.fn();

            await manager.form.dispatchEvent(submitEvent);
            expect(manager.handleSubmit).toHaveBeenCalled();
        });

        test('handles form reset', () => {
            manager.resetForm = jest.fn();
            manager.resetButton.click();
            expect(manager.resetForm).toHaveBeenCalled();
        });

        test('handles name input changes', () => {
            const inputEvent = new Event('input');
            manager.handleNameInput = jest.fn();

            manager.nameInput.dispatchEvent(inputEvent);
            expect(manager.handleNameInput).toHaveBeenCalled();
        });
    });

    describe('loadCategories', () => {
        test('updates display with categories', async () => {
            const mockCategories = [
                { id: 1, name: 'Category 1', itemLimit: 5 },
                { id: 2, name: 'Category 2', itemLimit: 0 }
            ];

            manager.displayCategories = jest.fn();
            manager.updateStats = jest.fn();

            // Mock the API call
            global.apiGet = jest.fn().mockResolvedValue({ data: mockCategories });

            await manager.loadCategories();

            expect(manager.displayCategories).toHaveBeenCalledWith(mockCategories);
            expect(manager.updateStats).toHaveBeenCalledWith(mockCategories);
            expect(manager.lastUpdated).toBeInstanceOf(Date);
        });

        test('handles load error', async () => {
            const error = new Error('Load failed');
            global.apiGet = jest.fn().mockRejectedValue(error);

            await manager.loadCategories();

            expect(showMessage).toHaveBeenCalledWith(
                error.message,
                'error',
                'category'
            );
        });
    });

    describe('form management', () => {
        test('resets form correctly', () => {
            // Set form values
            manager.nameInput.value = 'Test Category';
            manager.itemLimitSelect.value = '5';
            document.getElementById('categoryId').value = '1';

            manager.resetForm();

            expect(manager.nameInput.value).toBe('');
            expect(manager.itemLimitSelect.value).toBe('0');
            expect(document.getElementById('categoryId').value).toBe('');
            expect(manager.form.querySelector('button[type="submit"]').textContent)
                .toBe('Add Category');
        });

        test('sets up edit mode correctly', () => {
            manager.editCategory(1, 'Test Category', 5);

            expect(document.getElementById('categoryId').value).toBe('1');
            expect(manager.nameInput.value).toBe('Test Category');
            expect(manager.itemLimitSelect.value).toBe('5');
            expect(manager.form.querySelector('button[type="submit"]').textContent)
                .toBe('Update Category');
        });
    });

    describe('deletion', () => {
        test('confirms before deleting', async () => {
            window.confirm = jest.fn().mockReturnValue(false);
            await manager.deleteCategory(1);
            expect(global.apiDelete).not.toHaveBeenCalled();
        });

        test('handles successful deletion', async () => {
            window.confirm = jest.fn().mockReturnValue(true);
            global.apiDelete = jest.fn().mockResolvedValue({});

            await manager.deleteCategory(1);

            expect(global.apiDelete).toHaveBeenCalledWith('/api/categories/1');
            expect(showMessage).toHaveBeenCalledWith(
                'Category deleted successfully',
                'success',
                'category'
            );
            expect(document.dispatchEvent).toHaveBeenCalledWith(
                new Event(EVENTS.CATEGORY_UPDATED)
            );
        });

        test('handles deletion error', async () => {
            window.confirm = jest.fn().mockReturnValue(true);
            const error = new Error('Delete failed');
            global.apiDelete = jest.fn().mockRejectedValue(error);

            await manager.deleteCategory(1);

            expect(showMessage).toHaveBeenCalledWith(
                error.message,
                'error',
                'category'
            );
        });
    });
});