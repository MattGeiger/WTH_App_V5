// Message handling
export function showMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = message;
    messageArea.className = type;
    setTimeout(() => {
        messageArea.textContent = '';
        messageArea.className = '';
    }, 3000);
}

// API helpers
export async function apiGet(endpoint) {
    const response = await fetch(endpoint);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to fetch from ${endpoint}`);
    }
    return response.json();
}

export async function apiPost(endpoint, data) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
}

export async function apiPut(endpoint, data) {
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
    }
    return response.json();
}

export async function apiDelete(endpoint) {
    const response = await fetch(endpoint, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
    }
}

// Date formatting
export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

// Form reset helper
export function resetFormButton(form, buttonText = 'Add') {
    form.reset();
    form.querySelector('button[type="submit"]').textContent = buttonText;
}

// Confirmation dialog
export function confirmAction(message = 'Are you sure?') {
    return confirm(message);
}