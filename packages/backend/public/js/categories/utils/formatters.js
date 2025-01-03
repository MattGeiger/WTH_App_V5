/**
 * Formatting utilities for category data
 */

/**
 * Formats item limit display
 * @param {number|string} value - The limit value
 * @returns {string} Formatted limit
 */
export function formatLimit(value) {
    if (!value || typeof value === 'boolean' || typeof value === 'object') {
        return 'No Limit';
    }

    // Check if the string contains only digits
    if (typeof value === 'string' && !/^\d+$/.test(value)) {
        return 'No Limit';
    }

    const limit = parseInt(value, 10);
    if (!Number.isFinite(limit) || limit <= 0) {
        return 'No Limit';
    }

    return String(limit);
}

/**
 * Formats name in title case
 * @param {string} value - The name to format
 * @returns {string} Formatted name
 */
export function formatName(value) {
    if (!value || typeof value !== 'string') {
        return '';
    }

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
    if (!value) {
        return '';
    }

    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'function') {
        return '';
    }

    if (typeof value === 'object' && !(value instanceof Date)) {
        return '';
    }

    try {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            return '';
        }
        
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
    if (!value) {
        return 'Never';
    }

    // Handle primitive types that shouldn't be converted to dates
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'function') {
        return 'Invalid date';
    }

    try {
        // Try to detect objects that aren't dates before conversion
        if (typeof value === 'object') {
            if (!(value instanceof Date)) {
                try {
                    // Test if object can be converted to string without throwing
                    String(value);
                } catch {
                    return 'Never';
                }
                return 'Invalid date';
            }
        }

        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            return 'Invalid date';
        }
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return 'Just now';
        }
        
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
 * @param {number|string|boolean} value - The value to format
 * @param {Object} [options] - Formatting options
 * @param {number} [options.decimals=0] - Number of decimal places
 * @param {string} [options.prefix=''] - Prefix to add
 * @param {string} [options.suffix=''] - Suffix to add
 * @returns {string} Formatted statistic
 */
export function formatStatistic(value, options = {}) {
    // Handle booleans and invalid inputs
    if (typeof value === 'boolean' || value === null || value === undefined) {
        return '0';
    }

    const numValue = Number(value);
    if (!Number.isFinite(numValue)) {
        return '0';
    }

    const decimals = Number.isFinite(options?.decimals) ? Math.max(0, options.decimals) : 0;
    const prefix = typeof options?.prefix === 'string' ? options.prefix : '';
    const suffix = typeof options?.suffix === 'string' ? options.suffix : '';
    
    const formatted = decimals > 0 
        ? numValue.toFixed(decimals)
        : Math.round(numValue).toString();
    
    return `${prefix}${formatted}${suffix}`;
}

/**
 * Formats category data for API submission
 * @param {Object} data - The category data
 * @returns {Object|null} Formatted data
 */
export function formatForSubmission(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
    }

    const formatted = {
        name: formatName(data.name || ''),
        itemLimit: parseInt(data.itemLimit || 0, 10)
    };
    
    if (data.id) {
        const id = parseInt(data.id, 10);
        if (Number.isFinite(id)) {
            formatted.id = id;
        }
    }
    
    return formatted;
}

/**
 * Creates display name with limit
 * @param {Object} category - The category object
 * @returns {string} Display name
 */
export function createDisplayName(category) {
    if (!category?.name) {
        return '';
    }

    const limit = parseInt(category.itemLimit || 0, 10);
    return `${category.name} (${Number.isFinite(limit) && limit > 0 ? limit : 'No Limit'})`;
}