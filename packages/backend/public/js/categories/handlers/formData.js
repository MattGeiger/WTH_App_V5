/**
 * Form data collection and validation
 */

/**
 * Collects form data from category form
 * @returns {Object} Form data with defaults if empty/invalid
 */
export function collectFormData() {
    const idInput = document.getElementById('categoryId');
    const nameInput = document.getElementById('categoryName');
    const limitInput = document.getElementById('categoryItemLimit');

    // Default values for missing or invalid inputs
    let id = null;
    let name = '';
    let itemLimit = 0;

    // Parse ID if present
    if (idInput) {
        const parsedId = parseInt(idInput.value, 10);
        if (!isNaN(parsedId) && parsedId !== 0) {
            id = parsedId;
        }
    }

    // Get name if present and normalize spaces
    if (nameInput) {
        name = nameInput.value.trim().replace(/\s+/g, ' ');
    }

    // Parse item limit if present
    if (limitInput) {
        const parsedLimit = parseInt(limitInput.value, 10);
        if (!isNaN(parsedLimit) && parsedLimit >= 0) {
            itemLimit = parsedLimit;
        }
    }

    return { id, name, itemLimit };
}

/**
 * Checks if form data is empty
 * @param {Object} data - Form data to check
 * @returns {boolean} True if form is empty or contains only whitespace
 */
export function isFormEmpty(data) {
    if (!data || typeof data !== 'object') return true;
    
    const { name = '', itemLimit = 0 } = data;
    return !name.trim();
}

/**
 * Formats form data for display/UI
 * @param {Object} data - Raw form data
 * @returns {Object} Formatted data with string values
 */
export function formatFormData(data = {}) {
    const defaults = {
        name: 'Unnamed Category',
        itemLimit: 'No Limit',
        id: 'New'
    };

    if (!data || typeof data !== 'object') {
        return { ...defaults };
    }

    const { name = defaults.name, itemLimit = defaults.itemLimit, id = defaults.id, ...rest } = data;

    return {
        ...rest,
        name: String(name?.trim() || defaults.name),
        itemLimit: (itemLimit === 0 || itemLimit === '0') ? 'No Limit' : String(itemLimit || defaults.itemLimit),
        id: id === null ? defaults.id : String(id)
    };
}

/**
 * Formats form data for API submission
 * @param {Object} data - Form data to format
 * @returns {Object|null} Formatted data or null if invalid
 */
export function formatForSubmission(data) {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const trimmedName = (data.name || '').trim();
    
    // Handle valid empty state
    if (!trimmedName) {
        return {
            name: '',
            itemLimit: 0
        };
    }

    // Ensure numeric itemLimit
    const itemLimit = typeof data.itemLimit === 'string' ? 
        parseInt(data.itemLimit, 10) : 
        (typeof data.itemLimit === 'number' ? data.itemLimit : 0);

    const result = {
        name: trimmedName,
        itemLimit: isNaN(itemLimit) || itemLimit < 0 ? 0 : itemLimit
    };

    // Only include id if it exists and is valid
    if (data.id && data.id !== 'New') {
        result.id = data.id;
    }

    return result;
}