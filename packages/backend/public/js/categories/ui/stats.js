/**
 * Statistics display management for categories
 */

/**
 * Updates statistics display
 * @param {Array} categories - Category data
 * @param {Date} lastUpdated - Last update timestamp
 */
export function updateStats(categories = [], lastUpdated = null) {
    const container = document.getElementById('categoryStats');
    if (!container) {
        console.warn('Category stats container not found');
        return;
    }

    const stats = calculateStats(categories);
    container.innerHTML = createStatsDisplay(stats, lastUpdated);
}

/**
 * Calculates statistics from category data
 * @private
 * @param {Array} categories - Category data
 * @returns {Object} Calculated statistics
 */
function calculateStats(categories) {
    // Ensure categories is an array and handle malformed data
    if (!Array.isArray(categories)) {
        categories = [];
    }

    // Filter valid categories with positive limits
    const withLimits = categories.filter(cat => {
        const limit = parseInt(cat?.itemLimit, 10);
        return !isNaN(limit) && limit > 0;
    });

    // Calculate average if we have valid limits
    let averageLimit = null;
    if (withLimits.length > 0) {
        const total = withLimits.reduce((sum, cat) => {
            const limit = parseInt(cat.itemLimit, 10);
            return sum + (isNaN(limit) ? 0 : limit);
        }, 0);
        averageLimit = Math.round(total / withLimits.length);
    }

    return {
        total: categories.length,
        withLimits: withLimits.length,
        noLimits: categories.length - withLimits.length,
        averageLimit
    };
}

/**
 * Creates HTML display for statistics
 * @private
 * @param {Object} stats - Calculated statistics
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {string} HTML content
 */
function createStatsDisplay(stats, lastUpdated) {
    const statsContent = [
        {
            label: 'Total Categories',
            value: stats.total.toString()
        },
        {
            label: 'With Limits',
            value: stats.withLimits.toString()
        },
        {
            label: 'No Limits',
            value: stats.noLimits.toString()
        }
    ];

    if (stats.averageLimit !== null) {
        statsContent.push({
            label: 'Average Limit',
            value: stats.averageLimit.toString()
        });
    }

    return `
        <div class="stats__content">
            ${statsContent.map(item => `
                <div role="text" class="stats__item">
                    <span class="stats__label">${item.label}:</span>
                    <span class="stats__value">${item.value}</span>
                </div>
            `).join('')}
        </div>
        <div class="stats__timestamp" 
             aria-label="Last updated"
             role="status">
            Last Updated: ${formatTimestamp(lastUpdated)}
        </div>
    `.trim().replace(/\s+/g, ' ');
}

/**
 * Formats timestamp for display
 * @private
 * @param {Date} date - Date to format
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return 'Never';
    }

    const diff = Date.now() - date.getTime();
    
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
}