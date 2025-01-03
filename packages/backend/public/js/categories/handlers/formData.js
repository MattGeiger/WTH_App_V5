/**
 * Form data collection and validation for Categories
 */

/**
 * Normalizes whitespace in a string, converting multiple spaces, tabs, and newlines to single spaces
 * @private
 * @param {string} value - String to normalize
 * @returns {string} Normalized string
 */
function normalizeWhitespace(value) {
    return (value || '').trim().replace(/\s+/g, ' ');
}

/**
 * Safely parses a positive integer, returning null for invalid or non-positive values
 * @private
 * @param {string|number} value - Value to parse
 * @returns {number|null} Parsed number or null if invalid
 */
function parsePositiveInt(value) {
    const parsed = parseInt(value, 10);
    return (!isNaN(parsed) && parsed > 0 && parsed === Number(value)) ? parsed : null;
}

/**
 * Safely parses a non-negative integer, returning 0 for invalid values
 * @private
 * @param {string|number} value - Value to parse
 * @returns {number} Parsed number or 0 if invalid
 */
function parseNonNegativeInt(value) {
    const parsed = parseInt(value, 10);
    return (!isNaN(parsed) && parsed >= 0 && parsed === Number(value)) ? parsed : 0;
}

/**
 * Collects form data from category form using manager
 * @param {Object} manager - Category manager instance with form element references
 * @returns {Object} Collected form data with defaults for missing/invalid values
 */
export function collectFormData(manager) {
    if (!manager) {
        return { id: null, name: '', itemLimit: 0 };
    }

    // Get and normalize name with fallback to empty string
    const name = normalizeWhitespace(manager.nameInput?.value);

    // Get ID with validation for positive integers
    const id = parsePositiveInt(manager.idInput?.value);

    // Get item limit with fallback to 0 for invalid values
    const itemLimit = parseNonNegativeInt(manager.itemLimitSelect?.value);

    return {
        id,
        name,
        itemLimit
    };
}