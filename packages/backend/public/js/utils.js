export function showMessage(message, type = 'info', section = null) {
    const messageArea = section ? 
        document.querySelector(`#${section}Section .message-area`) : 
        document.getElementById('messageArea');
    
    if (!messageArea) return;

    const messageElement = document.createElement('div');
    messageElement.className = `message message--${type}`;
    messageElement.textContent = message;
    
    messageArea.innerHTML = '';
    messageArea.appendChild(messageElement);

    if (type === 'success') {
        setTimeout(() => messageElement.remove(), 5000);
    }
}

export function clearMessages(section = null) {
    const messageArea = section ? 
        document.querySelector(`#${section}Section .message-area`) : 
        document.getElementById('messageArea');
    
    if (messageArea) {
        messageArea.innerHTML = '';
    }
}

export async function apiGet(endpoint) {
    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Get Error:', error);
        throw error;
    }
}

export async function apiPost(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error('API Post Error:', error);
        throw error;
    }
}

export async function apiPut(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error('API Put Error:', error);
        throw error;
    }
}

export async function apiDelete(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
        }
        
        return responseData;
    } catch (error) {
        console.error('API Delete Error:', error);
        throw error;
    }
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date);
}
