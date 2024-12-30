/**
 * @jest-environment jsdom
 */

import { 
    collectFormData, 
    isFormEmpty, 
    formatFormData 
} from '../../handlers/formData.js';

describe('Form Data Handlers', () => {
    beforeEach(() => {
        // Setup DOM for testing
        document.body.innerHTML = `
            <form id="categoryForm">
                <input type="hidden" id="categoryId" value="" />
                <input type="text" id="categoryName" value="" />
                <select id="categoryItemLimit">
                    <option value="0">No Limit</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>
            </form>
        `;
    });

    describe('collectFormData', () => {
        test('collects complete form data', () => {
            // Setup form values
            document.getElementById('categoryId').value = '1';
            document.getElementById('categoryName').value = 'Fresh Produce';
            document.getElementById('categoryItemLimit').value = '5';

            const result = collectFormData();

            expect(result).toEqual({
                id: 1,
                name: 'Fresh Produce',
                itemLimit: 5
            });
        });

        test('handles empty form data', () => {
            const result = collectFormData();

            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
        });

        test('sanitizes input data', () => {
            document.getElementById('categoryName').value = '  Fresh   Produce  ';
            document.getElementById('categoryItemLimit').value = '5';

            const result = collectFormData();

            expect(result.name).toBe('Fresh Produce');
        });

        test('converts types correctly', () => {
            document.getElementById('categoryId').value = '42';
            document.getElementById('categoryItemLimit').value = '7';

            const result = collectFormData();

            expect(typeof result.id).toBe('number');
            expect(typeof result.itemLimit).toBe('number');
        });

        test('handles missing form elements gracefully', () => {
            document.body.innerHTML = '<form id="categoryForm"></form>';

            const result = collectFormData();

            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
        });

        test('handles invalid number inputs', () => {
            document.getElementById('categoryId').value = 'not-a-number';
            document.getElementById('categoryItemLimit').value = 'invalid';

            const result = collectFormData();

            expect(result.id).toBeNull();
            expect(result.itemLimit).toBe(0);
        });
    });

    describe('isFormEmpty', () => {
        test('identifies empty form data', () => {
            const emptyData = {
                name: '',
                itemLimit: 0,
                id: null
            };

            expect(isFormEmpty(emptyData)).toBe(true);
        });

        test('identifies form with only whitespace as empty', () => {
            const whitespaceData = {
                name: '   ',
                itemLimit: 0,
                id: null
            };

            expect(isFormEmpty(whitespaceData)).toBe(true);
        });

        test('identifies non-empty form data', () => {
            const nonEmptyData = {
                name: 'Fresh Produce',
                itemLimit: 0,
                id: null
            };

            expect(isFormEmpty(nonEmptyData)).toBe(false);
        });

        test('handles missing properties', () => {
            const incompleteData = {};

            expect(isFormEmpty(incompleteData)).toBe(true);
        });

        test('considers form with only limit as non-empty', () => {
            const limitOnlyData = {
                name: '',
                itemLimit: 5,
                id: null
            };

            expect(isFormEmpty(limitOnlyData)).toBe(false);
        });
    });

    describe('formatFormData', () => {
        test('formats complete data correctly', () => {
            const data = {
                name: 'Fresh Produce',
                itemLimit: 5,
                id: 1
            };

            const formatted = formatFormData(data);

            expect(formatted).toEqual({
                name: 'Fresh Produce',
                itemLimit: '5',
                id: '1'
            });
        });

        test('handles missing data with defaults', () => {
            const data = {};

            const formatted = formatFormData(data);

            expect(formatted).toEqual({
                name: 'Unnamed Category',
                itemLimit: 'No Limit',
                id: 'New'
            });
        });

        test('formats zero limit correctly', () => {
            const data = {
                name: 'Test',
                itemLimit: 0
            };

            const formatted = formatFormData(data);

            expect(formatted.itemLimit).toBe('No Limit');
        });

        test('handles null values', () => {
            const data = {
                name: null,
                itemLimit: null,
                id: null
            };

            const formatted = formatFormData(data);

            expect(formatted).toEqual({
                name: 'Unnamed Category',
                itemLimit: 'No Limit',
                id: 'New'
            });
        });

        test('preserves valid data while formatting', () => {
            const data = {
                name: 'Test Category',
                itemLimit: 10,
                id: 42,
                extraField: 'should be preserved'
            };

            const formatted = formatFormData(data);

            expect(formatted).toEqual({
                name: 'Test Category',
                itemLimit: '10',
                id: '42',
                extraField: 'should be preserved'
            });
        });
    });
});