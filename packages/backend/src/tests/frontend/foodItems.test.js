import { FoodItemManager } from '../../../public/js/foodItems';
import { showMessage } from '../../../public/js/utils';

describe('FoodItemManager', () => {
    let foodItemManager;
    const mockSettingsManager = {
        getCurrentLimit: jest.fn().mockReturnValue(10)
    };

    beforeEach(() => {
        global.fetch.mockReset();
        foodItemManager = new FoodItemManager(mockSettingsManager);
        // Mock translation manager
        global.translationManager = {
            updateTranslationTargets: jest.fn(),
            isTypeFoodItem: () => true
        };
    });

    test('creates food item successfully', async () => {
        const mockFoodItem = {
            name: 'Test Food',
            categoryId: 1,
            itemLimit: 5,
            limitType: 'perPerson',
            inStock: true,
            mustGo: false,
            lowSupply: false,
            kosher: true,
            halal: false,
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            organic: false,
            readyToEat: true
        };

        // Set form values
        document.getElementById('foodItemName').value = mockFoodItem.name;
        document.getElementById('foodItemCategory').value = mockFoodItem.categoryId;
        document.getElementById('itemLimitValue').value = mockFoodItem.itemLimit;
        document.querySelector('input[name="limitType"][value="perPerson"]').checked = true;
        document.getElementById('foodItemInStock').checked = mockFoodItem.inStock;
        document.getElementById('foodItemKosher').checked = mockFoodItem.kosher;
        document.getElementById('foodItemVegetarian').checked = mockFoodItem.vegetarian;
        document.getElementById('foodItemGlutenFree').checked = mockFoodItem.glutenFree;
        document.getElementById('foodItemReadyToEat').checked = mockFoodItem.readyToEat;

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: { ...mockFoodItem, id: 1 } })
            })
        );

        const event = { preventDefault: jest.fn() };
        await foodItemManager.handleSubmit(event);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/food-items',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockFoodItem)
            })
        );
        expect(showMessage).toHaveBeenCalledWith('Food item created successfully', 'success');
    });

    test('loads and displays food items', async () => {
        const mockFoodItems = {
            data: [
                {
                    id: 1,
                    name: 'Food 1',
                    category: { name: 'Category 1' },
                    inStock: true,
                    itemLimit: 5,
                    limitType: 'perPerson',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Food 2',
                    category: { name: 'Category 2' },
                    inStock: false,
                    itemLimit: 0,
                    createdAt: new Date().toISOString()
                }
            ]
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockFoodItems)
            })
        );

        await foodItemManager.loadFoodItems();
        expect(foodItemManager.tableBody.innerHTML).toContain('Food 1');
        expect(foodItemManager.tableBody.innerHTML).toContain('Food 2');
        expect(foodItemManager.tableBody.innerHTML).toContain('Category 1');
        expect(foodItemManager.tableBody.innerHTML).toContain('Category 2');
    });

    test('validates item limit against global limit', () => {
        const event = { target: document.getElementById('itemLimitValue') };
        event.target.value = '15';
        foodItemManager.handleLimitValidation(event);
        expect(event.target.value).toBe('10'); // Should be capped at global limit
    });

    test('formats food item status correctly', () => {
        const mockItem = {
            inStock: true,
            mustGo: true,
            lowSupply: false,
            readyToEat: true
        };
        const status = foodItemManager.formatStatus(mockItem);
        expect(status).toBe('In Stock, Must Go, Ready to Eat');
    });

    test('formats dietary restrictions correctly', () => {
        const mockItem = {
            kosher: true,
            halal: false,
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            organic: true
        };
        const dietary = foodItemManager.formatDietary(mockItem);
        expect(dietary).toBe('Kosher, Vegetarian, GF, Organic');
    });
});