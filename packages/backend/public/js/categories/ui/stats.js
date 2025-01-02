/**
 * Statistics display management for categories
 */

/**
 * @typedef {Object} Stats
 * @property {number} total - Total number of categories
 * @property {number} withLimits - Number of categories with limits
 * @property {number} noLimits - Number of categories without limits
 * @property {number|null} averageLimit - Average limit value or null
 */

/**
 * Ensures container has required accessibility attributes
 * @private
 * @param {HTMLElement} container - Stats container element
 * @throws {Error} If container is invalid or attributes cannot be set
 */
function ensureAccessibility(container) {
    if (!container || !(container instanceof HTMLElement)) {
        throw new Error('Invalid container element');
    }

    const attributes = {
        'role': 'region',
        'aria-live': 'polite',
        'aria-label': 'Category Statistics'
    };

    Object.entries(attributes).forEach(([attr, value]) => {
        container.setAttribute(attr, value);
    });
}

/**
 * Creates or finds stats container
 * @private
 * @returns {HTMLElement} Stats container element
 * @throws {Error} If container cannot be created or configured
 */
function getStatsContainer() {
    let container = document.getElementById('categoryStats');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'categoryStats';
        container.className = 'stats';
        
        const parent = document.getElementById('tableContainer') || document.body;
        if (!parent) {
            throw new Error('No valid parent element found');
        }
        
        parent.appendChild(container);
    }

    ensureAccessibility(container);
    return container;
}

/**
 * Safely parses numeric values
 * @private
 * @param {*} value - Value to parse
 * @returns {number|null} Parsed number or null
 */
function safeParseInt(value) {
    if (value === null || value === undefined || value === '') return null;

    const num = typeof value === 'number' ? value : Number(String(value).trim());
    return !Number.isNaN(num) && Number.isFinite(num) && num > 0 ? Math.floor(num) : null;
}

/**
 * Calculates statistics from category data
 * @private
 * @param {Array} categories - Category data
 * @returns {Stats} Calculated statistics
 */
function calculateStats(categories) {
    if (!Array.isArray(categories)) {
        return { total: 0, withLimits: 0, noLimits: 0, averageLimit: null };
    }

    const stats = categories.reduce((acc, category) => {
        if (!category || typeof category !== 'object') {
            acc.noLimits++;
            return acc;
        }

        const limit = safeParseInt(category.itemLimit);
        if (limit !== null) {
            acc.withLimits++;
            acc.totalLimit += limit;
        } else {
            acc.noLimits++;
        }
        return acc;
    }, { withLimits: 0, noLimits: 0, totalLimit: 0 });

    return {
        total: stats.withLimits + stats.noLimits,
        withLimits: stats.withLimits,
        noLimits: stats.noLimits,
        averageLimit: stats.withLimits > 0 ? Math.round(stats.totalLimit / stats.withLimits) : null
    };
}

/**
 * Formats timestamp for display
 * @private
 * @param {*} input - Timestamp input
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(input) {
    if (!input) return 'Never';

    let date;
    try {
        date = input instanceof Date ? input : new Date(input);
        if (!date || isNaN(date.getTime()) || date.getTime() <= 0 || date.getTime() >= 8.64e15) {
            return 'Never';
        }
    } catch {
        return 'Never';
    }

    const now = Date.now();
    const diff = now - date.getTime();

    if (diff < 0) return 'Never';
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return 'less than a minute ago';
    if (diff < 86400000) return 'about 1 hour ago';

    try {
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

/**
 * Creates statistics display HTML
 * @private
 * @param {Stats} stats - Statistics data
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {string} Generated HTML
 */
function createStatsDisplay(stats, lastUpdated) {
    const safeStats = {
        total: Math.max(0, stats?.total || 0),
        withLimits: Math.max(0, stats?.withLimits || 0),
        noLimits: Math.max(0, stats?.noLimits || 0),
        averageLimit: stats?.averageLimit !== null && isFinite(stats.averageLimit) 
            ? Math.round(stats.averageLimit) 
            : null
    };

    const items = [
        { label: 'Total Categories', value: safeStats.total },
        { label: 'With Limits', value: safeStats.withLimits },
        { label: 'No Limits', value: safeStats.noLimits }
    ];

    if (safeStats.averageLimit !== null) {
        items.push({ label: 'Average Limit', value: safeStats.averageLimit });
    }

    const statsContent = items
        .map(({ label, value }) => `
            <div role="text" class="stats__item">
                <span class="stats__label">${label}:</span>
                <span class="stats__value">${value}</span>
            </div>
        `).join('');

    return `
        <div class="stats__content">${statsContent}</div>
        <div class="stats__timestamp" role="status" aria-label="Last updated">
            Last Updated: ${formatTimestamp(lastUpdated)}
        </div>
    `.trim();
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
        const stats = calculateStats(categories);
        container.innerHTML = createStatsDisplay(stats, lastUpdated);
        return true;
    } catch (error) {
        console.error('Error updating stats:', error);
        try {
            const errorHtml = `
                <div class="stats__content">
                    <div role="text" class="stats__item stats__item--error">
                        Error calculating statistics
                    </div>
                </div>
                <div class="stats__timestamp" role="status" aria-label="Last updated">
                    Last Updated: Never
                </div>
            `.trim();
            
            const container = document.getElementById('categoryStats');
            if (container) {
                container.innerHTML = errorHtml;
            }
        } catch (e) {
            console.error('Failed to display error state:', e);
        }
        return false;
    }
}