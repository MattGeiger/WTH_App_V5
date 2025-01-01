/**
 * Form data collection and validation
 */

/**
 * Normalizes whitespace in a string
 * @private
 * @param {string} str - String to normalize
 * @returns {string} Normalized string
 */
function normalizeWhitespace(str) {
    return String(str || '').trim().replace(/\s+/g, ' ');
}

/**
 * Safely parses an integer with validation
 * @private
 * @param {*} value - Value to parse
 * @param {number} defaultValue - Default value if parsing fails
 * @returns {number} Parsed number or default value
 */
function safeParseInt(value, defaultValue = 0) {
    if (value === null || value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && isFinite(parsed) ? parsed : defaultValue;
}

/**
 * Collects form data from category form
 * @returns {Object} Form data with defaults if empty/invalid
 */
export function collectFormData() {
    try {
        const idInput = document.getElementById('categoryId');
        const nameInput = document.getElementById('categoryName');
        const limitInput = document.getElementById('categoryItemLimit');

        // Default values
        let id = null;
        let name = '';
        let itemLimit = 0;

        // Parse ID if present
        if (idInput?.value) {
            const parsedId = safeParseInt(idInput.value);
            if (parsedId > 0) {
                id = parsedId;
            }
        }

        // Get and normalize name
        if (nameInput?.value) {
            name = normalizeWhitespace(nameInput.value);
        }

        // Parse item limit
        if (limitInput?.value) {
            const parsedLimit = safeParseInt(limitInput.value);
            if (parsedLimit >= 0) {
                itemLimit = parsedLimit;
            }
        }

        return { id, name, itemLimit };
    } catch (error) {
        console.error('Error collecting form data:', error);
        return { id: null, name: '', itemLimit: 0 };
    }
}

/**
 * Checks if form data is empty
 * @param {Object} data - Form data to check
 * @returns {boolean} True if form is empty or contains only whitespace
 */
export function isFormEmpty(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return true;
    }
    
    const name = data.name;
    if (name === null || name === undefined) {
        return true;
    }

    return !String(name).trim();
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

    // Handle invalid input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { ...defaults };
    }

    // Extract and process values
    const { name, itemLimit, id, ...rest } = data;

    // Process name
    const formattedName = normalizeWhitespace(name);

    // Process item limit
    let formattedLimit = 'No Limit';
    if (itemLimit !== null && itemLimit !== undefined && itemLimit !== '') {
        const numLimit = safeParseInt(itemLimit);
        formattedLimit = numLimit === 0 ? 'No Limit' : String(numLimit);
    }

    // Process ID
    let formattedId = defaults.id;
    if (id !== null && id !== undefined && id !== '') {
        formattedId = String(id);
    }

    return {
        ...rest,
        name: formattedName || defaults.name,
        itemLimit: formattedLimit,
        id: formattedId
    };
}

/**
 * Formats form data for API submission
 * @param {Object} data - Form data to format
 * @returns {Object|null} Formatted data or null if invalid
 */
export function formatForSubmission(data) {
    // Handle invalid input
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return null;
    }

    // Process name
    const trimmedName = normalizeWhitespace(data.name);
    
    // Handle empty state
    if (!trimmedName) {
        return {
            name: '',
            itemLimit: 0
        };
    }

    // Create result object
    const result = {
        name: trimmedName,
        itemLimit: safeParseInt(data.itemLimit)
    };

    // Add ID if valid
    if (data.id && data.id !== 'New' && data.id !== '') {
        result.id = String(data.id);
    }

    return result;
}