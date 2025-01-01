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
        test('handles numeric inputs', () => {
            expect(formatLimit(5)).toBe('5');
            expect(formatLimit(10)).toBe('10');
            expect(formatLimit(100)).toBe('100');
        });

        test('handles string inputs', () => {
            expect(formatLimit('5')).toBe('5');
            expect(formatLimit('10')).toBe('10');
            expect(formatLimit('100')).toBe('100');
        });

        test('handles zero and falsy values', () => {
            expect(formatLimit(0)).toBe('No Limit');
            expect(formatLimit('0')).toBe('No Limit');
            expect(formatLimit('')).toBe('No Limit');
            expect(formatLimit(null)).toBe('No Limit');
            expect(formatLimit(undefined)).toBe('No Limit');
        });

        test('handles negative values', () => {
            expect(formatLimit(-1)).toBe('No Limit');
            expect(formatLimit('-5')).toBe('No Limit');
            expect(formatLimit(-100)).toBe('No Limit');
        });

        test('handles invalid inputs', () => {
            expect(formatLimit('abc')).toBe('No Limit');
            expect(formatLimit('12.34')).toBe('No Limit');
            expect(formatLimit({})).toBe('No Limit');
            expect(formatLimit([])).toBe('No Limit');
            expect(formatLimit(true)).toBe('No Limit');
            expect(formatLimit(false)).toBe('No Limit');
            expect(formatLimit(NaN)).toBe('No Limit');
            expect(formatLimit(Infinity)).toBe('No Limit');
            expect(formatLimit(-Infinity)).toBe('No Limit');
        });
    });

    describe('formatName', () => {
        test('formats names in title case', () => {
            expect(formatName('fresh produce')).toBe('Fresh Produce');
            expect(formatName('CANNED GOODS')).toBe('Canned Goods');
            expect(formatName('dAiRy PrOdUcTs')).toBe('Dairy Products');
            expect(formatName('a b c')).toBe('A B C');
        });

        test('trims whitespace and normalizes spaces', () => {
            expect(formatName('  fresh   produce  ')).toBe('Fresh Produce');
            expect(formatName('\tfresh\nproduce\r')).toBe('Fresh Produce');
            expect(formatName('fresh    produce')).toBe('Fresh Produce');
            expect(formatName(' \n\t\rfresh\n\t\r ')).toBe('Fresh');
        });

        test('handles invalid inputs', () => {
            expect(formatName('')).toBe('');
            expect(formatName(null)).toBe('');
            expect(formatName(undefined)).toBe('');
            expect(formatName(123)).toBe('');
            expect(formatName(true)).toBe('');
            expect(formatName({})).toBe('');
            expect(formatName([])).toBe('');
            expect(formatName(NaN)).toBe('');
            expect(formatName(() => {})).toBe('');
        });

        test('formats single words correctly', () => {
            expect(formatName('test')).toBe('Test');
            expect(formatName('TEST')).toBe('Test');
            expect(formatName('tESt')).toBe('Test');
        });

        test('handles mixed case words', () => {
            expect(formatName('MacBook Pro')).toBe('Macbook Pro');
            expect(formatName('iPhone Case')).toBe('Iphone Case');
            expect(formatName('iOS Device')).toBe('Ios Device');
        });
    });

    describe('formatTableDate', () => {
        test('formats valid dates', () => {
            expect(formatTableDate(new Date('2024-01-01'))).toBe('01/01/2024');
            expect(formatTableDate(new Date('2024-12-31'))).toBe('12/31/2024');
            expect(formatTableDate(new Date('2024-06-15'))).toBe('06/15/2024');
        });

        test('handles different date string formats', () => {
            expect(formatTableDate('2024-01-01')).toBe('01/01/2024');
            expect(formatTableDate('2024-01-01T00:00:00Z')).toBe('01/01/2024');
            expect(formatTableDate('2024-01-01T12:00:00.000Z')).toBe('01/01/2024');
        });

        test('handles invalid dates', () => {
            expect(formatTableDate('')).toBe('');
            expect(formatTableDate(null)).toBe('');
            expect(formatTableDate(undefined)).toBe('');
            expect(formatTableDate('invalid')).toBe('');
            expect(formatTableDate('2024-13-01')).toBe('');
            expect(formatTableDate('2024-01-32')).toBe('');
            expect(formatTableDate(new Date('invalid'))).toBe('');
        });

        test('handles non-date inputs', () => {
            expect(formatTableDate({})).toBe('');
            expect(formatTableDate([])).toBe('');
            expect(formatTableDate(true)).toBe('');
            expect(formatTableDate(123)).toBe('');
            expect(formatTableDate(() => {})).toBe('');
        });

        test('handles Date constructor errors', () => {
            const throwingValue = {
                toString: () => { throw new Error(); },
                valueOf: () => { throw new Error(); }
            };
            expect(formatTableDate(throwingValue)).toBe('');
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

        test('handles recent times', () => {
            expect(formatRelativeTime(new Date('2024-01-01T11:59:30Z'))).toBe('Just now');
            expect(formatRelativeTime(new Date('2024-01-01T11:59:00Z'))).toBe('1 minute ago');
            expect(formatRelativeTime(new Date('2024-01-01T11:58:00Z'))).toBe('2 minutes ago');
        });

        test('handles hour differences', () => {
            expect(formatRelativeTime(new Date('2024-01-01T11:00:00Z'))).toBe('1 hour ago');
            expect(formatRelativeTime(new Date('2024-01-01T10:00:00Z'))).toBe('2 hours ago');
        });

        test('formats older dates as absolute dates', () => {
            expect(formatRelativeTime(new Date('2023-12-31T12:00:00Z'))).toBe('12/31/2023');
            expect(formatRelativeTime(new Date('2023-12-30T12:00:00Z'))).toBe('12/30/2023');
            expect(formatRelativeTime(new Date('2023-01-01T00:00:00Z'))).toBe('01/01/2023');
        });

        test('handles invalid inputs', () => {
            expect(formatRelativeTime(null)).toBe('Never');
            expect(formatRelativeTime(undefined)).toBe('Never');
            expect(formatRelativeTime('')).toBe('Never');
            expect(formatRelativeTime('invalid')).toBe('Invalid date');
            expect(formatRelativeTime(new Date('invalid'))).toBe('Invalid date');
            expect(formatRelativeTime({})).toBe('Invalid date');
            expect(formatRelativeTime([])).toBe('Invalid date');
            expect(formatRelativeTime(true)).toBe('Invalid date');
            expect(formatRelativeTime(123)).toBe('Invalid date');
        });

        test('handles constructor errors', () => {
            const throwingValue = {
                toString: () => { throw new Error(); },
                valueOf: () => { throw new Error(); }
            };
            expect(formatRelativeTime(throwingValue)).toBe('Never');
        });
    });

    describe('formatStatistic', () => {
        test('formats whole numbers', () => {
            expect(formatStatistic(42)).toBe('42');
            expect(formatStatistic(1000)).toBe('1000');
            expect(formatStatistic(0)).toBe('0');
        });

        test('handles decimal places', () => {
            expect(formatStatistic(42.1, { decimals: 1 })).toBe('42.1');
            expect(formatStatistic(42.12, { decimals: 2 })).toBe('42.12');
            expect(formatStatistic(42, { decimals: 2 })).toBe('42.00');
        });

        test('handles prefix and suffix', () => {
            expect(formatStatistic(42, { prefix: '$' })).toBe('$42');
            expect(formatStatistic(42, { suffix: '%' })).toBe('42%');
            expect(formatStatistic(42, { prefix: '$', suffix: 'USD' })).toBe('$42USD');
        });

        test('handles invalid values', () => {
            expect(formatStatistic(NaN)).toBe('0');
            expect(formatStatistic(null)).toBe('0');
            expect(formatStatistic(undefined)).toBe('0');
            expect(formatStatistic('')).toBe('0');
            expect(formatStatistic('invalid')).toBe('0');
            expect(formatStatistic({})).toBe('0');
            expect(formatStatistic([])).toBe('0');
            expect(formatStatistic(true)).toBe('0');
        });

        test('handles invalid options', () => {
            expect(formatStatistic(42, null)).toBe('42');
            expect(formatStatistic(42, undefined)).toBe('42');
            expect(formatStatistic(42, {})).toBe('42');
            expect(formatStatistic(42, { decimals: 'invalid' })).toBe('42');
            expect(formatStatistic(42, { decimals: -1 })).toBe('42');
        });

        test('handles rounding', () => {
            expect(formatStatistic(42.4)).toBe('42');
            expect(formatStatistic(42.5)).toBe('43');
            expect(formatStatistic(42.6)).toBe('43');
        });
    });

    describe('formatForSubmission', () => {
        test('formats complete category data', () => {
            const data = {
                id: '42',
                name: ' Fresh Produce ',
                itemLimit: '5'
            };
            expect(formatForSubmission(data)).toEqual({
                id: 42,
                name: 'Fresh Produce',
                itemLimit: 5
            });
        });

        test('handles missing id', () => {
            const data = {
                name: 'Fresh Produce',
                itemLimit: 5
            };
            expect(formatForSubmission(data)).toEqual({
                name: 'Fresh Produce',
                itemLimit: 5
            });
        });

        test('handles invalid inputs', () => {
            expect(formatForSubmission(null)).toBeNull();
            expect(formatForSubmission(undefined)).toBeNull();
            expect(formatForSubmission('')).toBeNull();
            expect(formatForSubmission(123)).toBeNull();
            expect(formatForSubmission([])).toBeNull();
            expect(formatForSubmission(true)).toBeNull();
        });

        test('handles empty or invalid properties', () => {
            expect(formatForSubmission({})).toEqual({
                name: '',
                itemLimit: 0
            });
            expect(formatForSubmission({ name: null, itemLimit: null })).toEqual({
                name: '',
                itemLimit: 0
            });
            expect(formatForSubmission({ name: undefined, itemLimit: undefined })).toEqual({
                name: '',
                itemLimit: 0
            });
        });
    });

    describe('createDisplayName', () => {
        test('formats names with limits', () => {
            expect(createDisplayName({ name: 'Fresh Produce', itemLimit: 5 }))
                .toBe('Fresh Produce (5)');
            expect(createDisplayName({ name: 'Canned Goods', itemLimit: 0 }))
                .toBe('Canned Goods (No Limit)');
            expect(createDisplayName({ name: 'Dairy', itemLimit: null }))
                .toBe('Dairy (No Limit)');
            expect(createDisplayName({ name: 'Test', itemLimit: undefined }))
                .toBe('Test (No Limit)');
        });

        test('handles invalid inputs', () => {
            expect(createDisplayName(null)).toBe('');
            expect(createDisplayName(undefined)).toBe('');
            expect(createDisplayName({})).toBe('');
            expect(createDisplayName({ itemLimit: 5 })).toBe('');
            expect(createDisplayName({ name: '' })).toBe('');
            expect(createDisplayName({ name: null })).toBe('');
            expect(createDisplayName({ name: undefined })).toBe('');
        });

        test('handles invalid itemLimit values', () => {
            expect(createDisplayName({ name: 'Test', itemLimit: 'invalid' }))
                .toBe('Test (No Limit)');
            expect(createDisplayName({ name: 'Test', itemLimit: -1 }))
                .toBe('Test (No Limit)');
            expect(createDisplayName({ name: 'Test', itemLimit: NaN }))
                .toBe('Test (No Limit)');
        });
    });
});