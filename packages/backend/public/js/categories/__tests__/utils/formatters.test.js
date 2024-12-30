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
        test('formats numeric limits', () => {
            expect(formatLimit(5)).toBe('5');
            expect(formatLimit('10')).toBe('10');
            expect(formatLimit(0)).toBe('No Limit');
        });

        test('handles invalid inputs', () => {
            expect(formatLimit(null)).toBe('No Limit');
            expect(formatLimit(undefined)).toBe('No Limit');
            expect(formatLimit('invalid')).toBe('No Limit');
            expect(formatLimit('')).toBe('No Limit');
        });

        test('handles negative values', () => {
            expect(formatLimit(-1)).toBe('No Limit');
            expect(formatLimit('-5')).toBe('No Limit');
        });
    });

    describe('formatName', () => {
        test('formats names in title case', () => {
            expect(formatName('fresh produce')).toBe('Fresh Produce');
            expect(formatName('CANNED GOODS')).toBe('Canned Goods');
            expect(formatName('dAiRy PrOdUcTs')).toBe('Dairy Products');
        });

        test('trims whitespace', () => {
            expect(formatName('  fresh produce  ')).toBe('Fresh Produce');
            expect(formatName('fresh   produce')).toBe('Fresh Produce');
        });

        test('handles invalid inputs', () => {
            expect(formatName('')).toBe('');
            expect(formatName(null)).toBe('');
            expect(formatName(undefined)).toBe('');
        });
    });

    describe('formatTableDate', () => {
        test('formats dates consistently', () => {
            const date = new Date('2024-01-01');
            expect(formatTableDate(date)).toBe(date.toLocaleDateString());
        });

        test('handles date strings', () => {
            const dateStr = '2024-01-01T12:00:00Z';
            const expected = new Date(dateStr).toLocaleDateString();
            expect(formatTableDate(dateStr)).toBe(expected);
        });

        test('handles invalid inputs', () => {
            expect(formatTableDate('')).toBe('');
            expect(formatTableDate(null)).toBe('');
            expect(formatTableDate(undefined)).toBe('');
            expect(formatTableDate('invalid')).toBe('');
        });
    });

    describe('formatRelativeTime', () => {
        beforeEach(() => {
            jest.spyOn(Date, 'now').mockImplementation(() =>
                new Date('2024-01-01T12:00:00Z').getTime()
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        test('formats recent times as relative', () => {
            const times = [
                { input: new Date(Date.now() - 30000), expected: 'Just now' },
                { input: new Date(Date.now() - 120000), expected: '2 minutes ago' },
                { input: new Date(Date.now() - 3600000), expected: '1 hour ago' }
            ];

            times.forEach(({ input, expected }) => {
                expect(formatRelativeTime(input)).toBe(expected);
            });
        });

        test('formats older dates as full date string', () => {
            const oldDate = new Date('2023-12-25');
            expect(formatRelativeTime(oldDate)).toBe(formatTableDate(oldDate));
        });

        test('handles invalid inputs', () => {
            expect(formatRelativeTime(null)).toBe('Never');
            expect(formatRelativeTime(undefined)).toBe('Never');
            expect(formatRelativeTime('invalid')).toBe('Invalid date');
        });
    });

    describe('formatStatistic', () => {
        test('formats numbers with options', () => {
            expect(formatStatistic(42, { prefix: '$', suffix: 'USD' })).toBe('$42USD');
            expect(formatStatistic(10.5, { decimals: 2 })).toBe('10.50');
            expect(formatStatistic(0, { defaultValue: 'None' })).toBe('0');
        });

        test('handles invalid inputs', () => {
            expect(formatStatistic(null)).toBe('0');
            expect(formatStatistic(undefined)).toBe('0');
            expect(formatStatistic('invalid')).toBe('0');
        });

        test('respects decimal places', () => {
            expect(formatStatistic(10.123, { decimals: 2 })).toBe('10.12');
            expect(formatStatistic(10, { decimals: 2 })).toBe('10.00');
        });
    });

    describe('formatForSubmission', () => {
        test('formats category data for API', () => {
            const category = {
                name: ' Fresh Produce ',
                itemLimit: '5',
                id: '42'
            };

            const formatted = formatForSubmission(category);
            expect(formatted).toEqual({
                name: 'Fresh Produce',
                itemLimit: 5,
                id: 42
            });
        });

        test('handles missing id for new categories', () => {
            const category = {
                name: 'Fresh Produce',
                itemLimit: 5
            };

            const formatted = formatForSubmission(category);
            expect(formatted).toEqual({
                name: 'Fresh Produce',
                itemLimit: 5
            });
            expect(formatted).not.toHaveProperty('id');
        });
    });

    describe('createDisplayName', () => {
        test('creates display names with limits', () => {
            const category = { name: 'Fresh Produce', itemLimit: 5 };
            expect(createDisplayName(category)).toBe('Fresh Produce (5)');

            const noLimit = { name: 'Canned Goods', itemLimit: 0 };
            expect(createDisplayName(noLimit)).toBe('Canned Goods (No Limit)');
        });

        test('handles missing values', () => {
            expect(createDisplayName({ name: 'Test' })).toBe('Test (No Limit)');
            expect(createDisplayName({ itemLimit: 5 })).toBe(' (5)');
            expect(createDisplayName({})).toBe(' (No Limit)');
        });
    });
});