/**
 * Statistics display management for categories
 */

/**
 * Ensures container has required accessibility attributes
 * @private
 * @param {HTMLElement} container - Stats container element
 */
function ensureAccessibility(container) {
    if (!container || !(container instanceof HTMLElement)) {
        console.error('Invalid container element');
        return;
    }

    const requiredAttributes = {
        'role': 'region',
        'aria-live': 'polite',
        'aria-label': 'Category Statistics'
    };

    Object.entries(requiredAttributes).forEach(([attr, value]) => {
        if (!container.hasAttribute(attr)) {
            container.setAttribute(attr, value);
        }
    });
}

/**
 * Creates or finds stats container
 * @private
 * @returns {HTMLElement|null} Stats container element or null
 */
function getStatsContainer() {
    try {
        let container = document.getElementById('categoryStats');
        if (!container) {
            container = document.createElement('div');
            container.id = 'categoryStats';
            container.className = 'stats';
            
            const parent = document.querySelector('#tableContainer');
            if (!parent) {
                if (!document.body) return null;
                document.body.appendChild(container);
            } else {
                parent.appendChild(container);
            }
        }

        ensureAccessibility(container);
        return container;
    } catch (error) {
        console.error('Error getting stats container:', error);
        return null;
    }
}

/**
 * Updates statistics display
 * @param {Array} categories - Category data
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {boolean} Success indicator
 */
export function updateStats(categories = [], lastUpdated = null) {
    try {
        const container = getStatsContainer();
        if (!container) {
            console.error('Failed to get stats container');
            return false;
        }

        const stats = calculateStats(categories);
        container.innerHTML = createStatsDisplay(stats, lastUpdated);
        return true;
    } catch (error) {
        console.error('Error updating stats:', error);
        return false;
    }
}

/**
 * Safely parses numeric values
 * @private
 * @param {*} value - Value to parse
 * @returns {number} Parsed number or 0
 */
function safeParseInt(value) {
    if (value === null || value === undefined) return 0;
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : 0;
}

/**
 * Calculates statistics from category data
 * @private
 * @param {Array} categories - Category data
 * @returns {Object} Calculated statistics
 */
function calculateStats(categories) {
    try {
        if (!Array.isArray(categories) || categories.length === 0) {
            return { total: 0, withLimits: 0, noLimits: 0, averageLimit: null };
        }

        // Filter valid categories with limits
        const withLimits = categories.filter(cat => {
            if (!cat || typeof cat !== 'object') return false;
            const limit = safeParseInt(cat.itemLimit);
            return limit > 0;
        });

        // Calculate average limit if there are categories with limits
        let averageLimit = null;
        if (withLimits.length > 0) {
            const total = withLimits.reduce((sum, cat) => {
                const limit = safeParseInt(cat.itemLimit);
                return sum + (limit > 0 ? limit : 0);
            }, 0);
            averageLimit = Math.round(total / withLimits.length);
        }

        return {
            total: categories.length,
            withLimits: withLimits.length,
            noLimits: categories.length - withLimits.length,
            averageLimit: averageLimit !== null && isFinite(averageLimit) ? averageLimit : null
        };
    } catch (error) {
        console.error('Error calculating stats:', error);
        return { total: 0, withLimits: 0, noLimits: 0, averageLimit: null };
    }
}

/**
 * Creates HTML for stats display
 * @private
 * @param {Object} stats - Statistics object
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {string} HTML content
 */
function createStatsDisplay(stats = {}, lastUpdated = null) {
    try {
        const safeStats = {
            total: Math.max(0, safeParseInt(stats.total)),
            withLimits: Math.max(0, safeParseInt(stats.withLimits)),
            noLimits: Math.max(0, safeParseInt(stats.noLimits)),
            averageLimit: stats.averageLimit !== null && isFinite(stats.averageLimit) ? 
                Math.round(stats.averageLimit) : null
        };

        const statsContent = [
            { label: 'Total Categories', value: safeStats.total },
            { label: 'With Limits', value: safeStats.withLimits },
            { label: 'No Limits', value: safeStats.noLimits }
        ];

        if (safeStats.averageLimit !== null) {
            statsContent.push({
                label: 'Average Limit',
                value: safeStats.averageLimit
            });
        }

        const statsHtml = statsContent.map(({ label, value }) => `
            <div role="text" class="stats__item">
                <span class="stats__label">${label}:</span>
                <span class="stats__value">${value}</span>
            </div>
        `).join('');

        const timestamp = formatTimestamp(lastUpdated);
        return `
            <div class="stats__content">${statsHtml}</div>
            <div class="stats__timestamp" 
                 aria-label="Last updated" 
                 role="status">
                Last Updated: ${timestamp}
            </div>
        `.trim().replace(/\s+/g, ' ');
    } catch (error) {
        console.error('Error creating stats display:', error);
        return `
            <div class="stats__content">
                <div role="text" class="stats__item stats__item--error">
                    Error calculating statistics
                </div>
            </div>
            <div class="stats__timestamp" role="status">Last Updated: Never</div>
        `.trim();
    }
}

/**
 * Formats timestamp for display
 * @private
 * @param {*} input - Timestamp input
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(input) {
    try {
        // Handle null/undefined/empty inputs
        if (!input) return 'Never';

        // Convert input to Date object
        const date = input instanceof Date ? input : new Date(input);
        
        // Validate date
        if (!date || isNaN(date.getTime()) || date.getTime() <= 1) return 'Never';

        const now = new Date();
        const diff = now.getTime() - date.getTime();

        // Handle invalid time differences
        if (isNaN(diff)) return 'Never';

        // Format based on time difference
        if (diff < 0) {
            // Future dates use standard format
            return date.toLocaleString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        // Recent times use relative format
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return 'less than a minute ago';
        if (diff < 86400000) return 'about 1 hour ago';

        // Older dates use standard format
        return date.toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return 'Never';
    }
}