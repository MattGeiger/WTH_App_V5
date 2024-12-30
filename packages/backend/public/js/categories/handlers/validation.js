/**
 * Validation handlers for category management
 */

const MIN_LENGTH = 3;
const MAX_LENGTH = 36;
const NAME_REGEX = /^[A-Za-z\s]+$/;

/**
 * Validates a category name
 * @param {string} name - Name to validate
 * @param {Object} manager - Category manager instance
 * @returns {boolean} - Whether name is valid
 */
export function validateName(name, manager) {
    // First trim and normalize input
    const normalizedName = name.trim().replace(/\s+/g, ' ');
    
    // Check minimum length
    if (normalizedName.length < MIN_LENGTH) {
        manager.showMessage(
            'Category name must be at least three characters long',
            'error',
            'category'
        );
        return false;
    }

    // Check maximum length
    if (normalizedName.length > MAX_LENGTH) {
        manager.showMessage(
            'Category name cannot exceed 36 characters',
            'error',
            'category'
        );
        return false;
    }

    // Count actual letters (excluding spaces)
    const letterCount = normalizedName.replace(/[^A-Za-z]/g, '').length;
    if (letterCount < MIN_LENGTH) {
        manager.showMessage(
            'Category name must contain at least three letters',
            'error',
            'category'
        );
        return false;
    }

    // Check for valid characters
    if (!NAME_REGEX.test(normalizedName)) {
        manager.showMessage(
            'Category name can only contain letters and spaces',
            'error',
            'category'
        );
        return false;
    }

    // Check for repeated words
    const words = normalizedName.toLowerCase().split(' ');
    if (new Set(words).size !== words.length) {
        manager.showMessage(
            'Category name cannot contain repeated words',
            'error',
            'category'
        );
        return false;
    }

    return true;
}

/**
 * Validates category name from input event
 * @param {Event} event - Input event
 * @param {Object} manager - Category manager instance
 */
export function validateCategoryName(event, manager) {
    const input = event.target;
    let value = input.value;

    // Trim and normalize spaces
    value = value.trim().replace(/\s+/g, ' ');

    // Enforce maximum length
    if (value.length > MAX_LENGTH) {
        value = value.substring(0, MAX_LENGTH);
    }

    // Convert to title case
    value = value.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

    // Update input value
    input.value = value;

    // Validate the normalized value
    validateName(value, manager);
}

/**
 * Validates item limit
 * @param {number|string} limit - Limit to validate
 * @param {number} globalLimit - Global upper limit
 * @param {Object} manager - Category manager instance
 * @returns {boolean} - Whether limit is valid
 */
export function validateItemLimit(limit, globalLimit, manager) {
    const numLimit = parseInt(limit, 10);

    if (isNaN(numLimit)) {
        manager.showMessage(
            'Item limit must be a valid number',
            'error',
            'category'
        );
        return false;
    }

    if (numLimit < 0) {
        manager.showMessage(
            'Item limit cannot be negative',
            'error',
            'category'
        );
        return false;
    }

    if (numLimit > globalLimit) {
        manager.showMessage(
            `Item limit cannot exceed global limit of ${globalLimit}`,
            'error',
            'category'
        );
        return false;
    }

    return true;
}