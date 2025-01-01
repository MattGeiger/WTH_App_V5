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
    // Previous tests remain the same until formatTableDate...

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

        test('handles Date constructor exceptions', () => {
            // Create an object that throws when passed to new Date()
            const throwingInput = {
                toString: () => { throw new Error('Date constructor error'); },
                valueOf: () => { throw new Error('Date constructor error'); }
            };
            expect(formatTableDate(throwingInput)).toBe('');
        });

        test('handles getTime exceptions', () => {
            // Mock a Date object that throws on getTime()
            const mockDate = new Date();
            mockDate.getTime = () => { throw new Error('getTime error'); };
            expect(formatTableDate(mockDate)).toBe('');
        });

        test('handles UTC method exceptions', () => {
            // Mock Date methods to throw
            const mockDate = new Date('2024-01-01');
            mockDate.getUTCFullYear = () => { throw new Error('UTC error'); };
            expect(formatTableDate(mockDate)).toBe('');
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
                { date: '2024-01-01T11:59:30Z', expected: 'Just now' },
                { date: '2024-01-01T11:59:00Z', expected: '1 minute ago' },
                { date: '2024-01-01T11:58:00Z', expected: '2 minutes ago' },
                { date: '2024-01-01T11:45:00Z', expected: '15 minutes ago' },
                { date: '2024-01-01T11:00:00Z', expected: '1 hour ago' },
                { date: '2024-01-01T10:00:00Z', expected: '2 hours ago' }
            ];

            testCases.forEach(({ date, expected }) => {
                expect(formatRelativeTime(new Date(date))).toBe(expected);
            });
        });

        test('formats old dates using formatTableDate', () => {
            const testCases = [
                { date: '2023-12-31T12:00:00Z', expected: '12/31/2023' },
                { date: '2023-12-30T12:00:00Z', expected: '12/30/2023' },
                { date: '2023-01-01T00:00:00Z', expected: '01/01/2023' }
            ];

            testCases.forEach(({ date, expected }) => {
                expect(formatRelativeTime(new Date(date))).toBe(expected);
            });
        });

        test('handles null and undefined inputs', () => {
            expect(formatRelativeTime(null)).toBe('Never');
            expect(formatRelativeTime(undefined)).toBe('Never');
            expect(formatRelativeTime('')).toBe('Never');
        });

        test('handles invalid Date inputs', () => {
            expect(formatRelativeTime('invalid')).toBe('Invalid date');
            expect(formatRelativeTime(new Date('invalid'))).toBe('Invalid date');
            expect(formatRelativeTime('2024-13-01')).toBe('Invalid date');
        });

        test('handles Date constructor exceptions', () => {
            const throwingInput = {
                toString: () => { throw new Error('Date constructor error'); },
                valueOf: () => { throw new Error('Date constructor error'); }
            };
            expect(formatRelativeTime(throwingInput)).toBe('Never');
        });

        test('handles getTime exceptions', () => {
            const mockDate = new Date();
            mockDate.getTime = () => { throw new Error('getTime error'); };
            expect(formatRelativeTime(mockDate)).toBe('Never');
        });

        test('handles comparison calculation exceptions', () => {
            // Create a Date that throws during arithmetic operations
            const mockDate = new Date('2024-01-01');
            const originalValueOf = mockDate.valueOf;
            mockDate.valueOf = () => {
                if (new Error().stack?.includes('formatRelativeTime')) {
                    throw new Error('valueOf error');
                }
                return originalValueOf.call(mockDate);
            };
            expect(formatRelativeTime(mockDate)).toBe('Never');
        });
    });

    // Rest of the tests remain the same...
});