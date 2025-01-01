/**
 * Form validation utilities
 */

const MIN_LENGTH = 3;
const MAX_LENGTH = 36;

/**
 * Validates category name
 * @param {string} name - Category name to validate
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {boolean} True if valid
 */
export function validateName(name, manager) {
    const normalizedName = String(name || '').trim();

    // Check minimum length
    if (normalizedName.length < MIN_LENGTH) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Category name must be at least three characters long',
                'error',
                'category'
            );
        }
        return false;
    }

    // Check maximum length
    if (normalizedName.length > MAX_LENGTH) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Category name cannot exceed 36 characters',
                'error',
                'category'
            );
        }
        return false;
    }

    // Check letter count
    const letterCount = (normalizedName.match(/[a-zA-Z]/g) || []).length;
    if (letterCount < MIN_LENGTH) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Category name must contain at least three letters',
                'error',
                'category'
            );
        }
        return false;
    }

    // Check for special characters
    if (!/^[a-zA-Z\s]+$/.test(normalizedName)) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Category name can only contain letters and spaces',
                'error',
                'category'
            );
        }
        return false;
    }

    // Check for repeated words
    const words = normalizedName.toLowerCase().split(/\s+/);
    if (words.length !== new Set(words).size) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Category name cannot contain repeated words',
                'error',
                'category'
            );
        }
        return false;
    }

    return true;
}

/**
 * Validates item limit against global limit
 * @param {number} itemLimit - Item limit to validate
 * @param {number} globalLimit - Global limit to check against
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {boolean} True if valid
 */
export function validateItemLimit(itemLimit, globalLimit, manager) {
    const numLimit = parseInt(itemLimit, 10);
    
    if (isNaN(numLimit)) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Item limit must be a valid number',
                'error',
                'category'
            );
        }
        return false;
    }

    if (numLimit < 0) {
        if (manager?.showMessage) {
            manager.showMessage(
                'Item limit cannot be negative',
                'error',
                'category'
            );
        }
        return false;
    }

    if (numLimit > globalLimit) {
        if (manager?.showMessage) {
            manager.showMessage(
                `Item limit cannot exceed global limit of ${globalLimit}`,
                'error',
                'category'
            );
        }
        return false;
    }

    return true;
}

/**
 * Validates and formats category name input
 * @param {Event} event - Input event
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {boolean} True if valid
 */
export function validateCategoryName(event, manager) {
    const input = event.target;
    let value = input.value.trim();

    // Check maximum length
    if (value.length > MAX_LENGTH) {
        value = value.slice(0, MAX_LENGTH);
        input.value = value;
        if (manager?.showMessage) {
            manager.showMessage('Input cannot exceed 36 characters', 'warning', 'category');
        }
    }

    // Remove consecutive spaces
    const normalized = value.replace(/\s+/g, ' ');
    if (normalized !== value) {
        input.value = normalized;
        value = normalized;
        if (manager?.showMessage) {
            manager.showMessage('Consecutive spaces detected', 'warning', 'category');
        }
    }

    // Check for repeated words
    const words = value.toLowerCase().split(' ');
    if (words.length !== new Set(words).size) {
        if (manager?.showMessage) {
            manager.showMessage('Category name cannot contain repeated words', 'error', 'category');
        }
        return false;
    }

    // Convert to title case
    input.value = value
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    return true;
}