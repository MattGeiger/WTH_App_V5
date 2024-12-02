document.addEventListener('DOMContentLoaded', () => {
    const categoryForm = document.getElementById('categoryForm');
    const categoryTableBody = document.getElementById('categoryTableBody');
    const messageArea = document.getElementById('messageArea');
    const resetFormButton = document.getElementById('resetForm');

    // Load categories on page load
    loadCategories();

    // Form submission handler
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('categoryName');
        const categoryId = document.getElementById('categoryId');
        const name = nameInput.value.trim();

        try {
            if (categoryId.value) {
                await updateCategory(categoryId.value, name);
                showMessage('Category updated successfully', 'success');
            } else {
                await createCategory(name);
                showMessage('Category created successfully', 'success');
            }
            resetForm();
            loadCategories();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Reset form handler
    resetFormButton.addEventListener('click', resetForm);

    // API Functions
    async function createCategory(name) {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create category');
        }
        
        return response.json();
    }

    async function loadCategories() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to load categories');
            
            const data = await response.json();
            displayCategories(data.data);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function updateCategory(id, name) {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update category');
        }

        return response.json();
    }

    async function deleteCategory(id) {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete category');
        }
    }

    // UI Helper Functions
    function displayCategories(categories) {
        categoryTableBody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.name}</td>
                <td>${new Date(category.createdAt).toLocaleDateString()}</td>
                <td>
                    <button onclick="editCategory(${category.id}, '${category.name}')">Edit</button>
                    <button onclick="deleteCategory(${category.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = type;
        setTimeout(() => {
            messageArea.textContent = '';
            messageArea.className = '';
        }, 3000);
    }

    function resetForm() {
        categoryForm.reset();
        document.getElementById('categoryId').value = '';
        document.querySelector('button[type="submit"]').textContent = 'Add Category';
    }

    // Make functions available globally for button onclick handlers
    window.editCategory = function(id, name) {
        document.getElementById('categoryId').value = id;
        document.getElementById('categoryName').value = name;
        document.querySelector('button[type="submit"]').textContent = 'Update Category';
    };

    window.deleteCategory = async function(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            await deleteCategory(id);
            showMessage('Category deleted successfully', 'success');
            loadCategories();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };
});