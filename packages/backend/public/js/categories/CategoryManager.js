/**
 * Category Management System
 * Handles CRUD operations and UI updates for categories
 */

import { createFormLayout, updateFormState, clearForm } from './ui/forms.js';
import { createTableLayout, displayCategories, getSortValue } from './ui/table.js';
import { updateStats } from './ui/stats.js';
import { validateName, validateItemLimit, validateCategoryName } from './handlers/validation.js';
import { collectFormData, formatFormData } from './handlers/formData.js';
import { showMessage } from '../utils.js';

export class CategoryManager extends EventTarget {
    constructor(config = {}) {
        super();
        // API methods
        this.apiGet = config.apiGet || window.apiGet;
        this.apiPost = config.apiPost || window.apiPost;
        this.apiPut = config.apiPut || window.apiPut;
        this.apiDelete = config.apiDelete || window.apiDelete;
        this.showMessage = config.showMessage || showMessage;
        
        // Bind event handlers
        this.boundHandleSubmit = this.handleSubmit.bind(this);
        this.boundHandleReset = this.handleReset.bind(this);
        this.boundHandleNameInput = this.handleNameInput.bind(this);
        this.boundHandleSettingsUpdate = this.handleSettingsUpdate.bind(this);

        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        // Form elements
        this.form = createFormLayout();
        this.nameInput = document.getElementById('categoryName');
        this.itemLimitSelect = document.getElementById('itemLimit');
        
        // Table elements
        const container = document.getElementById('categoryTableContainer');
        if (!container) {
            throw new Error('Category table container not found');
        }
        
        const table = createTableLayout();
        container.innerHTML = '';
        container.appendChild(table);
        this.tableBody = container.querySelector('#categoryTableBody');
        
        if (!this.tableBody) {
            throw new Error('Category table body not found after initialization');
        }
        
        // Stats container
        this.categoryStats = document.getElementById('categoryStats');
        
        // Initialize sorting with initial state
        this.sortableTable = {
            currentSort: { key: 'name', direction: 'asc' },
            sort: (key) => {
                // Get current direction or set initial
                const { currentSort } = this.sortableTable;
                const direction = key === currentSort.key && 
                    currentSort.direction === 'asc' ? 'desc' : 'asc';

                // Get and sort rows
                const rows = Array.from(this.tableBody.querySelectorAll('tr'));
                if (rows.length === 0) return;

                rows.sort((a, b) => {
                    const aVal = getSortValue(a, key);
                    const bVal = getSortValue(b, key);
                    return direction === 'asc' ? 
                        (aVal > bVal ? 1 : -1) : 
                        (aVal < bVal ? 1 : -1);
                });

                // Update DOM
                this.tableBody.innerHTML = '';
                this.tableBody.append(...rows);

                // Update state and indicators
                this.sortableTable.currentSort = { key, direction };
                this.updateSortIndicators(document.querySelector(`th[data-sort-key="${key}"]`));
            }
        };

        // Load initial data
        this.loadCategories();
    }

    updateSortIndicators(clickedHeader) {
        if (!clickedHeader) return;

        // Remove all sorting classes
        document.querySelectorAll('th[data-sort-key]').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
        });

        // Add correct class to clicked header
        const direction = this.sortableTable.currentSort.direction;
        clickedHeader.classList.add(`sorted-${direction}`);
    }

    setupEventListeners() {
        // Form events
        this.form.addEventListener('submit', this.boundHandleSubmit);
        this.form.addEventListener('reset', this.boundHandleReset);
        this.nameInput.addEventListener('input', this.boundHandleNameInput);
        document.addEventListener('settingsUpdated', this.boundHandleSettingsUpdate);

        // Table sorting
        const headers = document.querySelectorAll('th[data-sort-key]');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const key = header.dataset.sortKey;
                this.sortableTable.sort(key);
            });
        });
    }

    async loadCategories() {
        try {
            const response = await this.apiGet('/api/categories');
            const categories = response.data || [];

            // Update DOM first
            displayCategories(this.tableBody, categories);
            updateStats(this.categoryStats, categories, this.lastUpdated);
            this.lastUpdated = new Date();

            // Apply current sort
            const { key } = this.sortableTable.currentSort;
            if (key && categories.length > 0) {
                // Save current direction
                const direction = this.sortableTable.currentSort.direction;
                // Sort in current direction
                this.sortableTable.currentSort.direction = direction === 'asc' ? 'desc' : 'asc';
                this.sortableTable.sort(key);
            }
        } catch (error) {
            this.showMessage(error.message || 'Error loading categories', 'error', 'category');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        const data = collectFormData();
        if (!data) {
            this.showMessage('Invalid form data', 'error', 'category');
            return;
        }

        const isEdit = !!data.id;
        const endpoint = isEdit ? `/api/categories/${data.id}` : '/api/categories';
        const apiMethod = isEdit ? this.apiPut : this.apiPost;

        // Validate name
        if (data.name.length < 3) {
            this.showMessage(
                'Category name must be at least three characters',
                'error',
                'category'
            );
            return;
        }

        // Validate limit
        const globalLimit = this.managers?.settings?.getCurrentLimit?.() || 100;
        if (!validateItemLimit(data.itemLimit, globalLimit, this)) {
            return;
        }

        try {
            // Prepare API payload
            const payload = {
                name: data.name,
                itemLimit: parseInt(data.itemLimit, 10) || 0
            };

            await apiMethod(endpoint, payload);
            
            this.showMessage(
                `Category ${isEdit ? 'updated' : 'created'} successfully`,
                'success',
                'category'
            );
            
            this.resetForm();
            await this.loadCategories();
            document.dispatchEvent(new Event('categoryUpdated'));
        } catch (error) {
            this.showMessage(error.message || 'An error occurred', 'error', 'category');
        }
    }

    resetForm() {
        clearForm(this.form);
        this.nameInput.setAttribute('aria-invalid', 'false');
        updateFormState(false);
    }

    handleReset() {
        this.resetForm();
    }

    handleNameInput(event) {
        validateCategoryName(event, this);
    }

    handleSettingsUpdate(event) {
        const oldValue = parseInt(this.itemLimitSelect.value, 10);
        this.globalLimit = event.detail.maxItemLimit;
        this.updateLimitOptions(oldValue);
    }

    updateLimitOptions(previousValue = 0) {
        const select = this.itemLimitSelect;
        select.innerHTML = '<option value="0">No Limit</option>';
        
        if (this.globalLimit) {
            for (let i = 1; i <= this.globalLimit; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = i.toString();
                select.appendChild(option);
            }
        }

        // Only update if value within range
        if (previousValue > 0 && previousValue <= this.globalLimit) {
            select.value = previousValue.toString();
        }
    }

    editCategory(id, name, limit) {
        document.getElementById('categoryId').value = id;
        this.nameInput.value = name;
        this.itemLimitSelect.value = limit.toString();
        updateFormState(true);
    }

    async deleteCategory(id) {
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        try {
            await this.apiDelete(`/api/categories/${id}`);
            this.showMessage('Category deleted successfully', 'success', 'category');
            await this.loadCategories();
            document.dispatchEvent(new Event('categoryUpdated'));
        } catch (error) {
            this.showMessage(error.message || 'Error deleting category', 'error', 'category');
        }
    }
}