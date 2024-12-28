import { FoodItemManager } from '../FoodItemManager.js';
import { apiGet, apiPost, apiPut, apiDelete, showMessage } from '../../utils.js';

jest.mock('../../utils.js');
jest.mock('../ui/forms.js', () => ({
    createFormLayout: jest.fn()
}));
jest.mock('../../utils/sortableTable.js');

describe('FoodItemManager', () => {
    let manager;
    let mockSettingsManager;

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <form id="foodItemForm">
                <button type="submit">Submit</button>
            </form>
            <div id="foodItemTableBody"></div>
            <select id="itemLimitSelect"></select>
            <button id="resetFoodItemForm">Reset</button>
            <select id="foodItemCategory"></select>
            <input id="foodItemName" />
            <div id="foodItemStats"></div>
            <div id="foodItemId"></div>
        `;

        mockSettingsManager = {
            getCurrentLimit: jest.fn().mockReturnValue(10)
        };

        // Reset mocks
        apiGet.mockReset();
        apiPost.mockReset();
        apiPut.mockReset();
        apiDelete.mockReset();
        showMessage.mockReset();

        manager = new FoodItemManager(mockSettingsManager);
    });

    describe('Initialization', () => {
        it('should initialize with correct DOM elements', () => {
            expect(manager.form).toBeTruthy();
            expect(manager.tableBody).toBeTruthy();
            expect(manager.itemLimitSelect).toBeTruthy();
            expect(manager.resetButton).toBeTruthy();
            expect(manager.categorySelect).toBeTruthy();
            expect(manager.nameInput).toBeTruthy();
            expect(manager.foodItemStats).toBeTruthy();
        });

        it('should initialize item limit dropdown', () => {
            expect(manager.itemLimitSelect.children.length).toBe(11); // 0-10
            expect(manager.itemLimitSelect.children[0].value).toBe('0');
            expect(manager.itemLimitSelect.children[0].textContent).toBe('No Limit');
        });

        it('should set up initial event listeners', () => {
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
            apiGet.mockResolvedValue(mockCategories);
        });

        it('should load categories successfully', async () => {
            await manager.loadCategories();
            expect(manager.categorySelect.children.length).toBe(3); // Including default option
            expect(manager.form.querySelector('button[type="submit"]').disabled).toBe(false);
        });

        it('should handle empty categories', async () => {
            apiGet.mockResolvedValue({ data: [] });
            await manager.loadCategories();
            expect(manager.categorySelect.children.length).toBe(1);
            expect(manager.form.querySelector('button[type="submit"]').disabled).toBe(true);
            expect(showMessage).toHaveBeenCalled();
        });

        it('should handle API errors', async () => {
            const error = new Error('API Error');
            apiGet.mockRejectedValue(error);
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

        it('should create item successfully', async () => {
            apiPost.mockResolvedValue({ success: true });
            const result = await manager.createItem(mockItem);
            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item created successfully',
                'success',
                'foodItem'
            );
        });

        it('should update item successfully', async () => {
            apiPut.mockResolvedValue({ success: true });
            const result = await manager.updateItem(1, mockItem);
            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item updated successfully',
                'success',
                'foodItem'
            );
        });

        it('should delete item after confirmation', async () => {
            window.confirm = jest.fn().mockReturnValue(true);
            apiDelete.mockResolvedValue({ success: true });
            
            await manager.deleteFoodItem(1);
            expect(apiDelete).toHaveBeenCalledWith('/api/food-items/1');
            expect(showMessage).toHaveBeenCalledWith(
                'Food item deleted successfully',
                'success',
                'foodItem'
            );
        });

        it('should handle delete cancellation', async () => {
            window.confirm = jest.fn().mockReturnValue(false);
            await manager.deleteFoodItem(1);
            expect(apiDelete).not.toHaveBeenCalled();
        });
    });

    describe('Form Management', () => {
        it('should reset form correctly', () => {
            document.getElementById('foodItemId').value = '1';
            manager.itemLimitSelect.value = '5';
            const submitButton = manager.form.querySelector('button[type="submit"]');
            submitButton.textContent = 'Update Food Item';

            manager.resetForm();

            expect(document.getElementById('foodItemId').value).toBe('');
            expect(manager.itemLimitSelect.value).toBe('0');
            expect(submitButton.textContent).toBe('Add Food Item');
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
            expect(manager.form.querySelector('button[type="submit"]').textContent)
                .toBe('Update Food Item');
        });
    });

    describe('Sort Value Handling', () => {
        it('should handle name sort values', () => {
            const row = { cells: [{ textContent: 'Test Item' }] };
            expect(manager.getSortValue(row, 'name')).toBe('test item');
        });

        it('should handle limit sort values', () => {
            const row = { cells: [null, null, null, null, { textContent: 'No Limit' }] };
            expect(manager.getSortValue(row, 'limit')).toBe(-1);
            
            row.cells[4].textContent = '5';
            expect(manager.getSortValue(row, 'limit')).toBe(5);
        });

        it('should handle date sort values', () => {
            const date = new Date();
            const row = { cells: [null, null, null, null, null, { textContent: date.toLocaleDateString() }] };
            const result = manager.getSortValue(row, 'created');
            expect(typeof result).toBe('number');
        });
    });
});