/**
 * @jest-environment jsdom
 */

import { updateStats } from '../../ui/stats.js';

describe('Stats UI', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="tableContainer">
                <div id="categoryStats" class="stats" role="region" aria-live="polite" aria-label="Category Statistics">
                    <div class="stats__content"></div>
                    <div class="stats__timestamp"></div>
                </div>
            </div>
        `;
        // Spy on console.error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        consoleErrorSpy.mockRestore();
    });

    describe('Container Management', () => {
        test('creates container if missing', () => {
            document.body.innerHTML = '<div id="tableContainer"></div>';
            updateStats([]);
            const container = document.getElementById('categoryStats');
            expect(container).not.toBeNull();
            expect(container.classList.contains('stats')).toBe(true);
        });

        test('handles missing tableContainer', () => {
            document.body.innerHTML = '';
            updateStats([]);
            const container = document.getElementById('categoryStats');
            expect(container).not.toBeNull();
            expect(document.body.contains(container)).toBe(true);
        });

        test('handles DOM manipulation errors', () => {
            // Simulate DOM manipulation error
            jest.spyOn(document, 'createElement').mockImplementation(() => {
                throw new Error('DOM manipulation failed');
            });
            
            const result = updateStats([]);
            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error getting stats container:',
                expect.any(Error)
            );
        });
    });

    describe('Basic Statistics', () => {
        test('displays complete statistics', () => {
            const categories = [
                { name: 'Cat1', itemLimit: 10 },
                { name: 'Cat2', itemLimit: 6 },
                { name: 'Cat3', itemLimit: 0 }
            ];
            
            updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');

            expect(container.textContent).toContain('Total Categories: 3');
            expect(container.textContent).toContain('With Limits: 2');
            expect(container.textContent).toContain('No Limits: 1');
            expect(container.textContent).toContain('Average Limit: 8');
        });

        test('handles empty category list', () => {
            updateStats([], new Date());
            const container = document.getElementById('categoryStats');
            
            expect(container.textContent).toContain('Total Categories: 0');
            expect(container.textContent).toContain('With Limits: 0');
            expect(container.textContent).toContain('No Limits: 0');
            expect(container.textContent).not.toContain('Average Limit');
        });

        test('handles calculation errors', () => {
            const categories = [
                { name: 'Test1', itemLimit: Infinity },
                { name: 'Test2', itemLimit: NaN },
                { name: 'Test3', itemLimit: -1 }
            ];

            updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('Total Categories: 3');
            expect(container.textContent).toContain('No Limits: 3');
            expect(container.textContent).not.toContain('Average Limit');
        });

        test('handles null category objects', () => {
            const categories = [null, undefined, {}, 
                { name: 'Valid', itemLimit: 5 }
            ];

            updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('Total Categories: 4');
            expect(container.textContent).toContain('With Limits: 1');
            expect(container.textContent).toContain('Average Limit: 5');
        });
    });

    describe('Timestamp Formatting', () => {
        test('formats recent times correctly', () => {
            jest.useFakeTimers();
            const now = new Date('2024-01-01T12:00:00');
            jest.setSystemTime(now);

            const testCases = [
                { 
                    input: new Date('2024-01-01T11:59:30'),
                    expected: 'just now'
                },
                {
                    input: new Date('2024-01-01T11:58:00'),
                    expected: 'less than a minute ago'
                },
                {
                    input: new Date('2024-01-01T11:00:00'),
                    expected: 'about 1 hour ago'
                },
                {
                    input: new Date('2024-01-01T10:00:00'),
                    expected: 'about 1 hour ago'
                }
            ];

            testCases.forEach(({ input, expected }) => {
                updateStats([], input);
                const timestamp = document.querySelector('.stats__timestamp');
                expect(timestamp.textContent).toContain(expected);
            });

            jest.useRealTimers();
        });

        test('formats older timestamps as date/time', () => {
            const oldDate = new Date('2023-12-01T10:00:00');
            updateStats([], oldDate);
            
            const timestamp = document.querySelector('.stats__timestamp');
            const expectedFormat = oldDate.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            expect(timestamp.textContent).toContain(expectedFormat);
        });

        test('handles extreme timestamp values', () => {
            const testCases = [
                { input: new Date(0), expected: 'Never' },
                { input: new Date('1970-01-01'), expected: 'Never' },
                { input: new Date(8.64e15), expected: expect.any(String) },
                { input: new Date(-8.64e15), expected: 'Never' }
            ];

            testCases.forEach(({ input, expected }) => {
                updateStats([], input);
                const timestamp = document.querySelector('.stats__timestamp');
                expect(timestamp.textContent).toContain(expected);
            });
        });

        test('handles invalid timestamps', () => {
            const invalidInputs = [
                null, undefined, 'invalid', {}, true, 
                new Date('invalid'), -1, Symbol('test'),
                [], [2024, 1, 1], new Date(NaN)
            ];

            invalidInputs.forEach(invalidTime => {
                updateStats([], invalidTime);
                const timestamp = document.querySelector('.stats__timestamp');
                expect(timestamp.textContent).toContain('Last Updated: Never');
            });
        });

        test('handles timestamp formatting errors', () => {
            const date = new Date('2024-01-01');
            jest.spyOn(date, 'toLocaleString').mockImplementation(() => {
                throw new Error('Locale error');
            });

            updateStats([], date);
            const timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp.textContent).toContain('Never');
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error formatting timestamp:',
                expect.any(Error)
            );
        });
    });

    describe('Data Validation', () => {
        test('handles invalid category data', () => {
            const invalidInputs = [
                null, undefined, 42, 'invalid', true, {},
                Symbol('test'), function(){}, Promise.resolve([])
            ];

            invalidInputs.forEach(invalidData => {
                updateStats(invalidData, new Date());
                const container = document.getElementById('categoryStats');
                expect(container.textContent).toContain('Total Categories: 0');
                expect(container.textContent).toContain('With Limits: 0');
                expect(container.textContent).toContain('No Limits: 0');
            });
        });

        test('handles missing item limits', () => {
            const categories = [
                { name: 'Test1' },
                { name: 'Test2', itemLimit: undefined },
                { name: 'Test3', itemLimit: null },
                { name: 'Test4', itemLimit: 0 },
                { name: 'Test5', itemLimit: '0' },
                { name: 'Test6', itemLimit: '' }
            ];

            updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('No Limits: 6');
            expect(container.textContent).not.toContain('Average Limit');
        });

        test('handles non-numeric limits', () => {
            const categories = [
                { name: 'Test1', itemLimit: '5' },
                { name: 'Test2', itemLimit: true },
                { name: 'Test3', itemLimit: '10abc' },
                { name: 'Test4', itemLimit: [] }
            ];

            updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('With Limits: 1');
            expect(container.textContent).toContain('Average Limit: 5');
        });
    });

    describe('Accessibility', () => {
        test('stats container has proper ARIA attributes', () => {
            const container = document.getElementById('categoryStats');
            expect(container.getAttribute('role')).toBe('region');
            expect(container.getAttribute('aria-live')).toBe('polite');
            expect(container.getAttribute('aria-label')).toBe('Category Statistics');
        });

        test('ensures accessibility attributes on dynamic container', () => {
            document.body.innerHTML = '';
            updateStats([]);
            const container = document.getElementById('categoryStats');
            
            expect(container.getAttribute('role')).toBe('region');
            expect(container.getAttribute('aria-live')).toBe('polite');
            expect(container.getAttribute('aria-label')).toBe('Category Statistics');
        });

        test('stats values are screen reader friendly', () => {
            const categories = [{ name: 'Test', itemLimit: 5 }];
            updateStats(categories, new Date());

            const statsItems = document.querySelectorAll('[role="text"]');
            expect(statsItems.length).toBeGreaterThan(0);
            statsItems.forEach(item => {
                expect(item.querySelector('.stats__label')).not.toBeNull();
                expect(item.querySelector('.stats__value')).not.toBeNull();
            });
        });

        test('timestamp has proper labeling', () => {
            updateStats([], new Date());
            const timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp).not.toBeNull();
            expect(timestamp.getAttribute('role')).toBe('status');
            expect(timestamp.getAttribute('aria-label')).toBe('Last updated');
        });

        test('handles error state accessibility', () => {
            jest.spyOn(document, 'getElementById').mockImplementation(() => null);
            updateStats([]);
            
            const errorStats = document.querySelector('.stats__item--error');
            expect(errorStats).not.toBeNull();
            expect(errorStats.getAttribute('role')).toBe('text');
        });
    });
});
