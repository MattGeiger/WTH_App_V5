/**
 * Category submission handlers
 * Handles form submission and API interactions for categories
 */

import { showMessage, apiPost, apiPut } from '../../utils.js';
import { EVENTS } from '../../main.js';
import { validateName, validateItemLimit } from './validation.js';
import { collectFormData } from './formData.js';

/**
 * Handles the category form submission
 * @param {Event} e - The submit event
 * @param {CategoryManager} manager - The category manager instance
 */
export async function handleSubmit(e, manager) {
    e.preventDefault();
    
    try {
        const formData = collectFormData();
        const validationResult = validateFormData(formData, manager);
        
        if (!validationResult.isValid) {
            showMessage(validationResult.error, 'error', 'category');
            return;
        }

        await saveCategory(formData, manager);
        
        // Reset and reload
        manager.resetForm();
        await manager.loadCategories();
        
        // Notify other components
        document.dispatchEvent(new Event(EVENTS.CATEGORY_UPDATED));
        
    } catch (error) {
        showMessage(error.message || 'An error occurred while saving the category', 'error', 'category');
    }
}

/**
 * Validates the complete form data before submission
 * @param {Object} formData - The collected form data
 * @param {CategoryManager} manager - The category manager instance
 * @returns {Object} - Validation result {isValid: boolean, error: string|null}
 */
function validateFormData(formData, manager) {
    // Validate name
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
        return nameValidation;
    }

    // Get global limit from settings manager
    const globalLimit = manager.managers?.settings?.getCurrentLimit() || 0;
    
    // Validate item limit
    const limitValidation = validateItemLimit(formData.itemLimit, globalLimit);
    if (!limitValidation.isValid) {
        return limitValidation;
    }

    return { isValid: true, error: null };
}

/**
 * Saves the category data to the server
 * @param {Object} formData - The validated form data
 * @param {CategoryManager} manager - The category manager instance
 */
async function saveCategory(formData, manager) {
    const { id, name, itemLimit } = formData;
    const data = { name, itemLimit };

    try {
        if (id) {
            // Update existing category
            await apiPut(`/api/categories/${id}`, data);
            showMessage('Category updated successfully', 'success', 'category');
        } else {
            // Create new category
            await apiPost('/api/categories', data);
            showMessage('Category created successfully', 'success', 'category');
        }
    } catch (error) {
        // Convert and rethrow error for consistent handling
        throw new Error(error.message || 'Failed to save category');
    }
}