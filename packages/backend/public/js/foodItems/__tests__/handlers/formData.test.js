import { collectFormData } from '../../handlers/formData.js';

describe('Form Data Collection', () => {
    let mockManager;

    beforeEach(() => {
        // Set up DOM elements
        document.body.innerHTML = `
            <input type="radio" name="limitType" value="perHousehold" checked>
            <input type="radio" name="limitType" value="perPerson">
            <input type="checkbox" id="foodItemInStock">
            <input type="checkbox" id="foodItemMustGo">
            <input type="checkbox" id="foodItemLowSupply">
            <input type="checkbox" id="foodItemReadyToEat">
            <input type="checkbox" id="foodItemKosher">
            <input type="checkbox" id="foodItemHalal">
            <input type="checkbox" id="foodItemVegetarian">
            <input type="checkbox" id="foodItemVegan">
            <input type="checkbox" id="foodItemGlutenFree">
            <input type="checkbox" id="foodItemOrganic">
        `;

        // Mock manager instance
        mockManager = {
            nameInput: { value: '  Test Item  ' },
            categorySelect: { value: '1' },
            itemLimitSelect: { value: '5' }
        };
    });

    describe('Basic Data Collection', () => {
        it('should collect basic item data', () => {
            const result = collectFormData(mockManager);
            
            expect(result).toEqual(expect.objectContaining({
                name: 'Test Item',
                categoryId: 1,
                itemLimit: 5,
                limitType: 'perHousehold'
            }));
        });

        it('should handle empty item limit', () => {
            mockManager.itemLimitSelect.value = '';
            const result = collectFormData(mockManager);
            
            expect(result.itemLimit).toBe(0);
        });

        it('should handle invalid item limit', () => {
            mockManager.itemLimitSelect.value = 'not-a-number';
            const result = collectFormData(mockManager);
            
            expect(result.itemLimit).toBe(0);
        });

        it('should handle null item limit', () => {
            mockManager.itemLimitSelect.value = null;
            const result = collectFormData(mockManager);
            
            expect(result.itemLimit).toBe(0);
        });
    });

    describe('Limit Type Selection', () => {
        it('should handle per-person limit type', () => {
            document.querySelector('input[value="perPerson"]').checked = true;
            document.querySelector('input[value="perHousehold"]').checked = false;
            
            const result = collectFormData(mockManager);
            
            expect(result.limitType).toBe('perPerson');
        });

        it('should handle per-household limit type', () => {
            const result = collectFormData(mockManager);
            expect(result.limitType).toBe('perHousehold');
        });

        it('should default to per-household when no radio is checked', () => {
            document.body.innerHTML = `
                <input type="radio" name="limitType" value="perHousehold">
                <input type="radio" name="limitType" value="perPerson">
            `;
            
            const result = collectFormData(mockManager);
            expect(result.limitType).toBe('perHousehold');
        });

        it('should handle missing limit type radios', () => {
            document.body.innerHTML = '';  // Remove all radios
            const result = collectFormData(mockManager);
            expect(result.limitType).toBe('perHousehold');
        });
    });

    describe('Status Flags', () => {
        it('should collect status flags', () => {
            document.getElementById('foodItemInStock').checked = true;
            document.getElementById('foodItemMustGo').checked = true;
            
            const result = collectFormData(mockManager);
            
            expect(result).toEqual(expect.objectContaining({
                inStock: true,
                mustGo: true,
                lowSupply: false,
                readyToEat: false
            }));
        });

        it('should handle missing status flag elements', () => {
            document.body.innerHTML = ''; // Remove all checkboxes
            const result = collectFormData(mockManager);
            
            expect(result).toEqual(expect.objectContaining({
                inStock: false,
                mustGo: false,
                lowSupply: false,
                readyToEat: false
            }));
        });
    });

    describe('Dietary Flags', () => {
        it('should collect dietary flags', () => {
            document.getElementById('foodItemKosher').checked = true;
            document.getElementById('foodItemVegan').checked = true;
            document.getElementById('foodItemGlutenFree').checked = true;
            
            const result = collectFormData(mockManager);
            
            expect(result).toEqual(expect.objectContaining({
                kosher: true,
                halal: false,
                vegetarian: false,
                vegan: true,
                glutenFree: true,
                organic: false
            }));
        });

        it('should handle all flags unchecked', () => {
            const result = collectFormData(mockManager);
            
            const flags = [
                'inStock', 'mustGo', 'lowSupply', 'readyToEat',
                'kosher', 'halal', 'vegetarian', 'vegan', 
                'glutenFree', 'organic'
            ];
            
            flags.forEach(flag => {
                expect(result[flag]).toBe(false);
            });
        });

        it('should handle missing dietary flag elements', () => {
            document.body.innerHTML = ''; // Remove all checkboxes
            const result = collectFormData(mockManager);
            
            expect(result).toEqual(expect.objectContaining({
                kosher: false,
                halal: false,
                vegetarian: false,
                vegan: false,
                glutenFree: false,
                organic: false
            }));
        });
    });

    describe('Invalid Input Handling', () => {
        it('should handle missing category value', () => {
            mockManager.categorySelect.value = '';
            const result = collectFormData(mockManager);
            expect(result.categoryId).toBe(0);
        });

        it('should handle invalid category value', () => {
            mockManager.categorySelect.value = 'not-a-number';
            const result = collectFormData(mockManager);
            expect(result.categoryId).toBe(0);
        });

        it('should handle null category value', () => {
            mockManager.categorySelect.value = null;
            const result = collectFormData(mockManager);
            expect(result.categoryId).toBe(0);
        });

        it('should handle missing name input', () => {
            mockManager.nameInput = {};
            const result = collectFormData(mockManager);
            expect(result.name).toBe('');
        });

        it('should handle null name value', () => {
            mockManager.nameInput.value = null;
            const result = collectFormData(mockManager);
            expect(result.name).toBe('');
        });
    });
});