/**
 * Formatting utilities for category data
 */

/**
 * Formats item limit display
 * @param {number|string} value - The limit value
 * @returns {string} Formatted limit
 */
export function formatLimit(value) {
    if (value === null || value === undefined || value === '') return 'No Limit';
    const limit = parseInt(value, 10);
    return isNaN(limit) || limit <= 0 ? 'No Limit' : limit.toString();
}

/**
 * Formats name in title case
 * @param {string} value - The name to format
 * @returns {string} Formatted name
 */
export function formatName(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Formats date for table display
 * @param {Date|string} value - The date to format
 * @returns {string} Formatted date
 */
export function formatTableDate(value) {
    if (!value) return '';
    try {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return '';
        
        // Use UTC methods to avoid timezone issues
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        
        return `${month}/${day}/${year}`;
    } catch {
        return '';
    }
}

/**
 * Formats relative time
 * @param {Date|string} value - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(value) {
    if (!value) return 'Never';
    
    try {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        }
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        }
        
        return formatTableDate(date);
    } catch {
        return 'Never';
    }
}

/**
 * Formats numeric statistics
 * @param {number} value - The value to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted statistic
 */
export function formatStatistic(value, { decimals = 0, prefix = '', suffix = '' } = {}) {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    const formatted = decimals > 0 
        ? value.toFixed(decimals)
        : Math.round(value).toString();
    
    return `${prefix}${formatted}${suffix}`;
}

/**
 * Formats category data for API submission
 * @param {Object} data - The category data
 * @returns {Object} Formatted data
 */
export function formatForSubmission(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const { id, name, itemLimit } = data;
    const formatted = {
        name: formatName(name || ''),
        itemLimit: parseInt(itemLimit || 0, 10)
    };
    
    if (id) {
        formatted.id = parseInt(id, 10);
    }
    
    return formatted;
}

/**
 * Creates display name with limit
 * @param {Object} category - The category object
 * @returns {string} Display name
 */
export function createDisplayName(category) {
    if (!category || !category.name) return '';
    const limit = category.itemLimit ?? 0;
    return `${category.name} (${limit > 0 ? limit : 'No Limit'})`;
}