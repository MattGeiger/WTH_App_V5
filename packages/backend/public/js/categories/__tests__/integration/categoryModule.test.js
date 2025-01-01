/**
 * @jest-environment jsdom
 */

import { CategoryManager } from '../../CategoryManager';

describe('Category Module Integration', () => {
    let manager;
    let container;
    
    // Consistent test data
    const mockData = {
        id: 1,
        name: 'Existing Category',
        itemLimit: 5,
        createdAt: new Date().toISOString()
    };

    // Mock API functions
    const mockApi = {
        get: jest.fn().mockResolvedValue({ data: [mockData] }),
        post: jest.fn().mockImplementation((url, data) => Promise.resolve({ 
            data: { ...data, id: 2, createdAt: new Date().toISOString() }
        })),
        put: jest.fn().mockImplementation((url, data) => Promise.resolve({ 
            data: { ...data, createdAt: new Date().toISOString() }
        })),
        delete: jest.fn().mockResolvedValue({ success: true })
    };

    const mockShowMessage = jest.fn();
    
    const setupDom = () => {
        // Clear any existing DOM
        document.body.innerHTML = '';
        
        container = document.createElement('div');
        container.innerHTML = `
            <form id="categoryForm">
                <input type="hidden" id="categoryId" value="">
                <input type="text" id="categoryName" value="">
                <select id="categoryItemLimit">
                    <option value="0">No Limit</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="categoryTableBody"></tbody>
                </table>
            </div>
            <div id="categoryStats" class="stats">
                <span role="text">Total Categories: 0</span>
            </div>
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

        // Initialize with test data
        return manager.loadCategories();
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.restoreAllMocks();
    });

    describe('End-to-End Category Management', () => {
        test('complete category lifecycle', async () => {
            // 1. Verify initial load
            expect(mockApi.get).toHaveBeenCalledWith('/api/categories');
            
            const tbody = document.getElementById('categoryTableBody');
            await new Promise(resolve => setTimeout(resolve, 0)); // Allow DOM update
            const rows = tbody.querySelectorAll('tr');
            expect(rows).toHaveLength(1);
            expect(rows[0].querySelector('td').textContent).toBe('Existing Category');

            // 2. Create new category
            const newData = { name: 'New Category', itemLimit: 10 };
            manager.nameInput.value = newData.name;
            manager.itemLimitSelect.value = String(newData.itemLimit);
            
            mockApi.get.mockResolvedValueOnce({ data: [mockData, { ...newData, id: 2 }] });
            await manager.boundHandleSubmit(new Event('submit'));
            
            expect(mockApi.post).toHaveBeenCalledWith('/api/categories', newData);

            // 3. Edit category
            const updateData = { name: 'Updated Category', itemLimit: 15 };
            manager.editCategory(1, updateData.name, updateData.itemLimit);
            
            mockApi.get.mockResolvedValueOnce({ data: [{ ...updateData, id: 1 }] });
            await manager.boundHandleSubmit(new Event('submit'));
            
            expect(mockApi.put).toHaveBeenCalledWith('/api/categories/1', updateData);

            // 4. Delete category
            window.confirm = jest.fn().mockReturnValue(true);
            mockApi.get.mockResolvedValueOnce({ data: [] });
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
            manager.itemLimitSelect.value = String(formData.itemLimit);
            
            mockApi.get.mockResolvedValueOnce({ data: [mockData, { ...formData, id: 2 }] });
            await manager.boundHandleSubmit(new Event('submit'));

            expect(mockApi.post).toHaveBeenCalledWith('/api/categories', formData);
            expect(mockApi.get).toHaveBeenCalled();
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
            await new Promise(resolve => setTimeout(resolve, 0)); // Allow DOM update
            
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

            // Setup initial state
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

            const dispatchSpy = jest.spyOn(document, 'dispatchEvent');
            const reloadSpy = jest.spyOn(manager, 'loadCategories');

            manager.nameInput.value = categoryData.name;
            manager.itemLimitSelect.value = String(categoryData.itemLimit);
            
            mockApi.get.mockResolvedValueOnce({ data: [mockData, { ...categoryData, id: 2 }] });
            await manager.boundHandleSubmit(new Event('submit'));

            expect(dispatchSpy).toHaveBeenCalled();
            expect(reloadSpy).toHaveBeenCalled();
            
            const categoryUpdatedEvents = dispatchSpy.mock.calls.filter(
                call => call[0].type === 'categoryUpdated'
            );
            expect(categoryUpdatedEvents).toHaveLength(1);
        });
    });
});