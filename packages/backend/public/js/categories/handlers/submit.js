/**
 * Form submission handler
 */

import { validateName, validateItemLimit } from './validation';
import { collectFormData, formatForSubmission } from './formData';
import { showMessage, apiPost, apiPut } from '../../utils.js';
import { EVENTS } from '../../main.js';

/**
 * Handles form submission
 * @param {Event} event - Submit event
 * @param {Object} manager - Category manager instance
 */
export async function handleSubmit(event, manager) {
    event.preventDefault();

    // Early validation of manager
    if (!manager || typeof manager.showMessage !== 'function') {
        showMessage('Invalid manager configuration', 'error', 'category');
        return;
    }

    const data = collectFormData();
    if (!data || !data.name) {
        manager.showMessage('Invalid form data', 'error', 'category');
        return;
    }

    const isEdit = !!data.id;
    const endpoint = isEdit ? `/api/categories/${data.id}` : '/api/categories';
    const apiMethod = isEdit ? apiPut : apiPost;

    try {
        // Validate form data
        if (!validateName(data.name)) {
            manager.showMessage('Category name must be at least three characters', 'error', 'category');
            return;
        }

        const globalLimit = manager.managers?.settings?.getCurrentLimit?.() || 100;
        if (!validateItemLimit(data.itemLimit, globalLimit)) {
            manager.showMessage(`Item limit cannot exceed global limit of ${globalLimit}`, 'error', 'category');
            return;
        }

        // Format and submit data
        const formatted = formatForSubmission(data);
        if (!formatted) {
            manager.showMessage('Error formatting data', 'error', 'category');
            return;
        }

        await apiMethod(endpoint, formatted);
        
        // Success handling
        manager.showMessage(
            `Category ${isEdit ? 'updated' : 'created'} successfully`,
            'success',
            'category'
        );
        
        manager.resetForm();
        await manager.loadCategories();
        
        // Notify other components
        document.dispatchEvent(new Event(EVENTS.CATEGORY_UPDATED));
    } catch (error) {
        manager.showMessage(error.message || 'An error occurred', 'error', 'category');
    }
}