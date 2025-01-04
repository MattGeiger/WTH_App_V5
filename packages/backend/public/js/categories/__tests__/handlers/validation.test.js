/**
 * @jest-environment jsdom
 */

import { validateName, validateItemLimit, validateCategoryName } from '../../handlers/validation.js';

// Test case factories
const createValidationTestCase = ({
    scenario,
    inputs,
    expected,
    errorMessage = null
}) => ({
    scenario,
    inputs: Array.isArray(inputs) ? inputs : [inputs],
    expected,
    errorMessage
});

// Test runners
const runValidationTestCases = (testCases, validationFn, manager = null) => {
    testCases.forEach(({ scenario, inputs, expected, errorMessage }) => {
        test(`handles ${scenario}`, () => {
            inputs.forEach(input => {
                const result = validationFn(input, manager);
                expect(result).toBe(expected);
                if (errorMessage && manager?.showMessage) {
                    expect(manager.showMessage).toHaveBeenCalledWith(
                        errorMessage,
                        'error',
                        'category'
                    );
                }
            });
        });
    });
};

describe('Category Validation', () => {
    let mockManager;
    let mockInput;
    let mockEvent;

    beforeEach(() => {
        mockManager = {
            showMessage: jest.fn()
        };

        // Create DOM-aligned input element mock with strict type checking
        mockInput = Object.create(HTMLInputElement.prototype);
        let inputValue = '';
        Object.defineProperty(mockInput, 'value', {
            get() { 
                return inputValue;
            },
            set(v) { 
                // Enforce string type checking like a real input element
                inputValue = v === null || v === undefined ? '' : String(v);
            }
        });

        // Create event with proper target
        mockEvent = {
            target: mockInput,
            type: 'input',
            bubbles: true
        };

        document.body.innerHTML = `
            <form id="categoryForm">
                <input type="text" id="categoryName" value="" />
            </form>
        `;
    });

    describe('validateName', () => {
        const validationCases = [
            createValidationTestCase({
                scenario: 'valid category names',
                inputs: ['Fresh Produce', 'Canned Goods'],
                expected: true
            }),
            createValidationTestCase({
                scenario: 'names that are too short',
                inputs: ['ab', 'a'],
                expected: false,
                errorMessage: 'Category name must be at least three characters long'
            }),
            createValidationTestCase({
                scenario: 'names with insufficient letters',
                inputs: ['123', '12 34', 'a1 2'],
                expected: false,
                errorMessage: 'Category name must contain at least three letters'
            }),
            createValidationTestCase({
                scenario: 'names that are too long',
                inputs: ['This Category Name Is Way Too Long To Be Valid'],
                expected: false,
                errorMessage: 'Category name cannot exceed 36 characters'
            }),
            createValidationTestCase({
                scenario: 'names with special characters',
                inputs: ['Fresh@Produce', 'Canned#Goods', 'Fresh-Food'],
                expected: false,
                errorMessage: 'Category name can only contain letters and spaces'
            }),
            createValidationTestCase({
                scenario: 'names with repeated words',
                inputs: ['Fresh Fresh', 'The The Food', 'Fresh Fresh Fresh'],
                expected: false,
                errorMessage: 'Category name cannot contain repeated words'
            })
        ];

        runValidationTestCases(validationCases, validateName, mockManager);

        test('handles null or undefined input', () => {
            [null, undefined, ''].forEach(input => {
                expect(validateName(input, mockManager)).toBe(false);
            });
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Category name must be at least three characters long',
                'error',
                'category'
            );
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
    });

    describe('handleNameInput', () => {
        const transformationCases = [
            {
                scenario: 'non-string values',
                inputs: [123, true, {}, [], null, undefined],
                expected: ''
            },
            {
                scenario: 'whitespace handling',
                inputs: ['  Fresh   Produce  ', '\tFresh\nProduce\r'],
                expected: 'Fresh Produce'
            },
            {
                scenario: 'title case conversion',
                inputs: ['fresh produce', 'FRESH PRODUCE', 'fReSh PrOdUcE'],
                expected: 'Fresh Produce'
            }
        ];

        transformationCases.forEach(({ scenario, inputs, expected }) => {
            test(`handles ${scenario}`, () => {
                inputs.forEach(input => {
                    mockEvent.target.value = input;
                    validateCategoryName(mockEvent, mockManager);
                    expect(mockEvent.target.value).toBe(expected);
                });
            });
        });

        test('handles input longer than maximum length', () => {
            mockEvent.target.value = 'This Is A Very Long Category Name That Should Be Truncated';
            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value.length).toBeLessThanOrEqual(36);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Input cannot exceed 36 characters',
                'warning',
                'category'
            );
        });

        test('warns about consecutive spaces', () => {
            mockEvent.target.value = 'Fresh    Produce    Items';
            validateCategoryName(mockEvent, mockManager);
            expect(mockEvent.target.value).toBe('Fresh Produce Items');
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Consecutive spaces detected',
                'warning',
                'category'
            );
        });
    });

    describe('validateItemLimit', () => {
        const limitValidationCases = [
            createValidationTestCase({
                scenario: 'valid numeric limits',
                inputs: [5, '10', 0, '0'],
                expected: true
            }),
            createValidationTestCase({
                scenario: 'negative values',
                inputs: [-1, '-5', -0.1, '-0.1', Number.MIN_SAFE_INTEGER],
                expected: false,
                errorMessage: 'Item limit cannot be negative'
            }),
            createValidationTestCase({
                scenario: 'values exceeding global limit',
                inputs: [15, '20', Number.MAX_SAFE_INTEGER],
                expected: false,
                errorMessage: 'Item limit cannot exceed global limit of 10'
            })
        ];

        runValidationTestCases(limitValidationCases.map(testCase => ({
            ...testCase,
            // Add global limit parameter for validateItemLimit
            inputs: testCase.inputs.map(input => [input, 10])
        })), (input, manager) => validateItemLimit(input[0], input[1], manager), mockManager);

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

        test('handles invalid global limits', () => {
            const invalidGlobals = [-1, 0, 'abc', null, undefined, NaN];

            invalidGlobals.forEach(globalLimit => {
                expect(validateItemLimit(5, globalLimit, mockManager)).toBe(false);
            });
        });
    });
});