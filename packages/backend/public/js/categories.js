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
        this.addTableEventListeners();
    }

    addTableEventListeners() {
        this.tableBody.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('edit-btn')) {
                this.editCategory(target.dataset.id, target.dataset.name);
            } else if (target.classList.contains('delete-btn')) {
                this.deleteCategory(target.dataset.id);
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('categoryName').value.trim();
        const id = document.getElementById('categoryId').value;

        try {
            if (id) {
                await apiPut(`/api/categories/${id}`, { name });
                showMessage('Category updated successfully', 'success', 'category');
            } else {
                await apiPost('/api/categories', { name });
                showMessage('Category created successfully', 'success', 'category');
            }
            this.resetForm();
            await this.loadCategories();
        } catch (error) {
            showMessage(error.message, 'error', 'category');
        }
    }

    async loadCategories() {
        try {
            const data = await apiGet('/api/categories');
            this.displayCategories(data.data);
        } catch (error) {
            showMessage(error.message, 'error', 'category');
        }
    }

    displayCategories(categories) {
        this.tableBody.innerHTML = categories.map(category => `
            <tr>
                <td class="table__cell">${category.name}</td>
                <td class="table__cell">${new Date(category.createdAt).toLocaleDateString()}</td>
                <td class="table__cell">
                    <button class="edit-btn" data-id="${category.id}" data-name="${category.name}">Edit</button>
                    <button class="delete-btn" data-id="${category.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await apiDelete(`/api/categories/${id}`);
            showMessage('Category deleted successfully', 'success', 'category');
            await this.loadCategories();
        } catch (error) {
            showMessage(error.message, 'error', 'category');
        }
    }

    editCategory(id, name) {
        document.getElementById('categoryId').value = id;
        document.getElementById('categoryName').value = name;
        this.form.querySelector('button[type="submit"]').textContent = 'Update Category';
    }

    resetForm() {
        this.form.reset();
        document.getElementById('categoryId').value = '';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Category';
    }
}