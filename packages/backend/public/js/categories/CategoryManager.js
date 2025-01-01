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
        
        // Set loading state
        this.isLoading = false;
        this.lastUpdated = null;
        
        // API methods with fallbacks
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
        this.boundHandleSort = this.handleSort.bind(this);

        // Initialize UI
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        try {
            // Form elements
            this.form = createFormLayout();
            this.nameInput = document.getElementById('categoryName');
            this.itemLimitSelect = document.getElementById('itemLimit');
            
            if (!this.nameInput || !this.itemLimitSelect) {
                throw new Error('Required form elements not found');
            }
            
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
            if (!this.categoryStats) {
                console.warn('Stats container not found');
            }
            
            // Initialize sorting
            this.sortableTable = {
                currentSort: { key: 'name', direction: 'asc' },
                sort: this.boundHandleSort
            };

            // Load initial data
            this.loadCategories();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showMessage('Failed to initialize category manager', 'error', 'category');
        }
    }

    handleSort(key) {
        if (this.isLoading || !this.tableBody) return;
        
        // Get current direction or set initial
        const { currentSort } = this.sortableTable;
        const direction = key === currentSort.key && 
            currentSort.direction === 'asc' ? 'desc' : 'asc';

        try {
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

            // Update DOM efficiently
            const fragment = document.createDocumentFragment();
            rows.forEach(row => fragment.appendChild(row.cloneNode(true)));
            this.tableBody.innerHTML = '';
            this.tableBody.appendChild(fragment);

            // Update state and indicators
            this.sortableTable.currentSort = { key, direction };
            this.updateSortIndicators(document.querySelector(`th[data-sort-key="${key}"]`));
            
            // Dispatch sort event
            this.dispatchEvent(new CustomEvent('categoriesSorted', {
                detail: { key, direction }
            }));
        } catch (error) {
            console.error('Sort error:', error);
            this.showMessage('Failed to sort categories', 'error', 'category');
        }
    }

    updateSortIndicators(clickedHeader) {
        if (!clickedHeader) return;

        // Remove all sorting classes
        document.querySelectorAll('th[data-sort-key]').forEach(header => {
            header.classList.remove('sorted-asc', 'sorted-desc');
            header.setAttribute('aria-sort', 'none');
        });

        // Add correct class and aria attribute to clicked header
        const direction = this.sortableTable.currentSort.direction;
        clickedHeader.classList.add(`sorted-${direction}`);
        clickedHeader.setAttribute('aria-sort', direction);
    }

    setupEventListeners() {
        // Remove any existing listeners
        this.cleanupEventListeners();
        
        // Form events
        this.form.addEventListener('submit', this.boundHandleSubmit);
        this.form.addEventListener('reset', this.boundHandleReset);
        this.nameInput.addEventListener('input', this.boundHandleNameInput);
        document.addEventListener('settingsUpdated', this.boundHandleSettingsUpdate);

        // Table sorting
        const headers = document.querySelectorAll('th[data-sort-key]');
        headers.forEach(header => {
            const key = header.dataset.sortKey;
            if (!key) return;
            
            const handler = () => this.sortableTable.sort(key);
            header.addEventListener('click', handler);
            this._sortListeners = this._sortListeners || [];
            this._sortListeners.push({ element: header, handler });
        });
    }

    cleanupEventListeners() {
        // Cleanup sort listeners
        if (this._sortListeners) {
            this._sortListeners.forEach(({ element, handler }) => {
                element.removeEventListener('click', handler);
            });
            this._sortListeners = [];
        }
    }

    async loadCategories() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            const response = await this.apiGet('/api/categories');
            const categories = response.data || [];

            // Batch DOM updates
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Update UI components
            displayCategories(this.tableBody, categories);
            if (this.categoryStats) {
                updateStats(this.categoryStats, categories, this.lastUpdated);
            }
            this.lastUpdated = new Date();

            // Apply current sort if needed
            const { key, direction } = this.sortableTable.currentSort;
            if (key && categories.length > 0) {
                this.sortableTable.sort(key);
            }

            // Dispatch load event
            this.dispatchEvent(new CustomEvent('categoriesLoaded', {
                detail: { categories }
            }));
        } catch (error) {
            console.error('Load error:', error);
            this.showMessage(error.message || 'Error loading categories', 'error', 'category');
        } finally {
            this.isLoading = false;
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        if (this.isLoading) return;

        this.isLoading = true;
        try {
            // Collect and validate form data
            const data = collectFormData();
            if (!data || !data.name?.trim()) {
                this.showMessage('Invalid form data', 'error', 'category');
                return;
            }

            // Determine API endpoint and method
            const isEdit = !!data.id;
            const endpoint = isEdit ? `/api/categories/${data.id}` : '/api/categories';
            const apiMethod = isEdit ? this.apiPut : this.apiPost;

            // Validate name length
            if (!data.name || data.name.length < 3) {
                this.showMessage(
                    'Category name must be at least three characters',
                    'error',
                    'category'
                );
                return;
            }

            // Get and validate limit
            const globalLimit = this.managers?.settings?.getCurrentLimit?.() || 100;
            const itemLimit = parseInt(data.itemLimit, 10);
            if (!validateItemLimit(itemLimit, globalLimit, this)) {
                return;
            }

            // Prepare and send API payload
            const payload = {
                name: data.name,
                itemLimit: itemLimit || 0
            };

            await apiMethod(endpoint, payload);
            
            // Handle success
            this.showMessage(
                `Category ${isEdit ? 'updated' : 'created'} successfully`,
                'success',
                'category'
            );
            
            // Update UI
            this.resetForm();
            await this.loadCategories();

            // Notify other components
            document.dispatchEvent(new CustomEvent('categoryUpdated', {
                detail: { action: isEdit ? 'update' : 'create', category: payload }
            }));
        } catch (error) {
            console.error('Submit error:', error);
            this.showMessage(error.message || 'An error occurred', 'error', 'category');
        } finally {
            this.isLoading = false;
        }
    }

    resetForm() {
        clearForm(this.form);
        if (this.nameInput) {
            this.nameInput.setAttribute('aria-invalid', 'false');
        }
        updateFormState(false);
    }

    handleReset() {
        this.resetForm();
    }

    handleNameInput(event) {
        validateCategoryName(event, this);
    }

    handleSettingsUpdate(event) {
        if (!event?.detail) return;
        
        const oldValue = parseInt(this.itemLimitSelect?.value, 10);
        this.globalLimit = event.detail.maxItemLimit;
        this.updateLimitOptions(oldValue);
        
        // Notify components of limit change
        this.dispatchEvent(new CustomEvent('categoryLimitsUpdated', {
            detail: { oldValue, newValue: this.globalLimit }
        }));
    }

    updateLimitOptions(previousValue = 0) {
        const select = this.itemLimitSelect;
        if (!select) return;

        select.innerHTML = '<option value="0">No Limit</option>';
        
        if (this.globalLimit) {
            const fragment = document.createDocumentFragment();
            for (let i = 1; i <= this.globalLimit; i++) {
                const option = document.createElement('option');
                option.value = i.toString();
                option.textContent = i.toString();
                fragment.appendChild(option);
            }
            select.appendChild(fragment);
        }

        // Only update if value within range
        if (previousValue > 0 && previousValue <= this.globalLimit) {
            select.value = previousValue.toString();
        }
    }

    editCategory(id, name, limit) {
        const idInput = document.getElementById('categoryId');
        if (!idInput || !this.nameInput || !this.itemLimitSelect) {
            console.error('Required form elements not found');
            return;
        }

        idInput.value = id?.toString() || '';
        this.nameInput.value = name || '';
        this.itemLimitSelect.value = (limit || 0).toString();
        updateFormState(true);

        // Notify of edit mode change
        this.dispatchEvent(new CustomEvent('categoryEditStarted', {
            detail: { id, name, limit }
        }));
    }

    async deleteCategory(id) {
        if (this.isLoading || !id) return;
        if (!window.confirm('Are you sure you want to delete this category?')) return;

        this.isLoading = true;
        try {
            await this.apiDelete(`/api/categories/${id}`);
            this.showMessage('Category deleted successfully', 'success', 'category');
            await this.loadCategories();

            // Notify of deletion
            document.dispatchEvent(new CustomEvent('categoryUpdated', {
                detail: { action: 'delete', categoryId: id }
            }));
        } catch (error) {
            console.error('Delete error:', error);
            this.showMessage(error.message || 'Error deleting category', 'error', 'category');
        } finally {
            this.isLoading = false;
        }
    }

    // Cleanup on destroy
    destroy() {
        this.cleanupEventListeners();
        document.removeEventListener('settingsUpdated', this.boundHandleSettingsUpdate);
    }
}