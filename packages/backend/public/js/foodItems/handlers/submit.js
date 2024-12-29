import { showMessage } from '../../utils.js';
import { validateName } from './validation.js';
import { collectFormData } from './formData.js';

export async function handleSubmit(e, manager) {
    e.preventDefault();
    const name = manager.nameInput.value.trim();
    
    try {
        // Validation
        if (!validateName(name)) {
            showMessage('Invalid item name', 'error', 'foodItem');
            return;
        }

        // Data Collection
        const data = collectFormData(manager);
        
        if (data.categoryId === '') {
            showMessage('Please select a category', 'error', 'foodItem');
            return;
        }

        // Save Data
        const id = document.getElementById('foodItemId').value;
        const result = await (id ? 
            manager.updateItem(id, data) : 
            manager.createItem(data));

        if (result) {
            const action = id ? 'updated' : 'created';
            showMessage(`Food item ${action} successfully`, 'success', 'foodItem');
            manager.resetForm();
            await manager.loadFoodItems();
        }
    } catch (error) {
        showMessage(error.message || 'An error occurred', 'error', 'foodItem');
    }
}