/**
 * Statistics display management for categories
 */

/**
 * Validates DOM container accessibility attributes
 * @private
 * @param {HTMLElement} container - Stats container element
 */
function validateContainer(container) {
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
 * Updates statistics display
 * @param {Array} categories - Category data
 * @param {Date} lastUpdated - Last update timestamp
 */
export function updateStats(categories = [], lastUpdated = null) {
    try {
        // Find or create container
        let container = document.getElementById('categoryStats');
        if (!container) {
            container = document.createElement('div');
            container.id = 'categoryStats';
            container.className = 'stats';
            document.body.appendChild(container);
            console.warn('Created missing stats container');
        }

        // Ensure container has proper accessibility attributes
        validateContainer(container);

        // Calculate and display stats
        const stats = calculateStats(categories);
        container.innerHTML = createStatsDisplay(stats, lastUpdated);

        // Return success for testability
        return true;
    } catch (error) {
        console.error('Error updating stats:', error);
        return false;
    }
}

/**
 * Calculates statistics from category data
 * @private
 * @param {Array} categories - Category data
 * @returns {Object} Calculated statistics
 */
function calculateStats(categories) {
    try {
        // Ensure categories is an array and handle malformed data
        if (!Array.isArray(categories)) {
            categories = [];
        }

        // Filter valid categories with positive limits
        const withLimits = categories.filter(cat => {
            try {
                if (!cat || typeof cat !== 'object') return false;
                const limit = parseInt(cat?.itemLimit, 10);
                return !isNaN(limit) && Number.isFinite(limit) && limit > 0;
            } catch {
                return false;
            }
        });

        // Calculate average if we have valid limits
        let averageLimit = null;
        if (withLimits.length > 0) {
            const total = withLimits.reduce((sum, cat) => {
                try {
                    const limit = parseInt(cat.itemLimit, 10);
                    return sum + (isNaN(limit) ? 0 : limit);
                } catch {
                    return sum;
                }
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
        return {
            total: 0,
            withLimits: 0,
            noLimits: 0,
            averageLimit: null
        };
    }
}

/**
 * Creates HTML display for statistics
 * @private
 * @param {Object} stats - Calculated statistics
 * @param {Date} lastUpdated - Last update timestamp
 * @returns {string} HTML content
 */
function createStatsDisplay(stats = {}, lastUpdated = null) {
    try {
        // Ensure stats has all required properties
        const safeStats = {
            total: parseInt(stats?.total, 10) || 0,
            withLimits: parseInt(stats?.withLimits, 10) || 0,
            noLimits: parseInt(stats?.noLimits, 10) || 0,
            averageLimit: stats?.averageLimit
        };

        const statsContent = [
            {
                label: 'Total Categories',
                value: safeStats.total.toString()
            },
            {
                label: 'With Limits',
                value: safeStats.withLimits.toString()
            },
            {
                label: 'No Limits',
                value: safeStats.noLimits.toString()
            }
        ];

        if (safeStats.averageLimit !== null && 
            !isNaN(safeStats.averageLimit) && 
            Number.isFinite(safeStats.averageLimit)) {
            statsContent.push({
                label: 'Average Limit',
                value: Math.round(safeStats.averageLimit).toString()
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
    } catch (error) {
        console.error('Error creating stats display:', error);
        return `
            <div class="stats__content">
                <div role="text" class="stats__item stats__item--error">
                    <span class="stats__label">Error:</span>
                    <span class="stats__value">Failed to display statistics</span>
                </div>
            </div>
        `.trim();
    }
}

/**
 * Formats timestamp for display
 * @private
 * @param {Date} date - Date to format
 * @returns {string} Formatted timestamp
 */
function formatTimestamp(date) {
    try {
        if (!date) return 'Never';
        
        // Handle non-Date inputs
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return 'Never';

        const diff = Date.now() - dateObj.getTime();
        
        if (diff < 0) return dateObj.toLocaleString(); // Future date
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return 'less than a minute ago';
        if (diff < 86400000) return 'about 1 hour ago';
        
        return dateObj.toLocaleString(undefined, {
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