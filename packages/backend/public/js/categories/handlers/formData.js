/**
 * Form data collection and transformation utilities
 * Handles form data gathering and processing for categories
 */

/**
 * Collects and processes form data from the category form
 * @returns {Object} Processed form data object
 */
export function collectFormData() {
    const formData = {
        id: getFormId(),
        name: getFormName(),
        itemLimit: getFormItemLimit()
    };

    return sanitizeFormData(formData);
}

/**
 * Gets the category ID from the form
 * @returns {number|null} The category ID or null if not present
 */
function getFormId() {
    const idElement = document.getElementById('categoryId');
    const id = idElement?.value;
    return id ? parseInt(id) : null;
}

/**
 * Gets the category name from the form
 * @returns {string} The sanitized category name
 */
function getFormName() {
    const nameElement = document.getElementById('categoryName');
    return nameElement?.value?.trim() || '';
}

/**
 * Gets the item limit from the form
 * @returns {number} The parsed item limit
 */
function getFormItemLimit() {
    const limitElement = document.getElementById('categoryItemLimit');
    const limit = parseInt(limitElement?.value);
    return isNaN(limit) ? 0 : limit;
}

/**
 * Sanitizes the form data object
 * @param {Object} data - Raw form data object
 * @returns {Object} Sanitized form data object
 */
function sanitizeFormData(data) {
    return {
        ...data,
        name: sanitizeName(data.name),
        itemLimit: sanitizeLimit(data.itemLimit)
    };
}

/**
 * Sanitizes the category name
 * @param {string} name - Raw category name
 * @returns {string} Sanitized category name
 */
function sanitizeName(name) {
    if (!name) return '';
    
    return name
        .trim()
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Convert to title case
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        // Remove any non-letter characters (except spaces)
        .replace(/[^a-zA-Z\s]/g, '');
}

/**
 * Sanitizes the item limit value
 * @param {number|string} limit - Raw item limit value
 * @returns {number} Sanitized item limit
 */
function sanitizeLimit(limit) {
    const parsed = parseInt(limit);
    if (isNaN(parsed) || parsed < 0) return 0;
    return parsed;
}

/**
 * Checks if the form data is empty
 * @param {Object} data - The form data to check
 * @returns {boolean} True if the form is effectively empty
 */
export function isFormEmpty(data) {
    return !data.name.trim() && !data.itemLimit && !data.id;
}

/**
 * Formats form data for display
 * @param {Object} data - The form data to format
 * @returns {Object} Formatted form data
 */
export function formatFormData(data) {
    return {
        ...data,
        name: data.name || 'Unnamed Category',
        itemLimit: data.itemLimit || 'No Limit',
        id: data.id || 'New'
    };
}