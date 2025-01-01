/**
 * @jest-environment jsdom
 */

import { validateName, validateItemLimit, validateCategoryName } from '../../handlers/validation.js';

describe('Category Validation', () => {
    let mockManager;

    beforeEach(() => {
        mockManager = {
            showMessage: jest.fn()
        };

        document.body.innerHTML = `
            <form id="categoryForm">
                <input type="text" id="categoryName" value="" />
            </form>
        `;
    });

    describe('validateName', () => {
        test('accepts valid category names', () => {
            expect(validateName('Fresh Produce', mockManager)).toBe(true);
            expect(validateName('Canned Goods', mockManager)).toBe(true);
            expect(mockManager.showMessage).not.toHaveBeenCalled();
        });

        test('handles undefined manager', () => {
            expect(validateName('Fresh Produce')).toBe(true);
            expect(validateName('ab')).toBe(false);
        });

        test('handles manager without showMessage', () => {
            const invalidManager = {};
            expect(validateName('Fresh Produce', invalidManager)).toBe(true);
            expect(validateName('ab', invalidManager)).toBe(false);
        });

        test('handles undefined manager.showMessage', () => {
            const partialManager = { someOtherProp: true };
            expect(validateName('Fresh Produce', partialManager)).toBe(true);
            expect(validateName('ab', partialManager)).toBe(false);
        });

        test('handles null or undefined input', () => {
            expect(validateName(null, mockManager)).toBe(false);
            expect(validateName(undefined, mockManager)).toBe(false);
            expect(validateName('', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name must be at least three characters long',
                'error',
                'category'
            );
        });

        test('rejects names that are too short', () => {
            expect(validateName('ab', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name must be at least three characters long',
                'error',
                'category'
            );
        });

        test('rejects names with only one or two letters mixed with numbers', () => {
            expect(validateName('a1 2', mockManager)).toBe(false);
            expect(validateName('1a 2b', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name must contain at least three letters',
                'error',
                'category'
            );
        });

        test('rejects names that are too long', () => {
            const longName = 'This Category Name Is Way Too Long To Be Valid';
            expect(validateName(longName, mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name cannot exceed 36 characters',
                'error',
                'category'
            );
        });

        test('rejects names with insufficient letters', () => {
            expect(validateName('12 34', mockManager)).toBe(false);
            expect(validateName('123 456', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name must contain at least three letters',
                'error',
                'category'
            );
        });

        test('rejects names with special characters', () => {
            const invalidChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '[', ']', '{', '}', '|', '\\', ';', ':', '"', "'", ',', '.', '/', '<', '>', '?'];
            
            invalidChars.forEach(char => {
                expect(validateName(`Fresh${char}Produce`, mockManager)).toBe(false);
            });

            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name can only contain letters and spaces',
                'error',
                'category'
            );
        });

        test('rejects names with repeated words', () => {
            expect(validateName('Fresh Fresh', mockManager)).toBe(false);
            expect(validateName('Fresh Fresh Fresh', mockManager)).toBe(false);
            expect(validateName('The The Food', mockManager)).toBe(false);
            expect(validateName('a a a', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name cannot contain repeated words',
                'error',
                'category'
            );
        });

        test('trims all types of whitespace before validation', () => {
            expect(validateName('  Fresh Produce  ', mockManager)).toBe(true);
            expect(validateName('\tFresh Produce\n', mockManager)).toBe(true);
            expect(validateName('\r\nFresh Produce\r\n', mockManager)).toBe(true);
            expect(validateName('\f\vFresh Produce\f\v', mockManager)).toBe(true);
            expect(mockManager.showMessage).not.toHaveBeenCalled();
        });
    });

    describe('validateCategoryName', () => {
        test('handles invalid event object', () => {
            expect(validateCategoryName({}, mockManager)).toBe(false);
            expect(validateCategoryName({ target: null }, mockManager)).toBe(false);
            expect(validateCategoryName({ target: {} }, mockManager)).toBe(false);
        });

        test('handles malformed event target', () => {
            const mockEvent = {
                target: { value: undefined }
            };
            expect(validateCategoryName(mockEvent, mockManager)).toBe(false);
        });

        test('handles non-string values', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            
            [123, true, {}, [], null, undefined].forEach(value => {
                mockEvent.target.value = value;
                validateCategoryName(mockEvent, mockManager);
                expect(mockEvent.target.value).toBe('');
            });
        });

        test('handles input longer than maximum length', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'This Is A Very Long Category Name That Should Be Truncated';

            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value.length).toBeLessThanOrEqual(36);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Input cannot exceed 36 characters',
                'warning',
                'category'
            );
        });

        test('handles undefined manager', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'Fresh   Produce';
            
            expect(validateCategoryName(mockEvent)).toBe(true);
            expect(mockEvent.target.value).toBe('Fresh Produce');
        });

        test('handles manager without showMessage', () => {
            const invalidManager = {};
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'Fresh   Produce';
            
            expect(validateCategoryName(mockEvent, invalidManager)).toBe(true);
            expect(mockEvent.target.value).toBe('Fresh Produce');
        });

        test('removes all types of whitespace', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'Fresh\t\t\tProduce\n\n\rItems';

            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value).toBe('Fresh Produce Items');
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Consecutive spaces detected',
                'warning',
                'category'
            );
        });

        test('handles multiple consecutive spaces', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'Fresh    Produce    Items';

            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value).toBe('Fresh Produce Items');
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Consecutive spaces detected',
                'warning',
                'category'
            );
        });

        test('warns about repeated words', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'Fresh Fresh Produce';

            validateCategoryName(mockEvent, mockManager);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name cannot contain repeated words',
                'error',
                'category'
            );
        });

        test('converts to title case properly', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            
            const testCases = [
                { input: 'fresh produce items', expected: 'Fresh Produce Items' },
                { input: 'FRESH PRODUCE', expected: 'Fresh Produce' },
                { input: 'frEsH pRoDuCe', expected: 'Fresh Produce' },
                { input: 'a b c', expected: 'A B C' }
            ];

            testCases.forEach(({ input, expected }) => {
                mockEvent.target.value = input;
                validateCategoryName(mockEvent, mockManager);
                expect(mockEvent.target.value).toBe(expected);
            });
        });

        test('handles empty or whitespace input', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            
            [' ', '   ', '\t', '\n', '\r', '\f', '\v'].forEach(value => {
                mockEvent.target.value = value;
                validateCategoryName(mockEvent, mockManager);
                expect(mockEvent.target.value).toBe('');
            });
        });
    });

    describe('validateItemLimit', () => {
        test('accepts valid limits', () => {
            expect(validateItemLimit(5, 10, mockManager)).toBe(true);
            expect(validateItemLimit('5', 10, mockManager)).toBe(true);
            expect(mockManager.showMessage).not.toHaveBeenCalled();
        });

        test('handles undefined manager', () => {
            expect(validateItemLimit(5, 10)).toBe(true);
            expect(validateItemLimit('abc', 10)).toBe(false);
            expect(validateItemLimit(15, 10)).toBe(false);
        });

        test('handles manager without showMessage', () => {
            const invalidManager = {};
            expect(validateItemLimit(5, 10, invalidManager)).toBe(true);
            expect(validateItemLimit('abc', 10, invalidManager)).toBe(false);
            expect(validateItemLimit(15, 10, invalidManager)).toBe(false);
        });

        test('accepts zero as valid limit', () => {
            expect(validateItemLimit(0, 10, mockManager)).toBe(true);
            expect(validateItemLimit('0', 10, mockManager)).toBe(true);
            expect(mockManager.showMessage).not.toHaveBeenCalled();
        });

        test('handles various invalid numeric inputs', () => {
            const invalidInputs = [
                'abc', '12.34', '', ' ', 'e10', 'Infinity', '-Infinity', 'NaN',
                {}, [], true, false, null, undefined, Symbol('test'),
                Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, NaN
            ];

            invalidInputs.forEach(input => {
                expect(validateItemLimit(input, 10, mockManager)).toBe(false);
            });

            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Item limit must be a valid number',
                'error',
                'category'
            );
        });

        test('rejects all types of negative values', () => {
            const negativeInputs = [-1, '-5', -0.1, '-0.1', Number.MIN_SAFE_INTEGER];

            negativeInputs.forEach(input => {
                expect(validateItemLimit(input, 10, mockManager)).toBe(false);
            });

            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Item limit cannot be negative',
                'error',
                'category'
            );
        });

        test('rejects limits exceeding global limit', () => {
            const highValues = [15, '20', Number.MAX_SAFE_INTEGER];

            highValues.forEach(value => {
                expect(validateItemLimit(value, 10, mockManager)).toBe(false);
            });

            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Item limit cannot exceed global limit of 10',
                'error',
                'category'
            );
        });

        test('handles invalid global limits', () => {
            const invalidGlobals = [-1, 0, 'abc', null, undefined, NaN];

            invalidGlobals.forEach(globalLimit => {
                expect(validateItemLimit(5, globalLimit, mockManager)).toBe(false);
            });
        });
    });
});