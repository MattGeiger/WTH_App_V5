import { showMessage, apiGet, apiPost, apiPut, apiDelete } from './utils.js';
import { managers, EVENTS } from './main.js';
import { SortableTable } from './utils/sortableTable.js';

export class CategoryManager {
    constructor() {
        this.form = document.getElementById('categoryForm');
        this.tableBody = document.getElementById('categoryTableBody');
        this.resetButton = document.getElementById('resetForm');
        this.itemLimitValue = document.getElementById('categoryItemLimit');
        this.nameInput = document.getElementById('categoryName');
        this.sortableTable = new SortableTable('categoryTableBody', this.getSortValue.bind(this));
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.itemLimitValue.addEventListener('input', this.handleLimitValidation.bind(this));
        this.nameInput.addEventListener('input', this.handleNameInput.bind(this));
        this.addTableEventListeners();
    }

    getSortValue(row, key) {
        const columnIndex = this.sortableTable.getColumnIndex(key);
        switch (key) {
            case 'name':
                return row.cells[columnIndex].textContent.toLowerCase();
            case 'limit':
                return SortableTable.numberSortValue(row, columnIndex);
            case 'created':
                return SortableTable.dateSortValue(row, columnIndex);
            default:
                return row.cells[columnIndex].textContent.toLowerCase();
        }
    }

    handleNameInput(e) {
        const input = e.target;
        const value = input.value;

        // Client-side validation
        if (value.length > 36) {
            input.value = value.slice(0, 36);
            showMessage('Input cannot exceed 36 characters', 'warning', 'category');
            return;
        }

        // Remove consecutive spaces as they type
        if (/\s{2,}/.test(value)) {
            input.value = value.replace(/\s{2,}/g, ' ');
        }

        // Check for repeated words
        const words = value.toLowerCase().split(' ');
        const uniqueWords = new Set(words);
        if (uniqueWords.size !== words.length) {
            showMessage('Input contains repeated words', 'warning', 'category');
        }

        // Convert to Title Case as they type
        input.value = value
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
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
        const name = this.nameInput.value.trim();
        const itemLimit = parseInt(this.itemLimitValue.value) || 0;
        const id = document.getElementById('categoryId').value;

        // Client-side validation
        if (name.length < 3) {
            showMessage('Category name must be at least three characters long', 'error', 'category');
            return;
        }

        const letterCount = (name.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 3) {
            showMessage('Category name must include at least three letters', 'error', 'category');
            return;
        }

        // Check for repeated words
        const words = name.toLowerCase().split(' ');
        const uniqueWords = new Set(words);
        if (uniqueWords.size !== words.length) {
            showMessage('Category name contains repeated words', 'error', 'category');
            return;
        }

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

        // Initialize sorting controls after displaying data
        this.sortableTable.setupSortingControls();
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
        this.nameInput.value = name || '';
        this.itemLimitValue.value = itemLimit || 0;
        this.form.querySelector('button[type="submit"]').textContent = 'Update Category';
    }

    resetForm() {
        this.form.reset();
        document.getElementById('categoryId').value = '';
        this.itemLimitValue.value = '0';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Category';
    }
}