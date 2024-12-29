import { createFoodItemRow, displayFoodItems } from '../../ui/table.js';

describe('Table UI Components', () => {
    let mockManager;
    const mockItem = {
        id: 1,
        name: 'Test Item',
        category: { name: 'Test Category', id: 1 },
        itemLimit: 5,
        limitType: 'perHousehold',
        inStock: true,
        mustGo: false,
        lowSupply: true,
        readyToEat: false,
        kosher: true,
        halal: false,
        vegetarian: true,
        vegan: false,
        glutenFree: true,
        organic: false,
        createdAt: '2024-12-27T12:00:00Z'
    };

    beforeEach(() => {
        document.body.innerHTML = '<table><tbody id="testTableBody"></tbody></table>';
        mockManager = {
            tableBody: document.getElementById('testTableBody'),
            sortableTable: {
                setupSortingControls: jest.fn()
            }
        };
    });

    describe('Row Creation', () => {
        let row;

        beforeEach(() => {
            const rowHtml = createFoodItemRow(mockItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            row = container.firstElementChild;
        });

        it('should create row with all cells', () => {
            const cells = row.querySelectorAll('td');
            expect(cells.length).toBe(7);
        });

        it('should format item name and category', () => {
            const cells = row.querySelectorAll('td');
            expect(cells[0].textContent).toBe('Test Item');
            expect(cells[1].textContent).toBe('Test Category');
        });

        it('should format status flags correctly', () => {
            const statusCell = row.querySelectorAll('td')[2];
            expect(statusCell.textContent).toContain('In Stock');
            expect(statusCell.textContent).toContain('Low Supply');
            expect(statusCell.textContent).not.toContain('Must Go');
        });

        it('should format status flags when all are set', () => {
            const allFlagsItem = {
                ...mockItem,
                inStock: true,
                mustGo: true,
                lowSupply: true,
                readyToEat: true
            };
            const rowHtml = createFoodItemRow(allFlagsItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            const statusCell = container.querySelector('td:nth-child(3)');
            expect(statusCell.textContent).toContain('In Stock');
            expect(statusCell.textContent).toContain('Must Go');
            expect(statusCell.textContent).toContain('Low Supply');
            expect(statusCell.textContent).toContain('Ready to Eat');
        });

        it('should format status flags when none are set', () => {
            const noFlagsItem = {
                ...mockItem,
                inStock: false,
                mustGo: false,
                lowSupply: false,
                readyToEat: false
            };
            const rowHtml = createFoodItemRow(noFlagsItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            const statusCell = container.querySelector('td:nth-child(3)');
            expect(statusCell.textContent).toBe('Out of Stock');
        });

        it('should format dietary flags correctly', () => {
            const dietaryCell = row.querySelectorAll('td')[3];
            expect(dietaryCell.textContent).toContain('Kosher');
            expect(dietaryCell.textContent).toContain('Vegetarian');
            expect(dietaryCell.textContent).toContain('GF');
            expect(dietaryCell.textContent).not.toContain('Halal');
        });

        it('should format dietary flags when all are set', () => {
            const allDietaryItem = {
                ...mockItem,
                kosher: true,
                halal: true,
                vegetarian: true,
                vegan: true,
                glutenFree: true,
                organic: true
            };
            const rowHtml = createFoodItemRow(allDietaryItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            const dietaryCell = container.querySelector('td:nth-child(4)');
            expect(dietaryCell.textContent).toContain('Kosher');
            expect(dietaryCell.textContent).toContain('Halal');
            expect(dietaryCell.textContent).toContain('Vegetarian');
            expect(dietaryCell.textContent).toContain('Vegan');
            expect(dietaryCell.textContent).toContain('GF');
            expect(dietaryCell.textContent).toContain('Organic');
        });

        it('should format dietary flags when none are set', () => {
            const noDietaryItem = {
                ...mockItem,
                kosher: false,
                halal: false,
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                organic: false
            };
            const rowHtml = createFoodItemRow(noDietaryItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            const dietaryCell = container.querySelector('td:nth-child(4)');
            expect(dietaryCell.textContent).toBe('None');
        });

        it('should format limit display for per household', () => {
            const limitCell = row.querySelectorAll('td')[4];
            expect(limitCell.textContent).toBe('5 Per Household');
        });

        it('should format limit display for per person', () => {
            const perPersonItem = { ...mockItem, limitType: 'perPerson' };
            const rowHtml = createFoodItemRow(perPersonItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            const limitCell = container.querySelector('td:nth-child(5)');
            expect(limitCell.textContent).toBe('5 Per Person');
        });

        it('should format limit display for no limit', () => {
            const noLimitItem = { ...mockItem, itemLimit: 0 };
            const rowHtml = createFoodItemRow(noLimitItem, mockManager);
            const container = document.createElement('tbody');
            container.innerHTML = rowHtml;
            const limitCell = container.querySelector('td:nth-child(5)');
            expect(limitCell.textContent).toBe('No Limit');
        });

        it('should format date correctly', () => {
            const dateCell = row.querySelectorAll('td')[5];
            expect(dateCell.textContent).toBe(new Date(mockItem.createdAt).toLocaleDateString());
        });

        it('should create action buttons', () => {
            const actionCell = row.querySelectorAll('td')[6];
            expect(actionCell.querySelector('.edit-food-item-btn')).toBeTruthy();
            expect(actionCell.querySelector('.delete-food-item-btn')).toBeTruthy();
        });

        it('should store complete item data in edit button', () => {
            const editButton = row.querySelector('.edit-food-item-btn');
            const storedData = JSON.parse(editButton.dataset.item);
            expect(storedData).toEqual({
                id: mockItem.id,
                name: mockItem.name,
                categoryId: mockItem.category.id,
                itemLimit: mockItem.itemLimit,
                limitType: mockItem.limitType,
                inStock: mockItem.inStock,
                mustGo: mockItem.mustGo,
                lowSupply: mockItem.lowSupply,
                kosher: mockItem.kosher,
                halal: mockItem.halal,
                vegetarian: mockItem.vegetarian,
                vegan: mockItem.vegan,
                glutenFree: mockItem.glutenFree,
                organic: mockItem.organic,
                readyToEat: mockItem.readyToEat
            });
        });
    });

    describe('Table Display', () => {
        it('should handle empty food items array', () => {
            displayFoodItems([], mockManager);
            expect(mockManager.tableBody.innerHTML).toContain('No food items found');
            expect(mockManager.sortableTable.setupSortingControls).not.toHaveBeenCalled();
        });

        it('should handle null food items', () => {
            displayFoodItems(null, mockManager);
            expect(mockManager.tableBody.innerHTML).toContain('No food items found');
            expect(mockManager.sortableTable.setupSortingControls).not.toHaveBeenCalled();
        });

        it('should handle undefined food items', () => {
            displayFoodItems(undefined, mockManager);
            expect(mockManager.tableBody.innerHTML).toContain('No food items found');
            expect(mockManager.sortableTable.setupSortingControls).not.toHaveBeenCalled();
        });

        it('should display multiple food items', () => {
            const items = [
                mockItem,
                { ...mockItem, id: 2, name: 'Second Item' }
            ];

            displayFoodItems(items, mockManager);
            
            const rows = mockManager.tableBody.querySelectorAll('tr');
            expect(rows.length).toBe(2);
            expect(mockManager.sortableTable.setupSortingControls).toHaveBeenCalled();
        });

        it('should handle items with missing category', () => {
            const itemWithoutCategory = { ...mockItem, category: null };
            displayFoodItems([itemWithoutCategory], mockManager);
            
            const categoryCell = mockManager.tableBody.querySelector('td:nth-child(2)');
            expect(categoryCell.textContent).toBe('Unknown');
        });

        it('should format items with no limit', () => {
            const unlimitedItem = { ...mockItem, itemLimit: 0 };
            displayFoodItems([unlimitedItem], mockManager);
            
            const limitCell = mockManager.tableBody.querySelector('td:nth-child(5)');
            expect(limitCell.textContent).toBe('No Limit');
        });
    });
});