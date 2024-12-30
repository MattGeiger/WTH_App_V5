/**
 * @jest-environment jsdom
 */

import { validateName, validateCategoryName, validateItemLimit } from '../../handlers/validation.js';
import { showMessage } from '../../../utils.js';

// Mock utils
jest.mock('../../../utils.js', () => ({
    showMessage: jest.fn()
}));

describe('Category Validation', () => {
    beforeEach(() => {
        // Clear mocks between tests
        jest.clearAllMocks();
    });

    describe('validateName', () => {
        test('accepts valid category names', () => {
            const validNames = [
                'Fresh Produce',
                'Canned Goods',
                'Dairy Products'
            ];

            validNames.forEach(name => {
                const result = validateName(name);
                expect(result.isValid).toBe(true);
                expect(result.error).toBeNull();
            });
        });

        test('rejects names that are too short', () => {
            const result = validateName('Ab');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('at least 3 characters');
        });

        test('rejects names that are too long', () => {
            const longName = 'This Category Name Is Way Too Long For Our System';
            const result = validateName(longName);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('cannot exceed 36 characters');
        });

        test('rejects names with insufficient letters', () => {
            const result = validateName('A B');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('at least 3 letters');
        });

        test('rejects names with repeated words', () => {
            const result = validateName('Fresh Fresh Produce');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('repeated words');
        });

        test('rejects names with special characters', () => {
            const result = validateName('Fresh! Produce@');
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('only contain letters and spaces');
        });

        test('trims whitespace before validation', () => {
            const result = validateName('  Fresh Produce  ');
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('validateCategoryName', () => {
        let mockEvent;
        let mockManager;

        beforeEach(() => {
            mockEvent = {
                target: {
                    value: 'Test Category',
                    selectionStart: 12,
                    selectionEnd: 12
                }
            };
            mockManager = {};
        });

        test('handles input longer than maximum length', () => {
            mockEvent.target.value = 'This Category Name Is Way Too Long For The System To Handle';
            validateCategoryName(mockEvent, mockManager);
            
            expect(mockEvent.target.value.length).toBeLessThanOrEqual(36);
            expect(showMessage).toHaveBeenCalledWith(
                expect.stringContaining('cannot exceed 36 characters'),
                'warning',
                'category'
            );
        });

        test('removes consecutive spaces', () => {
            mockEvent.target.value = 'Fresh   Produce';
            validateCategoryName(mockEvent, mockManager);
            
            expect(mockEvent.target.value).toBe('Fresh Produce');
        });

        test('warns about repeated words', () => {
            mockEvent.target.value = 'Fresh Fresh Produce';
            validateCategoryName(mockEvent, mockManager);
            
            expect(showMessage).toHaveBeenCalledWith(
                expect.stringContaining('repeated words'),
                'warning',
                'category'
            );
        });

        test('converts to title case', () => {
            mockEvent.target.value = 'fresh produce';
            validateCategoryName(mockEvent, mockManager);
            
            expect(mockEvent.target.value).toBe('Fresh Produce');
        });
    });

    describe('validateItemLimit', () => {
        test('accepts valid limits', () => {
            const result = validateItemLimit(5, 10);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('accepts zero as valid limit', () => {
            const result = validateItemLimit(0, 10);
            expect(result.isValid).toBe(true);
            expect(result.error).toBeNull();
        });

        test('rejects non-numeric values', () => {
            const result = validateItemLimit('abc', 10);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('must be a number');
        });

        test('rejects negative values', () => {
            const result = validateItemLimit(-1, 10);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('cannot be negative');
        });

        test('rejects limits exceeding global limit', () => {
            const result = validateItemLimit(15, 10);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('cannot exceed global limit');
        });
    });
});