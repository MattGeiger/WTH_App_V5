/**
 * @jest-environment jsdom
 */

import { 
    collectFormData, 
    isFormEmpty, 
    formatFormData,
    formatForSubmission 
} from '../../handlers/formData.js';

describe('Form Data Handlers', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <form id="categoryForm">
                <input type="hidden" id="categoryId" />
                <input type="text" id="categoryName" />
                <select id="categoryItemLimit">
                    <option value="0">No Limit</option>
                    <option value="5">5</option>
                    <option value="10">10</option>
                </select>
            </form>
        `;
    });

    describe('collectFormData', () => {
        test('collects complete form data', () => {
            const categoryId = document.getElementById('categoryId');
            const categoryName = document.getElementById('categoryName');
            const categoryItemLimit = document.getElementById('categoryItemLimit');

            categoryId.value = '1';
            categoryName.value = 'Fresh Produce';
            categoryItemLimit.value = '5';

            const result = collectFormData();

            expect(result).toEqual({
                id: 1,
                name: 'Fresh Produce',
                itemLimit: 5
            });
        });

        test('handles zero ID correctly', () => {
            const categoryId = document.getElementById('categoryId');
            categoryId.value = '0';

            const result = collectFormData();
            expect(result.id).toBeNull();
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
            const categoryName = document.getElementById('categoryName');
            categoryName.value = '  Fresh   Produce  ';

            const result = collectFormData();
            expect(result.name).toBe('Fresh Produce');
        });

        test('handles multiple spaces and special whitespace', () => {
            const categoryName = document.getElementById('categoryName');
            categoryName.value = '  Fresh \t\n  Produce \r\n ';

            const result = collectFormData();
            expect(result.name).toBe('Fresh Produce');
        });

        test('converts types correctly', () => {
            const categoryId = document.getElementById('categoryId');
            const categoryItemLimit = document.getElementById('categoryItemLimit');

            categoryId.value = '42';
            categoryItemLimit.value = '7';

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

        test('handles negative item limits', () => {
            const categoryItemLimit = document.getElementById('categoryItemLimit');
            categoryItemLimit.value = '-5';

            const result = collectFormData();
            expect(result.itemLimit).toBe(0);
        });

        test('handles invalid number inputs', () => {
            const categoryId = document.getElementById('categoryId');
            const categoryItemLimit = document.getElementById('categoryItemLimit');

            const invalidValues = ['not-a-number', 'NaN', 'Infinity', '-Infinity', '1.23', ''];
            invalidValues.forEach(value => {
                categoryId.value = value;
                categoryItemLimit.value = value;

                const result = collectFormData();
                expect(result.id).toBeNull();
                expect(result.itemLimit).toBe(0);
            });
        });

        test('handles non-existent form', () => {
            document.body.innerHTML = '';
            const result = collectFormData();
            
            expect(result).toEqual({
                id: null,
                name: '',
                itemLimit: 0
            });
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
            const testCases = [
                {},
                { itemLimit: 5 },
                { id: 1 },
                { name: undefined },
                { name: null }
            ];

            testCases.forEach(data => {
                expect(isFormEmpty(data)).toBe(true);
            });
        });

        test('handles invalid inputs', () => {
            const invalidInputs = [
                null,
                undefined,
                '',
                'string',
                123,
                true,
                false,
                [],
                new Date(),
                /regex/
            ];

            invalidInputs.forEach(input => {
                expect(isFormEmpty(input)).toBe(true);
            });
        });

        test('considers only name for emptiness', () => {
            const testCases = [
                { name: 'Test', itemLimit: 0, id: null },
                { name: 'Test', itemLimit: 5, id: null },
                { name: 'Test', itemLimit: null, id: 1 },
                { name: 'Test' }
            ];

            testCases.forEach(data => {
                expect(isFormEmpty(data)).toBe(false);
            });
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
            const testCases = [
                {},
                undefined,
                null,
                { someOtherProp: true }
            ];

            testCases.forEach(data => {
                const formatted = formatFormData(data);
                expect(formatted).toEqual({
                    name: 'Unnamed Category',
                    itemLimit: 'No Limit',
                    id: 'New'
                });
            });
        });

        test('formats zero limit correctly', () => {
            const testCases = [
                { itemLimit: 0 },
                { itemLimit: '0' },
                { itemLimit: null },
                { itemLimit: undefined }
            ];

            testCases.forEach(data => {
                const formatted = formatFormData(data);
                expect(formatted.itemLimit).toBe('No Limit');
            });
        });

        test('handles null and undefined values', () => {
            const testCases = [
                { name: null, itemLimit: null, id: null },
                { name: undefined, itemLimit: undefined, id: undefined },
                { name: '', itemLimit: '', id: '' }
            ];

            testCases.forEach(data => {
                const formatted = formatFormData(data);
                expect(formatted).toEqual({
                    name: 'Unnamed Category',
                    itemLimit: 'No Limit',
                    id: 'New'
                });
            });
        });

        test('preserves additional fields', () => {
            const data = {
                name: 'Test Category',
                itemLimit: 10,
                id: 42,
                extraField: 'preserve',
                metadata: { key: 'value' }
            };

            const formatted = formatFormData(data);
            expect(formatted).toMatchObject({
                extraField: 'preserve',
                metadata: { key: 'value' }
            });
        });

        test('handles whitespace in names', () => {
            const testCases = [
                { name: '  Test  ' },
                { name: '\tTest\n' },
                { name: ' \r\n Test \r\n ' }
            ];

            testCases.forEach(data => {
                const formatted = formatFormData(data);
                expect(formatted.name).toBe('Test');
            });
        });
    });

    describe('formatForSubmission', () => {
        test('formats valid data correctly', () => {
            const data = {
                name: 'Fresh Produce',
                itemLimit: '5',
                id: '1'
            };

            const formatted = formatForSubmission(data);
            expect(formatted).toEqual({
                name: 'Fresh Produce',
                itemLimit: 5,
                id: '1'
            });
        });

        test('handles all types of itemLimit values', () => {
            const testCases = [
                { input: '10', expected: 10 },
                { input: 10, expected: 10 },
                { input: '0', expected: 0 },
                { input: 0, expected: 0 },
                { input: 'invalid', expected: 0 },
                { input: undefined, expected: 0 },
                { input: null, expected: 0 },
                { input: true, expected: 0 },
                { input: '', expected: 0 },
                { input: [], expected: 0 },
                { input: {}, expected: 0 }
            ];

            testCases.forEach(({ input, expected }) => {
                const formatted = formatForSubmission({
                    name: 'Test',
                    itemLimit: input
                });
                expect(formatted.itemLimit).toBe(expected);
            });
        });

        test('handles invalid input data', () => {
            const invalidInputs = [
                null,
                undefined,
                '',
                'string',
                123,
                true,
                false,
                [],
                new Date(),
                /regex/,
                {},
                { itemLimit: 5 }
            ];

            invalidInputs.forEach(input => {
                const result = formatForSubmission(input);
                if (input && typeof input === 'object' && !Array.isArray(input)) {
                    expect(result).toEqual({
                        name: '',
                        itemLimit: 0
                    });
                } else {
                    expect(result).toBeNull();
                }
            });
        });

        test('handles id field correctly', () => {
            const testCases = [
                { input: { name: 'Test', id: '1' }, shouldHaveId: true },
                { input: { name: 'Test', id: 'New' }, shouldHaveId: false },
                { input: { name: 'Test', id: '' }, shouldHaveId: false },
                { input: { name: 'Test', id: null }, shouldHaveId: false },
                { input: { name: 'Test', id: undefined }, shouldHaveId: false },
                { input: { name: 'Test' }, shouldHaveId: false }
            ];

            testCases.forEach(({ input, shouldHaveId }) => {
                const result = formatForSubmission(input);
                expect(result.hasOwnProperty('id')).toBe(shouldHaveId);
            });
        });

        test('handles whitespace in names', () => {
            const testCases = [
                { input: '  Test  ', expected: 'Test' },
                { input: '\tTest\n', expected: 'Test' },
                { input: ' \r\n Test \r\n ', expected: 'Test' }
            ];

            testCases.forEach(({ input, expected }) => {
                const result = formatForSubmission({ name: input });
                expect(result.name).toBe(expected);
            });
        });
    });
});