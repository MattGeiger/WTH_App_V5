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
 * @returns {boolean} Success indicator
 */
function ensureAccessibility(container) {
    if (!container || !(container instanceof HTMLElement)) {
        console.error('Error getting stats container:', new Error('Invalid container element'));
        return false;
    }

    try {
        container.setAttribute('role', 'region');
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-label', 'Category Statistics');
        return true;
    } catch (error) {
        console.error('Error getting stats container:', error);
        return false;
    }
}

/**
 * Creates or finds stats container
 * @private
 * @returns {HTMLElement|null} Stats container element or null
 */
function getStatsContainer() {
    try {
        let container = document.getElementById('categoryStats');
        
        // Create container if it doesn't exist
        if (!container) {
            container = document.createElement('div');
            container.id = 'categoryStats';
            container.className = 'stats';

            // Find parent or use body as fallback
            const parent = document.getElementById('tableContainer') || document.body;
            if (!parent) {
                throw new Error('No valid parent element found');
            }
            parent.appendChild(container);
        }

        // Always ensure accessibility attributes
        if (!ensureAccessibility(container)) {
            throw new Error('Failed to set accessibility attributes');
        }

        return container;
    } catch (error) {
        console.error('Error getting stats container:', error);
        return null;
    }
}

/**
 * Safely parses numeric values
 * @private
 * @param {*} value - Value to parse
 * @returns {number|null} Parsed number or null
 */
function safeParseInt(value) {
    // Empty/null/undefined
    if (value === null || value === undefined || value === '') {
        return null;
    }

    // Handle strings (including something like '10abc')
    if (typeof value === 'string') {
        const trimmed = value.trim();
        const num = parseInt(trimmed, 10);
        return (isNaN(num) || num <= 0) ? null : num;
    }

    // Handle actual numbers
    if (typeof value === 'number' && isFinite(value) && value > 0) {
        return Math.floor(value);
    }

    return null;
}

/**
 * Calculates statistics from category data
 * @private
 * @param {Array} categories - Category data
 * @returns {Stats} Calculated statistics
 */
function calculateStats(categories) {
    // Handle non-array input
    if (!Array.isArray(categories)) {
        return { total: 0, withLimits: 0, noLimits: 0, averageLimit: null };
    }

    // Initialize stats
    const stats = {
        total: categories.length,
        withLimits: 0,
        totalLimit: 0
    };

    // Process each category
    categories.forEach(category => {
        if (category && typeof category === 'object') {
            const limit = safeParseInt(category.itemLimit);
            if (limit !== null) {
                stats.withLimits++;
                stats.totalLimit += limit;
            }
        }
    });

    // Calculate final stats
    return {
        total: stats.total,
        withLimits: stats.withLimits,
        noLimits: stats.total - stats.withLimits,
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
    // First check for obviously invalid inputs
    if (input === null || input === undefined || 
        typeof input === 'boolean' || typeof input === 'symbol' ||
        (typeof input === 'object' && !(input instanceof Date))) {
        return 'Never';
    }

    // Then try to create a Date
    let date;
    try {
        date = input instanceof Date ? input : new Date(input);
        
        // Check for invalid dates
        if (isNaN(date.getTime()) || date.getTime() <= 0 || date.getTime() >= 8.64e15) {
            return 'Never';
        }

        // Check for toLocaleString availability before any other operations
        try {
            const formatted = date.toLocaleString();
            if (!formatted) return 'Never';

            // Only after valid toLocaleString, check times
            const now = Date.now();
            const diff = now - date.getTime();

            if (diff < 0) return 'Never';
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
        } catch (formatError) {
            console.error('Error formatting timestamp:', formatError);
            return 'Never';
        }
    } catch (error) {
        return 'Never';
    }
}

/**
 * Creates error state HTML
 * @private
 * @returns {string} Error state HTML
 */
function createErrorDisplay() {
    return `
        <div class="stats__content">
            <div role="text" class="stats__item stats__item--error">
                Error calculating statistics
            </div>
        </div>
        <div class="stats__timestamp" role="status" aria-label="Last updated">
            Last Updated: Never
        </div>
    `.trim();
}

/**
 * Creates statistics display HTML
 * @private
 * @param {Stats} stats - Statistics data
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {string} Generated HTML
 */
function createStatsDisplay(stats = {}, lastUpdated = null) {
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
        .map(({ label, value }) => `<div role="text" class="stats__item"><span class="stats__label">${label}: </span><span class="stats__value">${value}</span></div>`
        ).join('');

    return `<div class="stats__content">${statsContent}</div><div class="stats__timestamp" role="status" aria-label="Last updated">Last Updated: ${formatTimestamp(lastUpdated)}</div>`;
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
            // In case of container creation failure, try to find stats__content
            const errorContainer = document.querySelector('.stats__content');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div role="text" class="stats__item stats__item--error">
                        Error calculating statistics
                    </div>
                `;
            }
            return false;
        }

        const stats = calculateStats(categories);
        container.innerHTML = createStatsDisplay(stats, lastUpdated);
        return true;
    } catch (error) {
        console.error('Error updating stats:', error);
        
        try {
            const errorContainer = document.querySelector('.stats__content');
            if (errorContainer) {
                errorContainer.innerHTML = `
                    <div role="text" class="stats__item stats__item--error">
                        Error calculating statistics
                    </div>
                `;
            }
        } catch {}
        return false;
    }
}