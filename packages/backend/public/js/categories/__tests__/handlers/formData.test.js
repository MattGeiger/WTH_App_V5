/**
 * @jest-environment jsdom
 */

import { collectFormData } from '../../handlers/formData.js';

describe('Categories Form Data', () => {
    let mockManager;

    beforeEach(() => {
        mockManager = {
            nameInput: { value: '  Test Category  ' },
            itemLimitSelect: { value: '5' },
            idInput: { value: '1' }
        };
    });

    describe('Basic Data Collection', () => {
        it('should collect complete form data', () => {
            const result = collectFormData(mockManager);
            
            expect(result).toEqual({
                id: 1,
                name: 'Test Category',
                itemLimit: 5
            });
        });

        it('should trim whitespace from name', () => {
            mockManager.nameInput.value = '  Canned Goods   ';
            const result = collectFormData(mockManager);
            expect(result.name).toBe('Canned Goods');
        });

        it('should handle empty form', () => {
            mockManager.nameInput.value = '';
            mockManager.itemLimitSelect.value = '';
            mockManager.idInput.value = '';

            const result = collectFormData(mockManager);
            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
        });

        it('should handle zero item limit', () => {
            mockManager.itemLimitSelect.value = '0';
            const result = collectFormData(mockManager);
            expect(result.itemLimit).toBe(0);
        });
    });

    describe('ID Handling', () => {
        it('should handle valid ID', () => {
            mockManager.idInput.value = '42';
            const result = collectFormData(mockManager);
            expect(result.id).toBe(42);
        });

        it('should handle missing ID', () => {
            mockManager.idInput.value = '';
            const result = collectFormData(mockManager);
            expect(result.id).toBeNull();
        });

        it('should handle invalid ID', () => {
            const invalidValues = ['abc', '1.23', '-1', 'NaN', 'Infinity'];
            invalidValues.forEach(value => {
                mockManager.idInput.value = value;
                const result = collectFormData(mockManager);
                expect(result.id).toBeNull();
            });
        });
    });

    describe('Item Limit Handling', () => {
        it('should handle valid item limits', () => {
            const validLimits = ['1', '5', '10', '100'];
            validLimits.forEach(limit => {
                mockManager.itemLimitSelect.value = limit;
                const result = collectFormData(mockManager);
                expect(result.itemLimit).toBe(parseInt(limit, 10));
            });
        });

        it('should handle invalid item limits', () => {
            const invalidValues = ['abc', '1.23', '-1', 'NaN', 'Infinity', ''];
            invalidValues.forEach(value => {
                mockManager.itemLimitSelect.value = value;
                const result = collectFormData(mockManager);
                expect(result.itemLimit).toBe(0);
            });
        });
    });

    describe('Name Handling', () => {
        it('should handle valid names', () => {
            const validNames = [
                'Fresh Produce',
                'Canned Goods',
                'Dairy Products',
                'Baby Items'
            ];

            validNames.forEach(name => {
                mockManager.nameInput.value = name;
                const result = collectFormData(mockManager);
                expect(result.name).toBe(name);
            });
        });

        it('should handle whitespace in names', () => {
            const testCases = [
                { input: '  Fresh Produce  ', expected: 'Fresh Produce' },
                { input: 'Canned\tGoods', expected: 'Canned Goods' },
                { input: 'Dairy\n\nProducts', expected: 'Dairy Products' },
                { input: '  Baby\t \nItems  ', expected: 'Baby Items' }
            ];

            testCases.forEach(({ input, expected }) => {
                mockManager.nameInput.value = input;
                const result = collectFormData(mockManager);
                expect(result.name).toBe(expected);
            });
        });

        it('should handle empty or invalid names', () => {
            const invalidNames = ['', '   ', null, undefined];
            invalidNames.forEach(name => {
                mockManager.nameInput.value = name;
                const result = collectFormData(mockManager);
                expect(result.name).toBe('');
            });
        });
    });

    describe('Manager Integration', () => {
        it('should handle missing manager', () => {
            const result = collectFormData(null);
            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
        });

        it('should handle missing form elements', () => {
            const incompleteManager = {};
            const result = collectFormData(incompleteManager);
            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
        });

        it('should handle null values in manager', () => {
            const nullManager = {
                nameInput: null,
                itemLimitSelect: null,
                idInput: null
            };
            const result = collectFormData(nullManager);
            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
        });
    });
});