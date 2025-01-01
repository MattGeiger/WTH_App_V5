/**
 * @jest-environment jsdom
 */

import {
    formatLimit,
    formatName,
    formatTableDate,
    formatRelativeTime,
    formatStatistic,
    formatForSubmission,
    createDisplayName
} from '../../utils/formatters.js';

describe('Formatters', () => {
    describe('formatLimit', () => {
        test('formats numeric limits correctly', () => {
            expect(formatLimit(5)).toBe('5');
            expect(formatLimit('10')).toBe('10');
            expect(formatLimit(100)).toBe('100');
        });

        test('handles zero and zero-like values', () => {
            const zeroValues = [0, '0', -0, '+0', '00', '.0', '0.0'];
            zeroValues.forEach(value => {
                expect(formatLimit(value)).toBe('No Limit');
            });
        });

        test('handles non-numeric and invalid inputs', () => {
            const invalidInputs = [
                null, undefined, '', 'invalid', NaN, Infinity, -Infinity,
                {}, [], true, false, Symbol('test'), () => {}
            ];
            invalidInputs.forEach(input => {
                expect(formatLimit(input)).toBe('No Limit');
            });
        });

        test('handles negative and decimal values', () => {
            const values = [
                -1, -10, -100, -0.1, -1.5,
                '-1', '-10', '-0.5', '1.5', '2.7'
            ];
            values.forEach(value => {
                expect(formatLimit(value)).toBe('No Limit');
            });
        });
    });

    describe('formatName', () => {
        test('formats names in title case', () => {
            const testCases = [
                ['fresh produce', 'Fresh Produce'],
                ['CANNED GOODS', 'Canned Goods'],
                ['dAiRy PrOdUcTs', 'Dairy Products'],
                ['a b c', 'A B C'],
                ['one two three', 'One Two Three']
            ];
            testCases.forEach(([input, expected]) => {
                expect(formatName(input)).toBe(expected);
            });
        });

        test('handles various whitespace patterns', () => {
            const testCases = [
                ['  fresh   produce  ', 'Fresh Produce'],
                ['\tfresh\nproduce\r', 'Fresh Produce'],
                ['fresh    produce', 'Fresh Produce'],
                [' \n\t\rfresh\n\t\r', 'Fresh']
            ];
            testCases.forEach(([input, expected]) => {
                expect(formatName(input)).toBe(expected);
            });
        });

        test('handles invalid inputs', () => {
            const invalidInputs = [
                '', null, undefined, 123, true, false, {}, [],
                new Date(), /regex/, Symbol('test'), () => {}
            ];
            invalidInputs.forEach(input => {
                expect(formatName(input)).toBe('');
            });
        });
    });

    describe('formatTableDate', () => {
        test('formats dates consistently', () => {
            const testCases = [
                { date: new Date(Date.UTC(2024, 0, 1)), expected: '01/01/2024' },
                { date: new Date(Date.UTC(2024, 11, 31)), expected: '12/31/2024' },
                { date: new Date(Date.UTC(2024, 5, 15)), expected: '06/15/2024' }
            ];
            testCases.forEach(({ date, expected }) => {
                expect(formatTableDate(date)).toBe(expected);
            });
        });

        test('handles various date string formats', () => {
            const testCases = [
                { input: '2024-01-01', expected: '01/01/2024' },
                { input: '2024-12-31', expected: '12/31/2024' },
                { input: '2024-01-01T00:00:00Z', expected: '01/01/2024' },
                { input: '2024-01-01T12:00:00.000Z', expected: '01/01/2024' }
            ];
            testCases.forEach(({ input, expected }) => {
                expect(formatTableDate(input)).toBe(expected);
            });
        });

        test('handles invalid dates and inputs', () => {
            const invalidInputs = [
                null, undefined, '', 'invalid-date',
                '2024-13-01', // invalid month
                '2024-01-32', // invalid day
                new Date('invalid'),
                {}, [], true, false
            ];
            invalidInputs.forEach(input => {
                expect(formatTableDate(input)).toBe('');
            });
        });
    });

    describe('formatRelativeTime', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('formats different time ranges correctly', () => {
            const testCases = [
                // Within a minute
                { date: '2024-01-01T11:59:30Z', expected: 'Just now' },
                { date: '2024-01-01T11:59:00Z', expected: '1 minute ago' },
                // Minutes
                { date: '2024-01-01T11:58:00Z', expected: '2 minutes ago' },
                { date: '2024-01-01T11:45:00Z', expected: '15 minutes ago' },
                // Hours
                { date: '2024-01-01T11:00:00Z', expected: '1 hour ago' },
                { date: '2024-01-01T10:00:00Z', expected: '2 hours ago' }
            ];

            testCases.forEach(({ date, expected }) => {
                expect(formatRelativeTime(new Date(date))).toBe(expected);
            });
        });

        test('formats older dates as absolute dates', () => {
            const testCases = [
                { date: '2023-12-31T12:00:00Z', expected: '12/31/2023' },
                { date: '2023-12-30T12:00:00Z', expected: '12/30/2023' },
                { date: '2023-01-01T00:00:00Z', expected: '01/01/2023' }
            ];

            testCases.forEach(({ date, expected }) => {
                expect(formatRelativeTime(new Date(date))).toBe(expected);
            });
        });

        test('handles invalid inputs', () => {
            const invalidInputs = [
                null, undefined, '', 'invalid',
                new Date('invalid'), {}, [], true, false
            ];

            invalidInputs.forEach(input => {
                const result = formatRelativeTime(input);
                expect(['Never', 'Invalid date']).toContain(result);
            });
        });
    });

    describe('formatStatistic', () => {
        test('formats numbers with different options', () => {
            const testCases = [
                { value: 42, options: {}, expected: '42' },
                { value: 42, options: { prefix: '$' }, expected: '$42' },
                { value: 42, options: { suffix: '%' }, expected: '42%' },
                { value: 42, options: { decimals: 1 }, expected: '42.0' },
                { value: 42.567, options: { decimals: 2 }, expected: '42.57' }
            ];

            testCases.forEach(({ value, options, expected }) => {
                expect(formatStatistic(value, options)).toBe(expected);
            });
        });

        test('handles rounding correctly', () => {
            const testCases = [
                { value: 42.4, options: {}, expected: '42' },
                { value: 42.5, options: {}, expected: '43' },
                { value: 42.44, options: { decimals: 1 }, expected: '42.4' },
                { value: 42.45, options: { decimals: 1 }, expected: '42.5' }
            ];

            testCases.forEach(({ value, options, expected }) => {
                expect(formatStatistic(value, options)).toBe(expected);
            });
        });

        test('handles invalid inputs', () => {
            const invalidInputs = [
                null, undefined, NaN, Infinity, -Infinity,
                '', 'invalid', {}, [], true, false
            ];

            invalidInputs.forEach(input => {
                expect(formatStatistic(input)).toBe('0');
            });
        });

        test('handles invalid options', () => {
            const testCases = [
                { value: 42, options: null, expected: '42' },
                { value: 42, options: undefined, expected: '42' },
                { value: 42, options: { decimals: 'invalid' }, expected: '42' },
                { value: 42, options: { decimals: -1 }, expected: '42' }
            ];

            testCases.forEach(({ value, options, expected }) => {
                expect(formatStatistic(value, options)).toBe(expected);
            });
        });
    });

    describe('createDisplayName', () => {
        test('creates display names with limits', () => {
            const testCases = [
                {
                    input: { name: 'Fresh Produce', itemLimit: 5 },
                    expected: 'Fresh Produce (5)'
                },
                {
                    input: { name: 'Canned Goods', itemLimit: 0 },
                    expected: 'Canned Goods (No Limit)'
                },
                {
                    input: { name: 'Dairy', itemLimit: null },
                    expected: 'Dairy (No Limit)'
                },
                {
                    input: { name: 'Frozen', itemLimit: undefined },
                    expected: 'Frozen (No Limit)'
                }
            ];

            testCases.forEach(({ input, expected }) => {
                expect(createDisplayName(input)).toBe(expected);
            });
        });

        test('handles invalid inputs', () => {
            const invalidInputs = [
                null, undefined, '', {}, { itemLimit: 5 },
                { name: '' }, { name: null }, { name: undefined }
            ];

            invalidInputs.forEach(input => {
                expect(createDisplayName(input)).toBe('');
            });
        });
    });
});
