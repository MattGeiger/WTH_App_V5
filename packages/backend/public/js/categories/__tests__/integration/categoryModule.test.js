/**
 * @jest-environment jsdom
 */

import { CategoryManager } from '../../CategoryManager';

describe('Category Module Integration', () => {
    let manager;
    let container;
    
    const mockData = {
        id: 1,
        name: 'Existing Category',
        itemLimit: 5,
        createdAt: new Date().toISOString()
    };

    // Mock API functions with consistent response structure
    const mockApi = {
        get: jest.fn().mockResolvedValue({ data: [mockData] }),
        post: jest.fn().mockResolvedValue({ data: mockData }),
        put: jest.fn().mockResolvedValue({ data: mockData }),
        delete: jest.fn().mockResolvedValue({ success: true })
    };

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

    describe('End-to-End Category Management', () => {
        test('complete category lifecycle', async () => {
            // 1. Load existing categories
            await manager.loadCategories();
            expect(mockApi.get).toHaveBeenCalledWith('/api/categories');
            
            const tbody = document.getElementById('categoryTableBody');
            const rows = tbody.querySelectorAll('tr');
            expect(rows).toHaveLength(1);
            expect(rows[0].querySelector('td').textContent).toBe('Existing Category');

            // 2. Create new category
            manager.nameInput.value = 'New Category';
            manager.itemLimitSelect.value = '10';
            
            const submitEvent = new Event('submit');
            await manager.boundHandleSubmit(submitEvent);
            
            expect(mockApi.post).toHaveBeenCalledWith('/api/categories', {
                name: 'New Category',
                itemLimit: 10
            });

            // 3. Edit category
            manager.editCategory(1, 'Updated Category', 15);
            const editEvent = new Event('submit');
            await manager.boundHandleSubmit(editEvent);
            
            expect(mockApi.put).toHaveBeenCalledWith('/api/categories/1', {
                name: 'Updated Category',
                itemLimit: 15
            });

            // 4. Delete category
            window.confirm = jest.fn().mockReturnValue(true);
            await manager.deleteCategory(1);
            expect(mockApi.delete).toHaveBeenCalledWith('/api/categories/1');
        });
    });

    describe('Component Integration', () => {
        test('form updates trigger table and stats refresh', async () => {
            const formData = {
                name: 'Test Category',
                itemLimit: 5
            };

            manager.nameInput.value = formData.name;
            manager.itemLimitSelect.value = formData.itemLimit.toString();
            
            await manager.boundHandleSubmit(new Event('submit'));

            expect(mockApi.post).toHaveBeenCalledWith('/api/categories', formData);
            expect(mockApi.get).toHaveBeenCalled(); // Should reload after submit
            expect(mockShowMessage).toHaveBeenCalledWith(
                'Category created successfully',
                'success',
                'category'
            );
        });

        test('table sorting maintains data integrity', async () => {
            const sortData = [
                { name: 'B Category', itemLimit: 5, createdAt: new Date().toISOString() },
                { name: 'A Category', itemLimit: 3, createdAt: new Date().toISOString() }
            ];
            mockApi.get.mockResolvedValueOnce({ data: sortData });

            await manager.loadCategories();
            
            // Initial sort by name
            const tbody = document.getElementById('categoryTableBody');
            const rows = tbody.querySelectorAll('tr');
            expect(rows).toHaveLength(2);
            expect(rows[0].querySelector('td').textContent).toBe('A Category');
            expect(rows[1].querySelector('td').textContent).toBe('B Category');
        });

        test('form validation prevents invalid submissions', async () => {
            manager.nameInput.value = 'ab'; // Too short
            await manager.boundHandleSubmit(new Event('submit'));

            expect(mockApi.post).not.toHaveBeenCalled();
            expect(mockShowMessage).toHaveBeenCalledWith(
                'Category name must be at least three characters',
                'error',
                'category'
            );
        });
    });

    describe('Error Handling Integration', () => {
        test('handles API errors gracefully', async () => {
            const error = new Error('Network error');
            mockApi.get.mockRejectedValueOnce(error);
            await manager.loadCategories();

            expect(mockShowMessage).toHaveBeenCalledWith(
                'Network error',
                'error',
                'category'
            );
        });

        test('maintains state on failed operations', async () => {
            const updateData = {
                name: 'Updated Name',
                itemLimit: 6
            };

            manager.editCategory(1, updateData.name, updateData.itemLimit);
            mockApi.put.mockRejectedValueOnce(new Error('Update failed'));
            
            await manager.boundHandleSubmit(new Event('submit'));

            expect(mockApi.put).toHaveBeenCalledWith('/api/categories/1', updateData);
            expect(mockShowMessage).toHaveBeenCalledWith(
                'Update failed',
                'error',
                'category'
            );
        });
    });

    describe('Event Handling Integration', () => {
        test('settings updates trigger limit dropdown refresh', () => {
            const settings = { maxItemLimit: 10 };
            document.dispatchEvent(new CustomEvent('settingsUpdated', {
                detail: settings
            }));

            const options = Array.from(manager.itemLimitSelect.options);
            expect(options).toHaveLength(11); // No Limit + options 1-10
            expect(options[0].value).toBe('0');
            expect(options[10].value).toBe('10');
        });

        test('category updates trigger related component refreshes', async () => {
            const categoryData = {
                name: 'Test Category',
                itemLimit: 5
            };

            // Setup spies
            const dispatchSpy = jest.spyOn(document, 'dispatchEvent');
            const reloadSpy = jest.spyOn(manager, 'loadCategories');

            // Submit new category
            manager.nameInput.value = categoryData.name;
            manager.itemLimitSelect.value = categoryData.itemLimit.toString();
            await manager.boundHandleSubmit(new Event('submit'));

            // Verify events and reloads
            expect(dispatchSpy).toHaveBeenCalled();
            expect(reloadSpy).toHaveBeenCalled();
            
            const categoryUpdatedEvents = dispatchSpy.mock.calls.filter(
                call => call[0].type === 'categoryUpdated'
            );
            expect(categoryUpdatedEvents).toHaveLength(1);
        });
    });
});