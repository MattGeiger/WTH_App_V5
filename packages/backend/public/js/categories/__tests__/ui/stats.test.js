/**
 * @jest-environment jsdom
 */

import { updateStats } from '../../ui/stats.js';

describe('Stats UI', () => {
    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="categoryStats" class="stats" role="region" aria-live="polite" aria-label="Category Statistics">
                <div class="stats__content"></div>
                <div class="stats__timestamp"></div>
            </div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
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
    });

    describe('Timestamp Formatting', () => {
        test('formats recent times correctly', () => {
            jest.useFakeTimers();
            const now = new Date('2024-01-01T12:00:00');
            jest.setSystemTime(now);

            const testCases = [
                { 
                    input: new Date('2024-01-01T11:59:30'), // 30 seconds ago
                    expected: 'just now'
                },
                {
                    input: new Date('2024-01-01T11:58:00'), // 2 minutes ago
                    expected: 'less than a minute ago'
                },
                {
                    input: new Date('2024-01-01T11:00:00'), // 1 hour ago
                    expected: 'about 1 hour ago'
                },
                {
                    input: new Date('2024-01-01T10:00:00'), // 2 hours ago
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

        test('handles invalid timestamps', () => {
            [null, undefined, 'invalid', {}, true, new Date('invalid')].forEach(invalidTime => {
                updateStats([], invalidTime);
                const timestamp = document.querySelector('.stats__timestamp');
                expect(timestamp.textContent).toContain('Last Updated: Never');
            });
        });
    });

    describe('Data Validation', () => {
        test('handles invalid category data', () => {
            [null, undefined, 42, 'invalid', true, {}].forEach(invalidData => {
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
                { name: 'Test4', itemLimit: 0 }
            ];

            updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');
            expect(container.textContent).toContain('No Limits: 4');
            expect(container.textContent).not.toContain('Average Limit');
        });
    });

    describe('Accessibility', () => {
        test('stats container has proper ARIA attributes', () => {
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
            expect(timestamp.getAttribute('aria-label')).toBe('Last updated');
        });
    });
});