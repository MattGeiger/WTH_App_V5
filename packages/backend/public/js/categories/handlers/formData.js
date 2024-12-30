/**
 * Form data collection and formatting
 */

/**
 * Collects form data from category form
 * @returns {Object} Collected form data
 */
export function collectFormData() {
    const form = document.getElementById('categoryForm');
    if (!form) return null;

    const data = {
        id: parseInt(document.getElementById('categoryId').value, 10) || null,
        name: document.getElementById('categoryName').value.trim(),
        itemLimit: parseInt(document.getElementById('itemLimit').value, 10) || 0
    };

    return isFormEmpty(data) ? null : data;
}

/**
 * Checks if form data is empty
 * @param {Object} data - Form data to check
 * @returns {boolean} True if empty
 */
export function isFormEmpty(data) {
    if (!data || typeof data !== 'object') return true;
    return !data.name?.trim() && !data.itemLimit && !data.id;
}

/**
 * Formats form data for submission
 * @param {Object} data - Data to format
 * @returns {Object} Formatted data
 */
export function formatFormData(data) {
    if (!data || typeof data !== 'object') {
        return { name: '', itemLimit: 0, id: null };
    }

    return {
        name: data.name?.trim() || '',
        itemLimit: data.itemLimit || 0,
        id: data.id ? parseInt(data.id, 10) : null,
        ...(data.extraField ? { extraField: data.extraField } : {})
    };
}