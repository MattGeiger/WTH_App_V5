/**
 * @jest-environment jsdom
 */

import { createStatsView } from '../../ui/stats.js';

describe('Stats UI', () => {
    let container;

    beforeEach(() => {
        // Setup DOM container
        container = document.createElement('div');
        document.body.appendChild(container);

        // Mock Date.now for consistent timestamp testing
        jest.spyOn(Date, 'now').mockImplementation(() => new Date('2024-01-01T12:00:00Z').getTime());
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('createStatsView', () => {
        test('creates stats container with correct attributes', () => {
            const stats = createStatsView();
            const container = document.getElementById('categoryStats');
            
            expect(container).not.toBeNull();
            expect(container.classList.contains('stats-container')).toBe(true);
            expect(container.getAttribute('aria-live')).toBe('polite');
        });

        test('reuses existing container if present', () => {
            const existingContainer = document.createElement('div');
            existingContainer.id = 'categoryStats';
            document.body.appendChild(existingContainer);

            createStatsView();
            const containers = document.querySelectorAll('#categoryStats');
            expect(containers).toHaveLength(1);
        });
    });

    describe('updateStats', () => {
        let statsView;

        beforeEach(() => {
            statsView = createStatsView();
        });

        test('displays complete statistics for categories', () => {
            const categories = [
                { id: 1, name: 'Category 1', itemLimit: 5 },
                { id: 2, name: 'Category 2', itemLimit: 0 },
                { id: 3, name: 'Category 3', itemLimit: 10 }
            ];
            const lastUpdated = new Date('2024-01-01T11:30:00Z');

            statsView.updateStats(categories, lastUpdated);
            const container = document.getElementById('categoryStats');

            expect(container.textContent).toContain('Total Categories: 3');
            expect(container.textContent).toContain('With Limits: 2');
            expect(container.textContent).toContain('No Limits: 1');
            expect(container.textContent).toContain('Average Limit: 8');
            expect(container.textContent).toContain('30 minutes ago');
        });

        test('handles empty category list', () => {
            statsView.updateStats([], new Date());
            const container = document.getElementById('categoryStats');

            expect(container.textContent).toContain('Total Categories: 0');
            expect(container.textContent).toContain('With Limits: 0');
            expect(container.textContent).toContain('No Limits: 0');
            expect(container.textContent).not.toContain('Average Limit');
        });

        test('handles invalid input', () => {
            const invalidInputs = [null, undefined, '', {}, 42, true];

            invalidInputs.forEach(input => {
                statsView.updateStats(input, new Date());
                const container = document.getElementById('categoryStats');

                expect(container.textContent).toContain('Total Categories: 0');
                expect(container.textContent).toContain('With Limits: 0');
                expect(container.textContent).toContain('No Limits: 0');
            });
        });

        describe('timestamp formatting', () => {
            test('formats recent timestamps as relative time', () => {
                const timestamps = [
                    { time: new Date(Date.now() - 30000), expected: 'Just now' },
                    { time: new Date(Date.now() - 120000), expected: '2 minutes ago' },
                    { time: new Date(Date.now() - 3600000), expected: '1 hour ago' }
                ];

                timestamps.forEach(({ time, expected }) => {
                    statsView.updateStats([], time);
                    const container = document.getElementById('categoryStats');
                    expect(container.textContent).toContain(expected);
                });
            });

            test('formats older timestamps as date/time', () => {
                const oldTimestamp = new Date('2023-12-25T10:00:00Z');
                statsView.updateStats([], oldTimestamp);
                const container = document.getElementById('categoryStats');

                expect(container.textContent).toContain(oldTimestamp.toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }));
            });

            test('handles invalid timestamps', () => {
                const invalidTimestamps = [null, undefined, '', 'invalid', {}, []];

                invalidTimestamps.forEach(timestamp => {
                    statsView.updateStats([], timestamp);
                    const container = document.getElementById('categoryStats');
                    expect(container.textContent).not.toContain('undefined');
                    expect(container.textContent).not.toContain('null');
                    expect(container.textContent).not.toContain('NaN');
                });
            });
        });

        describe('statistics calculation', () => {
            test('calculates average limit correctly', () => {
                const categories = [
                    { itemLimit: 5 },
                    { itemLimit: 10 },
                    { itemLimit: 0 },
                    { itemLimit: 15 }
                ];

                statsView.updateStats(categories, new Date());
                const container = document.getElementById('categoryStats');
                expect(container.textContent).toContain('Average Limit: 10');
            });

            test('handles all zero limits', () => {
                const categories = [
                    { itemLimit: 0 },
                    { itemLimit: 0 },
                    { itemLimit: 0 }
                ];

                statsView.updateStats(categories, new Date());
                const container = document.getElementById('categoryStats');
                expect(container.textContent).not.toContain('Average Limit');
            });

            test('rounds average limit to nearest integer', () => {
                const categories = [
                    { itemLimit: 5 },
                    { itemLimit: 6 }
                ];

                statsView.updateStats(categories, new Date());
                const container = document.getElementById('categoryStats');
                expect(container.textContent).toContain('Average Limit: 6');
            });
        });
    });

    describe('Accessibility', () => {
        test('stats container has proper ARIA attributes', () => {
            const statsView = createStatsView();
            const container = document.getElementById('categoryStats');
            
            expect(container.getAttribute('aria-live')).toBe('polite');
            expect(container.getAttribute('role')).toBe('region');
            expect(container.getAttribute('aria-label')).toBe('Category Statistics');
        });

        test('stats items have proper structure', () => {
            const statsView = createStatsView();
            statsView.updateStats([{ itemLimit: 5 }], new Date());
            
            const items = document.querySelectorAll('.stats__item');
            items.forEach(item => {
                const label = item.querySelector('.stats__label');
                const value = item.querySelector('.stats__value');
                
                expect(label).not.toBeNull();
                expect(value).not.toBeNull();
                expect(label.id).toBeTruthy();
                expect(value.getAttribute('aria-labelledby')).toBe(label.id);
            });
        });

        test('timestamp has proper aria-label', () => {
            const statsView = createStatsView();
            statsView.updateStats([], new Date());
            
            const timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp).not.toBeNull();
            expect(timestamp.getAttribute('aria-label')).toBe('Last updated');
        });
    });
});