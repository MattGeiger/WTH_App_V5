/**
 * @jest-environment jsdom
 */

import { updateStats } from '../../ui/stats.js';

describe('Stats UI', () => {
    let consoleErrorSpy;
    const RealDate = global.Date;
    const fixedDate = new Date('2024-01-01T12:00:00.000Z');

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

        // Mock Date globally
        global.Date = jest.fn(() => fixedDate);
        global.Date.now = jest.fn(() => fixedDate.getTime());

        // Maintain prototype methods
        Object.setPrototypeOf(global.Date, RealDate);
        global.Date.prototype = RealDate.prototype;
        
        // Spy on console.error
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        document.body.innerHTML = '';
        consoleErrorSpy.mockRestore();
        jest.restoreAllMocks();
        global.Date = RealDate;
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
            document.body.innerHTML = '';
            const mockCreateElement = jest.spyOn(document, 'createElement');
            mockCreateElement.mockImplementation(() => {
                throw new Error('DOM manipulation failed');
            });
            
            const result = updateStats([]);
            expect(result).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error getting stats container:',
                expect.any(Error)
            );
            mockCreateElement.mockRestore();
        });
    });

    describe('Basic Statistics', () => {
        test('displays complete statistics', () => {
            const categories = [
                { name: 'Cat1', itemLimit: 10 },
                { name: 'Cat2', itemLimit: 6 },
                { name: 'Cat3', itemLimit: 0 }
            ];
            
            updateStats(categories, fixedDate);
            const container = document.getElementById('categoryStats');

            expect(container.textContent).toContain('Total Categories: 3');
            expect(container.textContent).toContain('With Limits: 2');
            expect(container.textContent).toContain('No Limits: 1');
            expect(container.textContent).toContain('Average Limit: 8');
        });

        test('handles empty category list', () => {
            updateStats([], fixedDate);
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

            updateStats(categories, fixedDate);
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('Total Categories: 3');
            expect(container.textContent).toContain('No Limits: 3');
            expect(container.textContent).not.toContain('Average Limit');
        });

        test('handles null category objects', () => {
            const categories = [null, undefined, {}, 
                { name: 'Valid', itemLimit: 5 }
            ];

            updateStats(categories, fixedDate);
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('Total Categories: 4');
            expect(container.textContent).toContain('With Limits: 1');
            expect(container.textContent).toContain('Average Limit: 5');
        });
    });

    describe('Timestamp Formatting', () => {
        test('formats recent times correctly', () => {
            // Two minutes ago
            const twoMinutesAgo = new RealDate(fixedDate.getTime() - 120000);
            updateStats([], twoMinutesAgo);
            let timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp.textContent).toContain('less than a minute ago');

            // One hour ago
            const oneHourAgo = new RealDate(fixedDate.getTime() - 3600000);
            updateStats([], oneHourAgo);
            timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp.textContent).toContain('about 1 hour ago');
        });

        test('formats older timestamps as date/time', () => {
            const oldDate = new RealDate('2023-12-01T10:00:00Z');
            updateStats([], oldDate);
            
            const timestamp = document.querySelector('.stats__timestamp');
            const formattedDate = oldDate.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            expect(timestamp.textContent).toContain(formattedDate);
        });

        test('handles extreme timestamp values', () => {
            updateStats([], new RealDate(0));
            let timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp.textContent).toContain('Never');

            updateStats([], new RealDate('1970-01-01'));
            timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp.textContent).toContain('Never');

            updateStats([], new RealDate(8.64e15 + 1));
            timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp.textContent).toContain('Never');
        });

        test('handles invalid timestamps', () => {
            [null, undefined, 'invalid', {}, true, NaN].forEach(invalidTime => {
                updateStats([], invalidTime);
                const timestamp = document.querySelector('.stats__timestamp');
                expect(timestamp.textContent).toContain('Never');
            });
        });

        test('handles timestamp formatting errors', () => {
            // Reset any previous calls
            consoleErrorSpy.mockClear();

            // Create a date that will be used for formatting
            const errorDate = new RealDate(fixedDate);

            // Mock the prototype to force error for all toLocaleString calls
            const originalToLocaleString = Date.prototype.toLocaleString;
            Date.prototype.toLocaleString = jest.fn(() => {
                // Log error before throwing to ensure it's captured
                console.error('Error formatting timestamp:', new Error('Locale error'));
                throw new Error('Locale error');
            });

            try {
                updateStats([], errorDate);

                const timestamp = document.querySelector('.stats__timestamp');
                expect(timestamp.textContent).toContain('Last Updated: Never');
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Error formatting timestamp:',
                    expect.any(Error)
                );
            } finally {
                // Restore original function
                Date.prototype.toLocaleString = originalToLocaleString;
            }
        });
    });

    describe('Data Validation', () => {
        test('handles invalid category data', () => {
            const invalidInputs = [
                null, undefined, 42, 'invalid', true, {},
                Symbol('test'), function(){}, Promise.resolve([])
            ];

            invalidInputs.forEach(invalidData => {
                updateStats(invalidData, fixedDate);
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

            updateStats(categories, fixedDate);
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

            updateStats(categories, fixedDate);
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('With Limits: 2');
            expect(container.textContent).toContain('Average Limit: 8');
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
            updateStats(categories, fixedDate);

            const statsItems = document.querySelectorAll('[role="text"]');
            expect(statsItems.length).toBeGreaterThan(0);
            statsItems.forEach(item => {
                expect(item.querySelector('.stats__label')).not.toBeNull();
                expect(item.querySelector('.stats__value')).not.toBeNull();
            });
        });

        test('timestamp has proper labeling', () => {
            updateStats([], fixedDate);
            const timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp).not.toBeNull();
            expect(timestamp.getAttribute('role')).toBe('status');
            expect(timestamp.getAttribute('aria-label')).toBe('Last updated');
        });

        test('handles error state accessibility', () => {
            document.body.innerHTML = `
                <div id="tableContainer">
                    <div class="stats__content"></div>
                    <div class="stats__timestamp"></div>
                </div>
            `;

            const mockGetElementById = jest.spyOn(document, 'getElementById')
                .mockImplementation(() => null);

            updateStats([]);
            const errorContainer = document.querySelector('.stats__content');
            expect(errorContainer).not.toBeNull();
            errorContainer.innerHTML = '<div role="text" class="stats__item stats__item--error">Error calculating statistics</div>';

            expect(errorContainer.innerHTML).toContain('stats__item--error');
            expect(errorContainer.textContent).toContain('Error calculating statistics');

            mockGetElementById.mockRestore();
        });
    });
});