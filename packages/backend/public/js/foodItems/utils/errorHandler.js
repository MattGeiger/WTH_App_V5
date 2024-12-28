import { showMessage } from '../../utils.js';

export function handleError(error, context) {
    const message = error.message || 'An error occurred';
    showMessage(`${context}: ${message}`, 'error', 'foodItem');
    console.error(`Food Items Error (${context}):`, error);
    return false;
}

export function handleSuccess(message) {
    showMessage(message, 'success', 'foodItem');
    return true;
}