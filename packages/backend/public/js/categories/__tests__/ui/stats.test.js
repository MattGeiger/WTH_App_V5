import * as statsView from '../../ui/stats';

describe('Stats UI', () => {
    beforeEach(() => {
        // Set up DOM elements
        document.body.innerHTML = `
            <div id="categoryStats" class="stats" role="region" aria-live="polite" aria-label="Category Statistics">
                <div class="stats__content"></div>
                <div class="stats__timestamp"></div>
            </div>
        `;
    });

    describe('updateStats', () => {
        test('displays complete statistics', () => {
            const categories = [
                { name: 'Cat1', itemLimit: 10 },
                { name: 'Cat2', itemLimit: 6 },
                { name: 'Cat3', itemLimit: 0 }
            ];
            
            statsView.updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');

            expect(container.textContent).toContain('Total Categories: 3');
            expect(container.textContent).toContain('With Limits: 2');
            expect(container.textContent).toContain('No Limits: 1');
            expect(container.textContent).toContain('Average Limit: 8');
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
            const invalidInputs = [null, undefined, '', {}, 42];
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
                const times = [
                    { time: new Date(), expected: 'just now' },
                    { time: new Date(Date.now() - 30000), expected: 'less than a minute ago' },
                    { time: new Date(Date.now() - 3600000), expected: 'about 1 hour ago' }
                ];

                times.forEach(({ time, expected }) => {
                    statsView.updateStats([], time);
                    const container = document.getElementById('categoryStats');
                    expect(container.textContent).toContain(expected);
                });
            });

            test('formats older timestamps as date/time', () => {
                const oldTimestamp = new Date('2024-01-01');
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
                const invalidTimestamps = [null, undefined, '', 'invalid', {}];
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
                    { itemLimit: 15 }
                ];
                statsView.updateStats(categories, new Date());
                const container = document.getElementById('categoryStats');
                expect(container.textContent).toContain('Average Limit: 10');
            });

            test('handles all zero limits', () => {
                const categories = [
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
                    { itemLimit: 8 }
                ];
                statsView.updateStats(categories, new Date());
                const container = document.getElementById('categoryStats');
                expect(container.textContent).toContain('Average Limit: 6');
            });
        });
    });

    describe('Accessibility', () => {
        test('stats container has proper ARIA attributes', () => {
            const container = document.getElementById('categoryStats');
            
            expect(container.getAttribute('aria-live')).toBe('polite');
            expect(container.getAttribute('role')).toBe('region');
            expect(container.getAttribute('aria-label')).toBe('Category Statistics');
        });

        test('stats are screen reader friendly', () => {
            const categories = [
                { name: 'Cat1', itemLimit: 5 }
            ];
            
            statsView.updateStats(categories, new Date());
            const container = document.getElementById('categoryStats');
            
            expect(container.querySelectorAll('[role="text"]')).toHaveLength(3);
            expect(container.querySelector('.stats__content')).toBeDefined();
            expect(container.querySelector('.stats__timestamp')).toBeDefined();
        });

        test('timestamp has proper aria-label', () => {
            statsView.updateStats([], new Date());
            
            const timestamp = document.querySelector('.stats__timestamp');
            expect(timestamp).not.toBeNull();
            expect(timestamp.getAttribute('aria-label')).toBe('Last updated');
        });
    });
});