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
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name must contain at least three letters',
                'error',
                'category'
            );
        });

        test('rejects names with repeated words', () => {
            expect(validateName('Fresh Fresh', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name cannot contain repeated words',
                'error',
                'category'
            );
        });

        test('rejects names with special characters', () => {
            expect(validateName('Fresh! Produce', mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name can only contain letters and spaces',
                'error',
                'category'
            );
        });

        test('trims whitespace before validation', () => {
            expect(validateName('  Fresh Produce  ', mockManager)).toBe(true);
            expect(mockManager.showMessage).not.toHaveBeenCalled();
        });
    });

    describe('validateCategoryName', () => {
        test('handles input longer than maximum length', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'This Is A Very Long Category Name That Should Be Truncated';

            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value.length).toBeLessThanOrEqual(36);
        });

        test('removes consecutive spaces', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'Fresh   Produce';

            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value).toBe('Fresh Produce');
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

        test('converts to title case', () => {
            const mockEvent = {
                target: document.getElementById('categoryName')
            };
            mockEvent.target.value = 'fresh produce';

            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value).toBe('Fresh Produce');
        });
    });

    describe('validateItemLimit', () => {
        test('accepts valid limits', () => {
            expect(validateItemLimit(5, 10, mockManager)).toBe(true);
            expect(mockManager.showMessage).not.toHaveBeenCalled();
        });

        test('accepts zero as valid limit', () => {
            expect(validateItemLimit(0, 10, mockManager)).toBe(true);
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
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Item limit cannot be negative',
                'error',
                'category'
            );
        });

        test('rejects limits exceeding global limit', () => {
            expect(validateItemLimit(15, 10, mockManager)).toBe(false);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Item limit cannot exceed global limit of 10',
                'error',
                'category'
            );
        });
    });
});