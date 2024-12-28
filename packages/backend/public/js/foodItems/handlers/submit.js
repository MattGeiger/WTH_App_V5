import { showMessage } from '../../utils.js';
import { validateName } from './validation.js';
import { collectFormData } from './formData.js';

export async function handleSubmit(e, manager) {
    e.preventDefault();
    const name = manager.nameInput.value.trim();
    
    if (!validateName(name)) {
        return;
    }

    const data = collectFormData(manager);

    try {
        if (data.categoryId === '') {
            showMessage('Please select a category', 'error', 'foodItem');
            return;
        }

        const id = document.getElementById('foodItemId').value;
        const result = await (id ? 
            manager.updateItem(id, data) : 
            manager.createItem(data));

        if (result) {
            manager.resetForm();
            await manager.loadFoodItems();
        }
    } catch (error) {
        showMessage(error.message || 'An error occurred', 'error', 'foodItem');
    }
}