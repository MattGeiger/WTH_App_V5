import { showMessage, apiGet, apiPost, apiPut, apiDelete } from './utils.js';

export class CategoryManager {
    constructor() {
        this.form = document.getElementById('categoryForm');
        this.tableBody = document.getElementById('categoryTableBody');
        this.resetButton = document.getElementById('resetForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', () => this.resetForm());
    }

    async handleSubmit(e) {
        e.preventDefault();
        const nameInput = document.getElementById('categoryName');
        const categoryId = document.getElementById('categoryId');
        const name = nameInput.value.trim();

        try {
            if (categoryId.value) {
                await apiPut(`/api/categories/${categoryId.value}`, { name });
                showMessage('Category updated successfully', 'success');
            } else {
                await apiPost('/api/categories', { name });
                showMessage('Category created successfully', 'success');
            }
            this.resetForm();
            await this.loadCategories();
            if (window.translationManager) {
                window.translationManager.updateTranslationTargets();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async loadCategories() {
        try {
            const data = await apiGet('/api/categories');
            this.displayCategories(data.data);
            this.updateCategorySelect(data.data);
            if (window.translationManager?.isTypeCategory()) {
                window.translationManager.updateTranslationTargets();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    displayCategories(categories) {
        this.tableBody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.name}</td>
                <td>${new Date(category.createdAt).toLocaleDateString()}</td>
                <td>
                    <button onclick="categoryManager.editCategory(${category.id}, '${category.name}')">Edit</button>
                    <button onclick="categoryManager.deleteCategory(${category.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    updateCategorySelect(categories) {
        const select = document.getElementById('foodItemCategory');
        if (select) {
            select.innerHTML = categories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
        }
    }

    editCategory(id, name) {
        document.getElementById('categoryId').value = id;
        document.getElementById('categoryName').value = name;
        this.form.querySelector('button[type="submit"]').textContent = 'Update Category';
    }

    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await apiDelete(`/api/categories/${id}`);
            showMessage('Category deleted successfully', 'success');
            await this.loadCategories();
            if (window.foodItemManager) {
                await window.foodItemManager.loadFoodItems();
            }
            if (window.translationManager) {
                await window.translationManager.loadTranslations();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    resetForm() {
        this.form.reset();
        document.getElementById('categoryId').value = '';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Category';
    }
}