/**
 * Form submission handler
 */

import { validateName, validateItemLimit } from './validation';
import { collectFormData, formatFormData } from './formData';

/**
 * Handles form submission
 * @param {Event} event - Submit event
 * @param {Object} manager - Category manager instance
 */
export async function handleSubmit(event, manager) {
    event.preventDefault();
    const data = collectFormData();
    if (!data) return;

    const isEdit = !!data.id;
    const endpoint = isEdit ? `/api/categories/${data.id}` : '/api/categories';
    const apiMethod = isEdit ? window.apiPut : window.apiPost;

    try {
        if (!validateName(data.name, manager)) return;
        if (!validateItemLimit(data.itemLimit, manager.globalLimit || 100, manager)) return;

        const formatted = formatFormData(data);
        await apiMethod(endpoint, formatted);
        
        manager.showMessage(
            `Category ${isEdit ? 'updated' : 'created'} successfully`,
            'success',
            'category'
        );
        
        manager.form.reset();
        await manager.loadCategories();
    } catch (error) {
        manager.showMessage(error.message, 'error', 'category');
    }
}