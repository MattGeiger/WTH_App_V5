import { FoodItemManager } from '../FoodItemManager.js';
import { showMessage } from '../../utils.js';
import { SortableTable } from '../../utils/sortableTable.js';

jest.mock('../../utils.js');
jest.mock('../../utils/sortableTable.js');

describe('FoodItemManager', () => {
    let manager;
    let mockSettingsManager;

    beforeEach(() => {
        // Setup complete DOM structure
        document.body.innerHTML = `
            <form id="foodItemForm">
                <input type="text" id="foodItemName" name="foodItemName">
                <select id="foodItemCategory"></select>
                <select id="itemLimitSelect"></select>
                <input type="hidden" id="foodItemId" value="">
                <div id="limitTypeContainer" style="display: none;">
                    <input type="radio" name="limitType" value="perHousehold" id="perHousehold" checked>
                    <label for="perHousehold">Per Household</label>
                    <input type="radio" name="limitType" value="perPerson" id="perPerson">
                    <label for="perPerson">Per Person</label>
                </div>
                <button type="submit">Add Food Item</button>
            </form>
            <div id="foodItemTableBody"></div>
            <div id="foodItemStats"></div>
        `;

        // Mock settings manager
        mockSettingsManager = {
            getCurrentLimit: jest.fn().mockReturnValue(10)
        };

        // Create manager instance
        manager = new FoodItemManager(mockSettingsManager);

        // Reset mocks
        showMessage.mockReset();
        SortableTable.mockClear();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with correct DOM elements', () => {
            expect(manager.form).toBeTruthy();
            expect(manager.tableBody).toBeTruthy();
            expect(manager.itemLimitSelect).toBeTruthy();
            expect(manager.categorySelect).toBeTruthy();
            expect(manager.nameInput).toBeTruthy();
            expect(manager.foodItemStats).toBeTruthy();
        });

        it('should initialize item limit dropdown', () => {
            expect(manager.itemLimitSelect.children.length).toBe(11); // 0-10
            const firstOption = manager.itemLimitSelect.children[0];
            expect(firstOption.value).toBe('0');
            expect(firstOption.textContent).toBe('No Limit');
        });

        it('should set up initial event listeners', () => {
            // Manually trigger events to test listeners
            const submitEvent = new Event('submit');
            manager.form.dispatchEvent(submitEvent);
            
            const inputEvent = new Event('input');
            manager.nameInput.dispatchEvent(inputEvent);
            
            const changeEvent = new Event('change');
            manager.itemLimitSelect.dispatchEvent(changeEvent);
            
            expect(manager.form.onsubmit).toBeTruthy();
            expect(manager.resetButton.onclick).toBeTruthy();
            expect(manager.nameInput.oninput).toBeTruthy();
        });
    });

    describe('Category Management', () => {
        const mockCategories = {
            data: [
                { id: 1, name: 'Category 1', itemLimit: 5 },
                { id: 2, name: 'Category 2', itemLimit: 0 }
            ]
        };

        beforeEach(() => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(mockCategories)
            });
        });

        it('should load categories successfully', async () => {
            await manager.loadCategories();
            expect(manager.categorySelect.children.length).toBe(3); // Including default option
            expect(manager.form.querySelector('button[type="submit"]').disabled).toBe(false);
        });

        it('should handle empty categories', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ data: [] })
            });

            await manager.loadCategories();
            expect(manager.categorySelect.children.length).toBe(1);
            expect(manager.form.querySelector('button[type="submit"]').disabled).toBe(true);
            expect(showMessage).toHaveBeenCalled();
        });

        it('should handle API errors', async () => {
            const error = new Error('API Error');
            global.fetch = jest.fn().mockRejectedValue(error);

            await manager.loadCategories();
            expect(showMessage).toHaveBeenCalledWith(error.message, 'error', 'foodItem');
        });
    });

    describe('Food Item Operations', () => {
        const mockItem = {
            id: 1,
            name: 'Test Item',
            categoryId: 1,
            itemLimit: 5,
            inStock: true
        };

        beforeEach(() => {
            document.getElementById('foodItemId').value = '';
        });

        it('should create item successfully', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true, data: mockItem })
            });

            const result = await manager.createItem(mockItem);
            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item created successfully',
                'success',
                'foodItem'
            );
        });

        it('should update item successfully', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true, data: mockItem })
            });

            const result = await manager.updateItem(1, mockItem);
            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item updated successfully',
                'success',
                'foodItem'
            );
        });

        it('should delete item after confirmation', async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ success: true })
            });
            global.confirm = jest.fn().mockReturnValue(true);

            await manager.deleteFoodItem(1);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item deleted successfully',
                'success',
                'foodItem'
            );
        });

        it('should handle delete cancellation', async () => {
            global.confirm = jest.fn().mockReturnValue(false);
            await manager.deleteFoodItem(1);
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    describe('Form Management', () => {
        beforeEach(() => {
            document.getElementById('foodItemId').value = '1';
            manager.itemLimitSelect.value = '5';
            document.getElementById('limitTypeContainer').style.display = 'block';
        });

        it('should reset form correctly', () => {
            manager.resetForm();
            expect(document.getElementById('foodItemId').value).toBe('');
            expect(manager.itemLimitSelect.value).toBe('0');
            expect(document.getElementById('limitTypeContainer').style.display).toBe('none');
            expect(manager.form.querySelector('button[type="submit"]').textContent).toBe('Add Food Item');
        });

        it('should populate form for editing', () => {
            const mockData = {
                id: 1,
                name: 'Test Item',
                categoryId: 2,
                itemLimit: 5,
                limitType: 'perPerson',
                inStock: true,
                kosher: true
            };

            manager.editFoodItem(JSON.stringify(mockData));
            expect(document.getElementById('foodItemId').value).toBe('1');
            expect(manager.nameInput.value).toBe('Test Item');
            expect(manager.categorySelect.value).toBe('2');
            expect(manager.itemLimitSelect.value).toBe('5');
            expect(manager.form.querySelector('button[type="submit"]').textContent).toBe('Update Food Item');
        });
    });

    describe('Sort Value Handling', () => {
        it('should handle name sort values', () => {
            const row = { cells: [{ textContent: 'Test Item' }] };
            const result = manager.getSortValue(row, 'name');
            expect(result).toBe('test item');
        });

        it('should handle limit sort values', () => {
            const noLimitRow = { 
                cells: Array(5).fill(null).map(() => ({ textContent: '' }))
            };
            noLimitRow.cells[4].textContent = 'No Limit';
            
            expect(manager.getSortValue(noLimitRow, 'limit')).toBe(-1);
            
            const limitRow = { 
                cells: Array(5).fill(null).map(() => ({ textContent: '' }))
            };
            limitRow.cells[4].textContent = '5';
            
            expect(manager.getSortValue(limitRow, 'limit')).toBe(5);
        });

        it('should handle date sort values', () => {
            const date = new Date();
            const row = { 
                cells: Array(6).fill(null).map(() => ({ textContent: '' }))
            };
            row.cells[5].textContent = date.toLocaleDateString();
            
            const result = manager.getSortValue(row, 'created');
            expect(typeof result).toBe('number');
            expect(result).toBeTruthy();
        });
    });
});