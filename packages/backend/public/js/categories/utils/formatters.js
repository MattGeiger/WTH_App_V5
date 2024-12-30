/**
 * Data formatting utilities
 * Provides consistent formatting functions for the categories module
 */

/**
 * Formats an item limit for display
 * @param {number|string} limit - The limit value to format
 * @returns {string} Formatted limit string
 */
export function formatLimit(limit) {
    const limitNum = parseInt(limit);
    return isNaN(limitNum) || limitNum === 0 ? 'No Limit' : limitNum.toString();
}

/**
 * Formats a category name for display
 * @param {string} name - The name to format
 * @returns {string} Formatted name string
 */
export function formatName(name) {
    if (!name) return '';
    
    return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Formats a date for the table display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatTableDate(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Formats a timestamp for relative time display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted relative time string
 */
export function formatRelativeTime(date) {
    if (!date) return 'Never';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diff = now - dateObj;
    
    // Within the last minute
    if (diff < 60000) {
        return 'Just now';
    }
    
    // Within the last hour
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }
    
    // Within the last day
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // Over a day ago
    return formatTableDate(date);
}

/**
 * Formats statistics for display
 * @param {number} value - The value to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted statistics string
 */
export function formatStatistic(value, options = {}) {
    const {
        prefix = '',
        suffix = '',
        defaultValue = '0',
        decimals = 0
    } = options;

    if (typeof value !== 'number' || isNaN(value)) {
        return `${prefix}${defaultValue}${suffix}`;
    }

    const formatted = decimals > 0 
        ? value.toFixed(decimals)
        : Math.round(value).toString();

    return `${prefix}${formatted}${suffix}`;
}

/**
 * Formats a category for API submission
 * @param {Object} category - The category data to format
 * @returns {Object} Formatted category object
 */
export function formatForSubmission(category) {
    return {
        name: formatName(category.name),
        itemLimit: parseInt(category.itemLimit) || 0,
        ...(category.id && { id: parseInt(category.id) })
    };
}

/**
 * Creates a display name for a category
 * @param {Object} category - The category object
 * @returns {string} Display name string
 */
export function createDisplayName(category) {
    const { name, itemLimit } = category;
    const formattedLimit = formatLimit(itemLimit);
    return `${formatName(name)} (${formattedLimit})`;
}