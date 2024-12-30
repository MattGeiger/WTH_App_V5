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
    if (!container) return;

    const stats = calculateStats(categories);
    container.innerHTML = createStatsDisplay(stats, lastUpdated);
}

function calculateStats(categories) {
    if (!Array.isArray(categories)) {
        categories = [];
    }

    const withLimits = categories.filter(cat => cat?.itemLimit > 0);
    const averageLimit = withLimits.length > 0
        ? Math.round(withLimits.reduce((sum, cat) => sum + cat.itemLimit, 0) / withLimits.length)
        : 0;

    return {
        total: categories.length,
        withLimits: withLimits.length,
        noLimits: categories.length - withLimits.length,
        averageLimit: withLimits.length > 0 ? averageLimit : null
    };
}

function createStatsDisplay(stats, lastUpdated) {
    const statsContent = [
        `Total Categories: ${stats.total}`,
        `With Limits: ${stats.withLimits}`,
        `No Limits: ${stats.noLimits}`
    ];

    if (stats.averageLimit !== null) {
        statsContent.push(`Average Limit: ${stats.averageLimit}`);
    }

    return `
        <div class="stats__content">
            ${statsContent.map(text => `
                <div role="text" class="stats__item">
                    <span class="stats__label">${text.split(':')[0]}:</span>
                    <span class="stats__value">${text.split(':')[1].trim()}</span>
                </div>
            `).join('')}
        </div>
        <div class="stats__timestamp" aria-label="Last updated">
            Last Updated: ${formatTimestamp(lastUpdated)}
        </div>
    `.trim().replace(/\s+/g, ' ');
}

function formatTimestamp(date) {
    if (!date || !(date instanceof Date) || isNaN(date)) {
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