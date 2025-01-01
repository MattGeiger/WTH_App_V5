/**
 * Statistics display management for categories
 */

/**
 * Ensures container has required accessibility attributes
 * @private
 * @param {HTMLElement} container - Stats container element
 */
function ensureAccessibility(container) {
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
    let container = document.getElementById('categoryStats');
    if (!container) {
        container = document.createElement('div');
        container.id = 'categoryStats';
        container.className = 'stats';
        
        const parent = document.querySelector('#tableContainer') || document.body;
        parent.appendChild(container);
    }

    ensureAccessibility(container);
    return container;
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
        if (!Array.isArray(categories)) {
            return { total: 0, withLimits: 0, noLimits: 0, averageLimit: null };
        }

        const withLimits = categories.filter(cat => {
            if (!cat || typeof cat !== 'object') return false;
            const limit = safeParseInt(cat.itemLimit);
            return limit > 0;
        });

        let averageLimit = null;
        if (withLimits.length > 0) {
            const total = withLimits.reduce((sum, cat) => {
                return sum + safeParseInt(cat.itemLimit);
            }, 0);
            averageLimit = Math.round(total / withLimits.length);
        }

        return {
            total: categories.length,
            withLimits: withLimits.length,
            noLimits: categories.length - withLimits.length,
            averageLimit
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
            averageLimit: stats.averageLimit
        };

        const statsContent = [
            { label: 'Total Categories', value: safeStats.total },
            { label: 'With Limits', value: safeStats.withLimits },
            { label: 'No Limits', value: safeStats.noLimits }
        ];

        if (safeStats.averageLimit !== null && 
            !isNaN(safeStats.averageLimit) && 
            isFinite(safeStats.averageLimit)) {
            statsContent.push({
                label: 'Average Limit',
                value: Math.round(safeStats.averageLimit)
            });
        }

        const statsHtml = statsContent.map(({ label, value }) => `
            <div role="text" class="stats__item">
                <span class="stats__label">${label}:</span>
                <span class="stats__value">${value}</span>
            </div>
        `).join('');

        return `
            <div class="stats__content">${statsHtml}</div>
            <div class="stats__timestamp" 
                 aria-label="Last updated" 
                 role="status">
                Last Updated: ${formatTimestamp(lastUpdated)}
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
            <div class="stats__timestamp">Last Updated: Never</div>
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
        if (!input) return 'Never';

        const date = input instanceof Date ? input : new Date(input);
        if (isNaN(date.getTime())) return 'Never';

        const now = Date.now();
        const diff = now - date.getTime();

        if (diff < 0) return date.toLocaleString(); // Future date
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return 'less than a minute ago';
        if (diff < 86400000) return 'about 1 hour ago';

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