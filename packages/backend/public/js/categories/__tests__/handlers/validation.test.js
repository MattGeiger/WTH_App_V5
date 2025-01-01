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
        describe('with manager', () => {
            test('accepts valid category names', () => {
                expect(validateName('Fresh Produce', mockManager)).toBe(true);
                expect(validateName('Canned Goods', mockManager)).toBe(true);
                expect(mockManager.showMessage).not.toHaveBeenCalled();
            });

            test('rejects names that are too short', () => {
                expect(validateName('ab', mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name must be at least three characters long',
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
                expect(validateName('Fresh! Produce', mockManager)).toBe(false);
                expect(validateName('Fresh@Product', mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name can only contain letters and spaces',
                    'error',
                    'category'
                );
            });

            test('rejects names with repeated words', () => {
                expect(validateName('Fresh Fresh', mockManager)).toBe(false);
                expect(validateName('Fresh Fresh Fresh', mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name cannot contain repeated words',
                    'error',
                    'category'
                );
            });
        });

        describe('without manager', () => {
            test('processes validation without manager', () => {
                expect(validateName('Fresh Produce')).toBe(true);
                expect(validateName('ab')).toBe(false);
                expect(validateName('This Is Way Too Long Of A Category Name')).toBe(false);
                expect(validateName('123 456')).toBe(false);
                expect(validateName('Test@Name')).toBe(false);
                expect(validateName('Test Test')).toBe(false);
            });
        });

        describe('with incomplete manager', () => {
            test('handles manager without showMessage', () => {
                const incompleteManager = {};
                expect(validateName('Fresh Produce', incompleteManager)).toBe(true);
                expect(validateName('ab', incompleteManager)).toBe(false);
                expect(validateName('This Is Way Too Long For A Category Name', incompleteManager)).toBe(false);
                expect(validateName('123 456', incompleteManager)).toBe(false);
                expect(validateName('Test@Name', incompleteManager)).toBe(false);
                expect(validateName('Test Test', incompleteManager)).toBe(false);
            });
        });

        describe('edge cases', () => {
            test('handles null and undefined inputs', () => {
                expect(validateName(null, mockManager)).toBe(false);
                expect(validateName(undefined, mockManager)).toBe(false);
                expect(validateName('', mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name must be at least three characters long',
                    'error',
                    'category'
                );
            });

            test('handles non-string inputs', () => {
                expect(validateName(123, mockManager)).toBe(false);
                expect(validateName({}, mockManager)).toBe(false);
                expect(validateName([], mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name must be at least three characters long',
                    'error',
                    'category'
                );
            });
        });
    });

    describe('validateItemLimit', () => {
        describe('with manager', () => {
            test('accepts valid limits', () => {
                expect(validateItemLimit(5, 10, mockManager)).toBe(true);
                expect(validateItemLimit('5', 10, mockManager)).toBe(true);
                expect(mockManager.showMessage).not.toHaveBeenCalled();
            });

            test('rejects non-numeric values', () => {
                expect(validateItemLimit('abc', 10, mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Item limit must be a valid number',
                    'error',
                    'category'
                );
            });

            test('rejects negative values', () => {
                expect(validateItemLimit(-1, 10, mockManager)).toBe(false);
                expect(validateItemLimit('-5', 10, mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Item limit cannot be negative',
                    'error',
                    'category'
                );
            });

            test('rejects limits exceeding global limit', () => {
                expect(validateItemLimit(15, 10, mockManager)).toBe(false);
                expect(validateItemLimit('20', 10, mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Item limit cannot exceed global limit of 10',
                    'error',
                    'category'
                );
            });
        });

        describe('without manager', () => {
            test('processes validation without manager', () => {
                expect(validateItemLimit(5, 10)).toBe(true);
                expect(validateItemLimit('abc', 10)).toBe(false);
                expect(validateItemLimit(-1, 10)).toBe(false);
                expect(validateItemLimit(15, 10)).toBe(false);
            });
        });

        describe('with incomplete manager', () => {
            test('handles manager without showMessage', () => {
                const incompleteManager = {};
                expect(validateItemLimit(5, 10, incompleteManager)).toBe(true);
                expect(validateItemLimit('abc', 10, incompleteManager)).toBe(false);
                expect(validateItemLimit(-1, 10, incompleteManager)).toBe(false);
                expect(validateItemLimit(15, 10, incompleteManager)).toBe(false);
            });
        });

        describe('edge cases', () => {
            test('handles invalid number inputs', () => {
                const invalidInputs = ['', null, undefined, {}, [], true, false, NaN, Infinity, -Infinity];
                invalidInputs.forEach(input => {
                    expect(validateItemLimit(input, 10, mockManager)).toBe(false);
                    expect(mockManager.showMessage).toHaveBeenLastCalledWith(
                        'Item limit must be a valid number',
                        'error',
                        'category'
                    );
                });
            });

            test('accepts zero as valid limit', () => {
                expect(validateItemLimit(0, 10, mockManager)).toBe(true);
                expect(validateItemLimit('0', 10, mockManager)).toBe(true);
                expect(mockManager.showMessage).not.toHaveBeenCalled();
            });
        });
    });

    describe('validateCategoryName', () => {
        describe('with manager', () => {
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

            test('handles consecutive spaces', () => {
                const mockEvent = {
                    target: document.getElementById('categoryName')
                };
                mockEvent.target.value = 'Fresh   Produce   Items';

                validateCategoryName(mockEvent, mockManager);
                expect(mockEvent.target.value).toBe('Fresh Produce Items');
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Consecutive spaces detected',
                    'warning',
                    'category'
                );
            });

            test('rejects repeated words', () => {
                const mockEvent = {
                    target: document.getElementById('categoryName')
                };
                mockEvent.target.value = 'Fresh Fresh Produce';

                expect(validateCategoryName(mockEvent, mockManager)).toBe(false);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name cannot contain repeated words',
                    'error',
                    'category'
                );
            });
        });

        describe('without manager', () => {
            test('processes validation without manager', () => {
                const mockEvent = {
                    target: document.getElementById('categoryName')
                };

                mockEvent.target.value = 'This Is A Very Long Category Name';
                validateCategoryName(mockEvent);
                expect(mockEvent.target.value.length).toBeLessThanOrEqual(36);

                mockEvent.target.value = 'Fresh   Produce';
                validateCategoryName(mockEvent);
                expect(mockEvent.target.value).toBe('Fresh Produce');

                mockEvent.target.value = 'Fresh Fresh';
                expect(validateCategoryName(mockEvent)).toBe(false);
            });
        });

        describe('with incomplete manager', () => {
            test('handles manager without showMessage', () => {
                const incompleteManager = {};
                const mockEvent = {
                    target: document.getElementById('categoryName')
                };

                mockEvent.target.value = 'This Is A Very Long Category Name';
                validateCategoryName(mockEvent, incompleteManager);
                expect(mockEvent.target.value.length).toBeLessThanOrEqual(36);

                mockEvent.target.value = 'Fresh   Produce';
                validateCategoryName(mockEvent, incompleteManager);
                expect(mockEvent.target.value).toBe('Fresh Produce');

                mockEvent.target.value = 'Fresh Fresh';
                expect(validateCategoryName(mockEvent, incompleteManager)).toBe(false);
            });
        });

        describe('edge cases', () => {
            test('handles empty or whitespace input', () => {
                const mockEvent = {
                    target: document.getElementById('categoryName')
                };

                ['', ' ', '  ', '\t', '\n', '\r'].forEach(value => {
                    mockEvent.target.value = value;
                    validateCategoryName(mockEvent, mockManager);
                    expect(mockEvent.target.value).toBe('');
                });
            });

            test('handles title case conversion edge cases', () => {
                const mockEvent = {
                    target: document.getElementById('categoryName')
                };

                const testCases = [
                    { input: 'test', expected: 'Test' },
                    { input: 'TEST', expected: 'Test' },
                    { input: 'tESt', expected: 'Test' },
                    { input: 'test test', expected: 'Test Test' }
                ];

                testCases.forEach(({ input, expected }) => {
                    mockEvent.target.value = input;
                    validateCategoryName(mockEvent, mockManager);
                    expect(mockEvent.target.value).toBe(expected);
                });
            });
        });
    });
});