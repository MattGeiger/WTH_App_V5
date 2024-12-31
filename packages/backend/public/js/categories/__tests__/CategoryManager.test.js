/**
 * @jest-environment jsdom
 */

import { CategoryManager } from '../CategoryManager.js';

describe('CategoryManager', () => {
    let manager;
    let container;
    
    // Mock API functions
    const mockApi = {
        get: jest.fn().mockResolvedValue({ data: [] }),
        post: jest.fn().mockResolvedValue({ success: true }),
        put: jest.fn().mockResolvedValue({ success: true }),
        delete: jest.fn().mockResolvedValue({ success: true })
    };

    // Mock message display
    const mockShowMessage = jest.fn();

    const setupDom = () => {
        container = document.createElement('div');
        container.innerHTML = `
            <form id="categoryForm">
                <input type="hidden" id="categoryId" value="">
                <input type="text" id="categoryName" value="">
                <select id="itemLimit">
                    <option value="0">No Limit</option>
                </select>
                <button type="submit">Add Category</button>
                <button type="reset" id="resetForm">Reset</button>
            </form>
            <div id="categoryTableContainer">
                <table>
                    <thead>
                        <tr>
                            <th data-sort-key="name">Name</th>
                            <th data-sort-key="itemLimit">Limit</th>
                            <th data-sort-key="createdAt">Created</th>
                        </tr>
                    </thead>
                    <tbody id="categoryTableBody"></tbody>
                </table>
            </div>
            <div id="categoryStats"></div>
        `;
        document.body.appendChild(container);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setupDom();
        
        manager = new CategoryManager({
            apiGet: mockApi.get,
            apiPost: mockApi.post,
            apiPut: mockApi.put,
            apiDelete: mockApi.delete,
            showMessage: mockShowMessage
        });
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.restoreAllMocks();
    });

    describe('initialization', () => {
        test('extends EventTarget', () => {
            expect(manager).toBeInstanceOf(EventTarget);
        });

        test('initializes with correct elements', () => {
            expect(manager.form).toBeDefined();
            expect(manager.nameInput).toBeDefined();
            expect(manager.itemLimitSelect).toBeDefined();
            expect(manager.tableBody).toBeDefined();
            expect(manager.categoryStats).toBeDefined();
        });

        test('sets up event listeners', () => {
            const addEventListenerSpy = jest.spyOn(manager.form, 'addEventListener');
            manager.setupEventListeners();
            expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function));
            expect(addEventListenerSpy).toHaveBeenCalledWith('reset', expect.any(Function));
        });

        test('initializes sortable table', () => {
            expect(manager.sortableTable).toBeDefined();
            expect(typeof manager.sortableTable.sort).toBe('function');
            expect(manager.sortableTable.currentSort).toEqual({
                key: 'name',
                direction: 'asc'
            });
        });
    });

    describe('loadCategories', () => {
        test('fetches and displays categories', async () => {
            const mockData = [
                { id: 1, name: 'Category 1', itemLimit: 5, createdAt: new Date().toISOString() },
                { id: 2, name: 'Category 2', itemLimit: 0, createdAt: new Date().toISOString() }
            ];
            mockApi.get.mockResolvedValueOnce({ data: mockData });

            await manager.loadCategories();

            expect(mockApi.get).toHaveBeenCalledWith('/api/categories');
            const tbody = document.getElementById('categoryTableBody');
            const rows = tbody.querySelectorAll('tr');
            
            expect(rows).toHaveLength(2);
            expect(rows[0].querySelector('td').textContent).toBe('Category 1');
            expect(rows[1].querySelector('td').textContent).toBe('Category 2');
        });

        test('handles API errors', async () => {
            const error = new Error('Failed to load');
            mockApi.get.mockRejectedValueOnce(error);
            
            await manager.loadCategories();
            
            expect(mockShowMessage).toHaveBeenCalledWith(
                error.message,
                'error',
                'category'
            );
        });

        test('updates stats display', async () => {
            const mockData = [
                { id: 1, name: 'Category 1', itemLimit: 5 },
                { id: 2, name: 'Category 2', itemLimit: 0 }
            ];
            mockApi.get.mockResolvedValueOnce({ data: mockData });

            await manager.loadCategories();

            const stats = document.getElementById('categoryStats');
            const totalCategories = stats.querySelector('[role="text"]');
            expect(totalCategories).toBeTruthy();
            expect(totalCategories.textContent).toContain('2');
        });

        test('maintains sort order after reload', async () => {
            const mockData = [
                { id: 1, name: 'Zebra', itemLimit: 5 },
                { id: 2, name: 'Apple', itemLimit: 3 }
            ];
            mockApi.get.mockResolvedValueOnce({ data: mockData });
            
            await manager.loadCategories();
            
            const tbody = document.getElementById('categoryTableBody');
            const rows = tbody.querySelectorAll('tr');
            
            // Should be sorted by name (asc) initially
            expect(rows[0].querySelector('td').textContent).toBe('Apple');
            expect(rows[1].querySelector('td').textContent).toBe('Zebra');
        });
    });

    describe('sorting', () => {
        beforeEach(async () => {
            const mockData = [
                { id: 1, name: 'Zebra', itemLimit: 5 },
                { id: 2, name: 'Apple', itemLimit: 3 }
            ];
            mockApi.get.mockResolvedValueOnce({ data: mockData });
            await manager.loadCategories();
        });

        test('sorts table rows correctly', () => {
            const tbody = document.getElementById('categoryTableBody');
            const rows = tbody.querySelectorAll('tr');
            
            // Initial sort (asc)
            expect(rows[0].querySelector('td').textContent).toBe('Apple');
            expect(rows[1].querySelector('td').textContent).toBe('Zebra');

            // Toggle sort (desc)
            manager.sortableTable.sort('name');
            const sortedRows = tbody.querySelectorAll('tr');
            expect(sortedRows[0].querySelector('td').textContent).toBe('Zebra');
            expect(sortedRows[1].querySelector('td').textContent).toBe('Apple');
        });

        test('toggles sort direction', () => {
            // Initial state
            expect(manager.sortableTable.currentSort.key).toBe('name');
            expect(manager.sortableTable.currentSort.direction).toBe('asc');
            
            // First click - same column
            manager.sortableTable.sort('name');
            expect(manager.sortableTable.currentSort.direction).toBe('desc');
        });

        test('sorts numeric values correctly', () => {
            manager.sortableTable.sort('itemLimit');
            
            const tbody = document.getElementById('categoryTableBody');
            const rows = tbody.querySelectorAll('tr');
            const limits = Array.from(rows).map(row => 
                parseInt(row.querySelectorAll('td')[1].textContent) || 0
            );
            
            expect(limits[0]).toBe(3);
            expect(limits[1]).toBe(5);
        });

        test('updates sort indicators', () => {
            const nameHeader = document.querySelector('th[data-sort-key="name"]');
            expect(nameHeader.classList.contains('sorted-asc')).toBe(true);
            
            manager.sortableTable.sort('name');
            expect(nameHeader.classList.contains('sorted-desc')).toBe(true);
        });
    });

    describe('form submission', () => {
        beforeEach(() => {
            manager.nameInput.value = 'Test Category';
            manager.itemLimitSelect.value = '5';
        });

        test('creates new category', async () => {
            const formatted = {
                name: 'Test Category',
                itemLimit: 5
            };
            
            mockApi.post.mockResolvedValueOnce({ data: formatted });
            await manager.boundHandleSubmit(new Event('submit'));
            
            expect(mockApi.post).toHaveBeenCalledWith('/api/categories', formatted);
            expect(mockShowMessage).toHaveBeenCalledWith(
                'Category created successfully',
                'success',
                'category'
            );
        });

        test('updates existing category', async () => {
            document.getElementById('categoryId').value = '1';
            const formatted = {
                name: 'Test Category',
                itemLimit: 5
            };
            
            mockApi.put.mockResolvedValueOnce({ data: formatted });
            await manager.boundHandleSubmit(new Event('submit'));
            
            expect(mockApi.put).toHaveBeenCalledWith('/api/categories/1', formatted);
        });

        test('validates input before submission', async () => {
            manager.nameInput.value = 'ab'; // Too short
            await manager.boundHandleSubmit(new Event('submit'));
            
            expect(mockApi.post).not.toHaveBeenCalled();
            expect(mockShowMessage).toHaveBeenCalledWith(
                expect.stringContaining('three characters'),
                'error',
                'category'
            );
        });

        test('handles submission errors', async () => {
            const error = new Error('API Error');
            mockApi.post.mockRejectedValueOnce(error);
            
            await manager.boundHandleSubmit(new Event('submit'));
            
            expect(mockShowMessage).toHaveBeenCalledWith(
                error.message,
                'error',
                'category'
            );
        });
    });

    describe('form reset', () => {
        test('clears form fields', () => {
            manager.nameInput.value = 'Test';
            manager.itemLimitSelect.value = '5';
            document.getElementById('categoryId').value = '1';

            manager.handleReset();

            expect(manager.nameInput.value).toBe('');
            expect(manager.itemLimitSelect.value).toBe('0');
            expect(document.getElementById('categoryId').value).toBe('');
        });

        test('resets form state', () => {
            document.getElementById('categoryId').value = '1';
            manager.handleReset();
            expect(document.getElementById('categoryId').value).toBe('');
        });
    });

    describe('deletion', () => {
        beforeEach(() => {
            window.confirm = jest.fn().mockReturnValue(true);
        });

        test('confirms before deleting', async () => {
            await manager.deleteCategory(1);
            expect(window.confirm).toHaveBeenCalled();
        });

        test('deletes after confirmation', async () => {
            mockApi.delete.mockResolvedValueOnce({ success: true });
            
            await manager.deleteCategory(1);
            
            expect(mockApi.delete).toHaveBeenCalledWith('/api/categories/1');
            expect(mockShowMessage).toHaveBeenCalledWith(
                'Category deleted successfully',
                'success',
                'category'
            );
        });

        test('handles deletion errors', async () => {
            const error = new Error('Delete failed');
            mockApi.delete.mockRejectedValueOnce(error);
            
            await manager.deleteCategory(1);
            
            expect(mockShowMessage).toHaveBeenCalledWith(
                error.message,
                'error',
                'category'
            );
        });

        test('dispatches event after successful deletion', async () => {
            mockApi.delete.mockResolvedValueOnce({ success: true });
            const eventSpy = jest.spyOn(document, 'dispatchEvent');
            
            await manager.deleteCategory(1);
            
            const categoryUpdatedEvents = eventSpy.mock.calls.filter(
                call => call[0].type === 'categoryUpdated'
            );
            expect(categoryUpdatedEvents.length).toBeGreaterThan(0);
        });
    });

    describe('settings updates', () => {
        test('updates limit options', () => {
            manager.handleSettingsUpdate({ detail: { maxItemLimit: 3 } });
            
            const options = Array.from(manager.itemLimitSelect.options);
            expect(options).toHaveLength(4); // No Limit + 3 options
            expect(options[0].value).toBe('0');
            expect(options[3].value).toBe('3');
        });

        test('preserves selected value when updating options', () => {
            manager.itemLimitSelect.value = '2';
            manager.handleSettingsUpdate({ detail: { maxItemLimit: 5 } });
            expect(manager.itemLimitSelect.value).toBe('2');
        });

        test('resets to "No Limit" if selected value exceeds new max', () => {
            manager.itemLimitSelect.value = '5';
            manager.handleSettingsUpdate({ detail: { maxItemLimit: 3 } });
            expect(manager.itemLimitSelect.value).toBe('0');
        });
    });
});