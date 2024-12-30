/**
 * Category validation handlers
 */

const MIN_LENGTH = 3;
const MAX_LENGTH = 36;
const NAME_REGEX = /^[A-Za-z\s]+$/;

/**
 * Validates category name input
 * @param {Event} event - Input event
 * @param {Object} manager - Category manager instance
 */
export function validateCategoryName(event, manager) {
    const input = event.target;
    const value = input.value.trim();
    
    // Remove consecutive spaces
    input.value = value.replace(/\s+/g, ' ');
    
    // Convert to title case
    input.value = value.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
        
    validateName(input.value, manager);
}

/**
 * Validates category name
 * @param {string} name - Category name to validate
 * @param {Object} manager - Category manager instance
 * @returns {boolean} Validation result
 */
export function validateName(name, manager) {
    if (name.length < MIN_LENGTH) {
        manager.showMessage('Category name must be at least three characters long', 'error', 'category');
        return false;
    }
    
    if (name.length > MAX_LENGTH) {
        manager.showMessage('Category name cannot exceed 36 characters', 'error', 'category');
        return false;
    }
    
    if (!NAME_REGEX.test(name)) {
        manager.showMessage('Category name can only contain letters and spaces', 'error', 'category');
        return false;
    }
    
    const words = name.toLowerCase().split(' ');
    if (new Set(words).size !== words.length) {
        manager.showMessage('Category name cannot contain repeated words', 'error', 'category');
        return false;
    }
    
    const letterCount = name.replace(/[^A-Za-z]/g, '').length;
    if (letterCount < MIN_LENGTH) {
        manager.showMessage('Category name must contain at least three letters', 'error', 'category');
        return false;
    }
    
    return true;
}

/**
 * Validates item limit input
 * @param {string|number} limit - Item limit to validate
 * @param {number} globalLimit - Global upper limit
 * @param {Object} manager - Category manager instance
 * @returns {boolean} Validation result
 */
export function validateItemLimit(limit, globalLimit, manager) {
    const numLimit = parseInt(limit, 10);
    
    if (numLimit < 0) {
        manager.showMessage('Item limit cannot be negative', 'error', 'category');
        return false;
    }
    
    if (isNaN(numLimit)) {
        manager.showMessage('Item limit must be a valid number', 'error', 'category');
        return false;
    }
    
    if (numLimit > globalLimit) {
        manager.showMessage(`Item limit cannot exceed global limit of ${globalLimit}`, 'error', 'category');
        return false;
    }
    
    return true;
}