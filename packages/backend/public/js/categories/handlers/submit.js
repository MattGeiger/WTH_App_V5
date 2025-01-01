/**
 * Form submission handler for categories
 */

import { validateName, validateItemLimit } from './validation.js';
import { collectFormData, formatForSubmission } from './formData.js';
import { showMessage, apiPost, apiPut } from '../../utils.js';
import { EVENTS } from '../../main.js';

/**
 * Handles form submission for categories
 * @param {Event} event - Submit event
 * @param {Object} manager - Category manager instance
 * @returns {Promise<void>}
 */
export async function handleSubmit(event, manager) {
    event.preventDefault();

    // Handle null manager
    if (!manager) {
        showMessage('Invalid manager configuration', 'error', 'category');
        return;
    }

    try {
        // Collect form data first
        const data = collectFormData();
        if (!data || !data.name?.trim()) {
            manager.showMessage('Invalid form data', 'error', 'category');
            return;
        }

        // Get API endpoint and method based on edit status
        const isEdit = !!data.id;
        const endpoint = isEdit ? `/api/categories/${data.id}` : '/api/categories';
        const apiMethod = isEdit ? apiPut : apiPost;

        // Validate length before other rules
        if (!data.name || data.name.length < 3) {
            manager.showMessage(
                'Category name must be at least three characters',
                'error',
                'category'
            );
            return;
        }

        // Safely get global limit with fallback
        const defaultLimit = 100;
        let globalLimit = defaultLimit;
        try {
            const settingsLimit = manager.managers?.settings?.getCurrentLimit?.();
            globalLimit = settingsLimit > 0 ? settingsLimit : defaultLimit;
        } catch (err) {
            console.warn('Error getting global limit, using default:', err);
        }

        // Validate item limit
        const itemLimit = parseInt(data.itemLimit, 10);
        if (!validateItemLimit(itemLimit, globalLimit, manager)) {
            return;
        }

        // Prepare API payload
        const payload = {
            name: data.name,
            itemLimit: itemLimit || 0
        };

        // Submit to API
        await apiMethod(endpoint, payload);
        
        // Handle success
        manager.showMessage(
            `Category ${isEdit ? 'updated' : 'created'} successfully`,
            'success',
            'category'
        );
        
        // Reset form and reload data
        manager.resetForm();
        await manager.loadCategories();

        // Dispatch event
        document.dispatchEvent(new Event(EVENTS.CATEGORY_UPDATED));

    } catch (error) {
        // Handle error cases
        const errorMessage = error?.message || 'An error occurred';
        manager.showMessage(errorMessage, 'error', 'category');
    }
}