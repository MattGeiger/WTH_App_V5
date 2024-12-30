/**
 * Formatting utilities for category data
 */

export function formatLimit(value) {
    const limit = parseInt(value, 10);
    return limit <= 0 ? 'No Limit' : limit.toString();
}

export function formatName(value) {
    if (!value || typeof value !== 'string') return '';
    return value.trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

export function formatTableDate(value) {
    try {
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString();
    } catch {
        return '';
    }
}

export function formatRelativeTime(value) {
    if (!value) return '';
    
    const date = value instanceof Date ? value : new Date(value);
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

export function formatStatistic(value, { decimals = 0, type = 'number' } = {}) {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    switch (type) {
        case 'percent':
            return value.toFixed(decimals) + '%';
        case 'decimal':
            return value.toFixed(decimals);
        default:
            return Math.round(value).toString();
    }
}

export function formatForSubmission(data) {
    return {
        id: data.id ? parseInt(data.id, 10) : null,
        name: formatName(data.name),
        itemLimit: parseInt(data.itemLimit, 10)
    };
}

export function createDisplayName(category) {
    if (!category?.name) return '';
    return category.itemLimit > 0 
        ? `${category.name} (Limit: ${category.itemLimit})`
        : `${category.name} (No Limit)`;
}