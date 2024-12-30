/**
 * Category Management System
 * Handles CRUD operations and UI updates for categories
 */

import { createFormLayout, updateFormState, clearForm } from './ui/forms';
import { createTableLayout, displayCategories, getSortValue } from './ui/table';
import { updateStats } from './ui/stats';
import { validateName, validateItemLimit, validateCategoryName } from './handlers/validation';
import { collectFormData, formatFormData } from './handlers/formData';

export default class CategoryManager {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.loadCategories();
    }

    initializeElements() {
        // Form elements
        this.form = createFormLayout();
        this.nameInput = document.getElementById('categoryName');
        this.itemLimitSelect = document.getElementById('itemLimit');
        
        // Table elements
        const table = createTableLayout();
        this.tableBody = table.querySelector('tbody');
        
        // Stats container
        this.categoryStats = document.getElementById('categoryStats');
        
        // Initialize sorting
        this.sortableTable = this.initializeSortableTable(table);
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.form.addEventListener('reset', this.handleReset.bind(this));
        this.nameInput.addEventListener('input', this.handleNameInput.bind(this));
        document.addEventListener('settingsUpdated', this.handleSettingsUpdate.bind(this));
    }

    initializeSortableTable(table) {
        return {
            currentSort: { key: null, direction: 'asc' },
            sort: (key) => {
                const rows = Array.from(this.tableBody.querySelectorAll('tr'));
                const direction = key === this.currentSort.key && 
                    this.currentSort.direction === 'asc' ? 'desc' : 'asc';

                rows.sort((a, b) => {
                    const aVal = getSortValue(a, key);
                    const bVal = getSortValue(b, key);
                    return direction === 'asc' ? 
                        (aVal > bVal ? 1 : -1) : 
                        (aVal < bVal ? 1 : -1);
                });

                this.tableBody.append(...rows);
                this.currentSort = { key, direction };
            }
        };
    }

    async loadCategories() {
        try {
            const categories = await window.apiGet('/api/categories');
            this.displayCategories(categories);
            this.updateStats(categories);
            this.lastUpdated = new Date();
        } catch (error) {
            this.showMessage(error.message, 'error', 'category');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const data = collectFormData();
        if (!data) return;

        const isEdit = !!data.id;
        const endpoint = isEdit ? `/api/categories/${data.id}` : '/api/categories';
        const apiMethod = isEdit ? window.apiPut : window.apiPost;

        try {
            if (!validateName(data.name, this)) return;
            if (!validateItemLimit(data.itemLimit, this.globalLimit || 100, this)) return;

            const formatted = formatFormData(data);
            await apiMethod(endpoint, formatted);
            
            this.showMessage(
                `Category ${isEdit ? 'updated' : 'created'} successfully`,
                'success',
                'category'
            );
            
            this.form.reset();
            await this.loadCategories();
        } catch (error) {
            this.showMessage(error.message, 'error', 'category');
        }
    }

    handleReset() {
        clearForm();
        this.nameInput.setAttribute('aria-invalid', 'false');
    }

    handleNameInput(event) {
        validateCategoryName(event, this);
    }

    handleSettingsUpdate(event) {
        this.globalLimit = event.detail.maxItemLimit;
        this.updateLimitOptions();
    }

    updateLimitOptions() {
        const select = this.itemLimitSelect;
        select.innerHTML = '<option value="0">No Limit</option>';
        
        if (this.globalLimit) {
            for (let i = 1; i <= this.globalLimit; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = i;
                select.appendChild(option);
            }
        }
    }

    editCategory(id, name, limit) {
        document.getElementById('categoryId').value = id;
        this.nameInput.value = name;
        this.itemLimitSelect.value = limit;
        updateFormState(true);
    }

    async deleteCategory(id) {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await window.apiDelete(`/api/categories/${id}`);
            this.showMessage('Category deleted successfully', 'success', 'category');
            await this.loadCategories();
        } catch (error) {
            this.showMessage(error.message, 'error', 'category');
        }
    }

    showMessage(message, type, context) {
        window.showMessage(message, type, context);
    }
}