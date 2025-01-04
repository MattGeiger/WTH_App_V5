/**
 * Form validation utilities
 */

const MIN_LENGTH = 3;
const MAX_LENGTH = 36;

/**
 * Validates a string contains only letters and optional spaces
 * @private
 * @param {string} str - String to validate
 * @returns {boolean} True if valid
 */
function isLettersAndSpacesOnly(str) {
    return /^[a-zA-Z\s]+$/.test(str);
}

/**
 * Checks for word repetition
 * @private
 * @param {string} str - String to check
 * @returns {boolean} True if no repetition
 */
function hasNoRepeatedWords(str) {
    const words = str.toLowerCase().split(/\s+/).filter(Boolean);
    return words.length === new Set(words).size;
}

/**
 * Counts letters in a string
 * @private
 * @param {string} str - String to count letters in
 * @returns {number} Letter count
 */
function countLetters(str) {
    return (str.match(/[a-zA-Z]/g) || []).length;
}

/**
 * Converts string to title case
 * @private
 * @param {string} str - String to convert
 * @returns {string} Title cased string
 */
function toTitleCase(str) {
    return str.split(/\s+/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
}

/**
 * Handles input transformation for category name
 * @param {HTMLInputElement} input - Input element to handle
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {string} Transformed value
 */
export function handleNameInput(input, manager) {
    // Handle non-string values
    if (!input?.value || typeof input.value !== 'string') {
        return '';
    }

    let value = input.value.trim();

    // Handle empty or whitespace input
    if (!value) {
        return '';
    }

    // Check maximum length
    if (value.length > MAX_LENGTH) {
        value = value.slice(0, MAX_LENGTH);
        manager?.showMessage?.(
            'Input cannot exceed 36 characters',
            'warning',
            'category'
        );
    }

    // Remove consecutive spaces
    const normalized = value.replace(/\s+/g, ' ');
    if (normalized !== value) {
        manager?.showMessage?.(
            'Consecutive spaces detected',
            'warning',
            'category'
        );
        value = normalized;
    }

    // Check for repeated words
    const words = value.toLowerCase().split(' ').filter(Boolean);
    if (words.length !== new Set(words).size) {
        manager?.showMessage?.(
            'Category name cannot contain repeated words',
            'error',
            'category'
        );
    }

    // Convert to title case
    return toTitleCase(value);
}

/**
 * Validates category name
 * @param {string} name - Category name to validate
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {boolean} True if valid
 */
export function validateName(name, manager) {
    try {
        const normalizedName = String(name || '').trim();

        // Check minimum length
        if (normalizedName.length < MIN_LENGTH) {
            manager?.showMessage?.(
                'Category name must be at least three characters long',
                'error',
                'category'
            );
            return false;
        }

        // Check maximum length
        if (normalizedName.length > MAX_LENGTH) {
            manager?.showMessage?.(
                'Category name cannot exceed 36 characters',
                'error',
                'category'
            );
            return false;
        }

        // Check letter count
        if (countLetters(normalizedName) < MIN_LENGTH) {
            manager?.showMessage?.(
                'Category name must contain at least three letters',
                'error',
                'category'
            );
            return false;
        }

        // Check for special characters
        if (!isLettersAndSpacesOnly(normalizedName)) {
            manager?.showMessage?.(
                'Category name can only contain letters and spaces',
                'error',
                'category'
            );
            return false;
        }

        // Check for repeated words
        if (!hasNoRepeatedWords(normalizedName)) {
            manager?.showMessage?.(
                'Category name cannot contain repeated words',
                'error',
                'category'
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating category name:', error);
        manager?.showMessage?.(
            'Error validating category name',
            'error',
            'category'
        );
        return false;
    }
}

/**
 * Validates item limit against global limit
 * @param {number|string} itemLimit - Item limit to validate
 * @param {number} globalLimit - Global limit to check against
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {boolean} True if valid
 */
export function validateItemLimit(itemLimit, globalLimit, manager) {
    try {
        // Handle string inputs that might be negative
        if (typeof itemLimit === 'string') {
            const trimmed = itemLimit.trim();
            if (trimmed.startsWith('-') || trimmed === '-0') {
                manager?.showMessage?.(
                    'Item limit cannot be negative',
                    'error',
                    'category'
                );
                return false;
            }
        }

        // Handle number inputs that might be negative
        if (typeof itemLimit === 'number' && itemLimit < 0) {
            manager?.showMessage?.(
                'Item limit cannot be negative',
                'error',
                'category'
            );
            return false;
        }

        const numLimit = parseInt(itemLimit, 10);
        const numGlobalLimit = parseInt(globalLimit, 10);
        
        // Check for valid numbers
        if (isNaN(numLimit) || !Number.isFinite(numLimit) || 
            isNaN(numGlobalLimit) || !Number.isFinite(numGlobalLimit)) {
            manager?.showMessage?.(
                'Item limit must be a valid number',
                'error',
                'category'
            );
            return false;
        }

        // Check against global limit
        if (numLimit > numGlobalLimit) {
            manager?.showMessage?.(
                `Item limit cannot exceed global limit of ${numGlobalLimit}`,
                'error',
                'category'
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validating item limit:', error);
        manager?.showMessage?.(
            'Error validating item limit',
            'error',
            'category'
        );
        return false;
    }
}

/**
 * Validates and formats category name input
 * @param {Event} event - Input event
 * @param {Object} [manager] - Category manager instance for showing messages
 * @returns {boolean} True if valid
 */
export function validateCategoryName(event, manager) {
    try {
        if (!event?.target) {
            manager?.showMessage?.(
                'Invalid input element',
                'error',
                'category'
            );
            return false;
        }

        // Handle input transformation
        const transformedValue = handleNameInput(event.target, manager);
        event.target.value = transformedValue;

        return true;
    } catch (error) {
        console.error('Error validating category name input:', error);
        manager?.showMessage?.(
            'Error validating input',
            'error',
            'category'
        );
        return false;
    }
}