import { showMessage, apiGet, apiPost, apiPut, apiDelete } from './utils.js';
import { managers, EVENTS } from './main.js';

export class CategoryManager {
    constructor() {
        this.form = document.getElementById('categoryForm');
        this.tableBody = document.getElementById('categoryTableBody');
        this.resetButton = document.getElementById('resetForm');
        this.itemLimitValue = document.getElementById('categoryItemLimit');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.itemLimitValue.addEventListener('input', this.handleLimitValidation.bind(this));
        this.addTableEventListeners();
    }

    handleLimitValidation(e) {
        const globalUpperLimit = managers.settings.getCurrentLimit();
        let value = parseInt(e.target.value);

        if (isNaN(value) || value < 0) {
            e.target.value = 0;
        } else if (value > globalUpperLimit) {
            e.target.value = globalUpperLimit;
        }
    }

    addTableEventListeners() {
        this.tableBody.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('edit-btn')) {
                this.editCategory(
                    parseInt(target.dataset.id),
                    target.dataset.name,
                    parseInt(target.dataset.limit || '0')
                );
            } else if (target.classList.contains('delete-btn')) {
                this.deleteCategory(parseInt(target.dataset.id));
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('categoryName').value.trim();
        const itemLimit = parseInt(document.getElementById('categoryItemLimit').value) || 0;
        const id = document.getElementById('categoryId').value;

        try {
            const data = { name, itemLimit };
            if (id) {
                await apiPut(`/api/categories/${id}`, data);
                showMessage('Category updated successfully', 'success', 'category');
            } else {
                await apiPost('/api/categories', data);
                showMessage('Category created successfully', 'success', 'category');
            }
            this.resetForm();
            await this.loadCategories();
            
            // Dispatch event for other managers
            document.dispatchEvent(new Event(EVENTS.CATEGORY_UPDATED));
        } catch (error) {
            showMessage(error.message || 'An error occurred', 'error', 'category');
        }
    }

    async loadCategories() {
        try {
            const data = await apiGet('/api/categories');
            if (data && data.data) {
                this.displayCategories(data.data);
            }
        } catch (error) {
            showMessage(error.message || 'Error loading categories', 'error', 'category');
        }
    }

    displayCategories(categories) {
        if (!Array.isArray(categories)) {
            this.tableBody.innerHTML = '<tr><td colspan="4">No categories available</td></tr>';
            return;
        }

        this.tableBody.innerHTML = categories.map(category => `
            <tr>
                <td class="table__cell">${category.name}</td>
                <td class="table__cell">${this.formatLimit(category.itemLimit)}</td>
                <td class="table__cell">${new Date(category.createdAt).toLocaleDateString()}</td>
                <td class="table__cell">
                    <button class="edit-btn" 
                            data-id="${category.id}" 
                            data-name="${category.name}"
                            data-limit="${category.itemLimit || 0}">Edit</button>
                    <button class="delete-btn" data-id="${category.id}">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    formatLimit(limit) {
        const limitNum = parseInt(limit);
        return isNaN(limitNum) || limitNum === 0 ? 'No Limit' : limitNum.toString();
    }

    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await apiDelete(`/api/categories/${id}`);
            showMessage('Category deleted successfully', 'success', 'category');
            await this.loadCategories();
            
            // Dispatch event for other managers
            document.dispatchEvent(new Event(EVENTS.CATEGORY_UPDATED));
        } catch (error) {
            showMessage(error.message || 'Error deleting category', 'error', 'category');
        }
    }

    editCategory(id, name, itemLimit) {
        document.getElementById('categoryId').value = id;
        document.getElementById('categoryName').value = name || '';
        document.getElementById('categoryItemLimit').value = itemLimit || 0;
        this.form.querySelector('button[type="submit"]').textContent = 'Update Category';
    }

    resetForm() {
        this.form.reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('categoryItemLimit').value = '0';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Category';
    }
}