/**
 * Statistics display management
 * Handles calculation and display of category statistics
 */

/**
 * Updates the statistics display
 * @param {Array} categories - Array of category objects
 * @param {Date} lastUpdated - Last update timestamp
 */
export function updateStats(categories, lastUpdated) {
    const container = getStatsContainer();
    if (!container) return;

    const stats = calculateStats(categories);
    container.innerHTML = createStatsDisplay(stats, lastUpdated);
}

/**
 * Gets or creates the stats container
 * @returns {HTMLElement} The stats container element
 */
function getStatsContainer() {
    const existing = document.getElementById('categoryStats');
    if (existing) return existing;

    const container = document.createElement('div');
    container.id = 'categoryStats';
    container.className = 'stats';
    container.setAttribute('role', 'region');
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-label', 'Category Statistics');
    
    return container;
}

/**
 * Calculates category statistics
 * @param {Array} categories - Array of category objects
 * @returns {Object} Calculated statistics
 */
function calculateStats(categories) {
    if (!Array.isArray(categories)) {
        return {
            total: 0,
            limited: 0,
            unlimited: 0,
            averageLimit: 0
        };
    }

    const limited = categories.filter(cat => cat.itemLimit > 0);
    const averageLimit = limited.length > 0
        ? Math.round(limited.reduce((sum, cat) => sum + cat.itemLimit, 0) / limited.length)
        : 0;

    return {
        total: categories.length,
        limited: limited.length,
        unlimited: categories.length - limited.length,
        averageLimit
    };
}

/**
 * Creates the statistics display HTML
 * @param {Object} stats - Calculated statistics
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {string} HTML string for stats display
 */
function createStatsDisplay(stats, lastUpdated) {
    return `
        <div class="stats__content">
            <div role="text" class="stats__item">
                <span class="stats__label">Total Categories:</span>
                <span class="stats__value">${stats.total}</span>
            </div>
            <div role="text" class="stats__item">
                <span class="stats__label">With Limits:</span>
                <span class="stats__value">${stats.limited}</span>
            </div>
            <div role="text" class="stats__item">
                <span class="stats__label">No Limits:</span>
                <span class="stats__value">${stats.unlimited}</span>
            </div>
            ${stats.limited > 0 ? `
                <div role="text" class="stats__item">
                    <span class="stats__label">Average Limit:</span>
                    <span class="stats__value">${stats.averageLimit}</span>
                </div>
            ` : ''}
        </div>
        ${lastUpdated ? `
            <div class="stats__timestamp" aria-label="Last updated">
                Last Updated: ${formatTimestamp(lastUpdated)}
            </div>
        ` : ''}
    `;
}

/**
 * Formats a timestamp for display
 * @param {Date} date - Date object to format
 * @returns {string} Formatted timestamp string
 */
function formatTimestamp(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        return 'Never';
    }

    const now = new Date();
    const diff = now - date;
    
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