// Message handling
export function showMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    messageArea.textContent = message;
    messageArea.className = `message-area message message--${type}`;
    setTimeout(() => {
        messageArea.textContent = '';
        messageArea.className = 'message-area';
    }, 3000);
}

// API helpers
export async function apiGet(endpoint) {
    console.log(`GET ${endpoint}`);
    const response = await fetch(endpoint);
    if (!response.ok) {
        const error = await response.json();
        console.error('GET Error:', error);
        throw new Error(error.message || `Failed to fetch from ${endpoint}`);
    }
    return response.json();
}

export async function apiPost(endpoint, data) {
    console.log(`POST ${endpoint}`, data);
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('POST Error:', error);
        throw new Error(error.message || 'API request failed');
    }
    return response.json();
}

export async function apiPut(endpoint, data) {
    console.log(`PUT ${endpoint}`, data);
    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('PUT Error:', error);
        throw new Error(error.message || 'Update failed');
    }
    return response.json();
}

export async function apiDelete(endpoint) {
    console.log(`DELETE ${endpoint}`);
    const response = await fetch(endpoint, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const error = await response.json();
        console.error('DELETE Error:', error);
        throw new Error(error.message || 'Delete failed');
    }
}

export function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

export function resetFormButton(form, buttonText = 'Add') {
    form.reset();
    form.querySelector('button[type="submit"]').textContent = buttonText;
}

export function confirmAction(message = 'Are you sure?') {
    return confirm(message);
}