/**
 * Category Management System
 * Handles CRUD operations and UI updates for categories
 */

import { createFormLayout, updateFormState, clearForm } from './ui/forms.js';
import { createTableLayout, displayCategories, getSortValue } from './ui/table.js';
import { updateStats } from './ui/stats.js';
import { validateCategoryName } from './handlers/validation.js';
import { collectFormData, isValidFormData, prepareForSubmission } from './handlers/formData.js';
import { showMessage } from '../utils.js';

export class CategoryManager extends EventTarget {
    constructor(config = {}) {
        super();
        
        // Set loading state
        this.isLoading = false;
        this.lastUpdated = null;
        
        // Store form elements
        this.nameInput = null;
        this.itemLimitSelect = null;
        this.idInput = null;
        
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
        try {
            this.initializeElements();
            this.setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showMessage('Failed to initialize category manager', 'error', 'category');
        }
    }

    /**
     * Initializes or creates required DOM elements
     * @private
     */
    initializeElements() {
        // Ensure container exists
        let container = document.getElementById('categoryTableContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'categoryTableContainer';
            document.body.appendChild(container);
        }

        // Initialize form
        this.form = createFormLayout();
        
        // Store form element references
        this.nameInput = document.getElementById('categoryName');
        this.itemLimitSelect = document.getElementById('categoryItemLimit');
        this.idInput = document.getElementById('categoryId');

        // Initialize table
        let table = document.getElementById('categoryTable');
        if (!table) {
            table = createTableLayout();
            container.innerHTML = '';
            container.appendChild(table);
        }

        // Initialize tbody
        this.tableBody = table.querySelector('tbody');
        if (!this.tableBody) {
            this.tableBody = document.createElement('tbody');
            table.appendChild(this.tableBody);
        }

        // Initialize stats container
        this.categoryStats = document.getElementById('categoryStats');
        if (!this.categoryStats) {
            this.categoryStats = document.createElement('div');
            this.categoryStats.id = 'categoryStats';
            container.parentNode.insertBefore(this.categoryStats, container.nextSibling);
        }

        // Initialize sorting
        this.initializeSorting();

        // Initial data load if not in test environment
        if (process.env.NODE_ENV !== 'test') {
            this.loadCategories();
        }
    }

    /**
     * Sets up event listeners for form and table interactions
     * @private
     */
    setupEventListeners() {
        // Form events
        this.form.addEventListener('submit', this.boundHandleSubmit);
        this.form.addEventListener('reset', this.boundHandleReset);
        this.nameInput?.addEventListener('input', this.boundHandleNameInput);

        // Settings update event
        window.addEventListener('settingsUpdated', this.boundHandleSettingsUpdate);

        // Table sort events
        const headers = this.tableBody?.parentElement.querySelectorAll('th[data-sort-key]');
        headers?.forEach(header => {
            if (header.dataset.sortKey !== 'actions') {
                header.addEventListener('click', () => this.handleSort(header.dataset.sortKey));
            }
        });
    }

    /**
     * Handles form submission
     * @param {Event} event - Form submission event
     * @private
     */
    async handleSubmit(event) {
        event.preventDefault();
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            
            // Collect and validate form data
            const formData = collectFormData(this);
            if (!isValidFormData(formData)) {
                this.showMessage('Please enter a valid category name', 'error', 'category');
                return;
            }

            // Prepare data for submission
            const submissionData = prepareForSubmission(formData);
            
            // Validate category name
            const nameValidation = await validateCategoryName(submissionData.name, submissionData.id);
            if (!nameValidation.isValid) {
                this.showMessage(nameValidation.message, 'error', 'category');
                return;
            }

            // Submit to API
            const isUpdate = Boolean(submissionData.id);
            const response = await (isUpdate ? 
                this.apiPut(`/api/categories/${submissionData.id}`, submissionData) :
                this.apiPost('/api/categories', submissionData));

            // Handle response
            if (response.success) {
                this.showMessage(
                    `Category ${isUpdate ? 'updated' : 'created'} successfully`,
                    'success',
                    'category'
                );
                await this.loadCategories();
                this.form.reset();
            } else {
                throw new Error(response.message || 'Failed to save category');
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showMessage(
                `Failed to ${submissionData?.id ? 'update' : 'create'} category`,
                'error',
                'category'
            );
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Handles form reset
     * @param {Event} event - Form reset event
     * @private
     */
    handleReset(event) {
        updateFormState(this.form);
        this.dispatchEvent(new CustomEvent('categoryFormReset'));
    }

    /**
     * Handles name input changes
     * @param {Event} event - Input event
     * @private
     */
    handleNameInput(event) {
        const name = event.target.value.trim();
        this.dispatchEvent(new CustomEvent('categoryNameInput', {
            detail: { name }
        }));
    }

    /**
     * Handles settings updates
     * @param {CustomEvent} event - Settings update event
     * @private
     */
    handleSettingsUpdate(event) {
        this.loadCategories();
    }

    /**
     * Initializes sorting functionality
     * @private
     */
    initializeSorting() {
        this.sortableTable = {
            currentSort: { key: 'name', direction: 'asc' },
            sort: this.boundHandleSort
        };

        // Add sort attributes to headers
        const headers = this.tableBody.parentElement.querySelectorAll('th[data-sort-key]');
        headers.forEach(header => {
            if (header.dataset.sortKey !== 'actions') {
                header.classList.add('sortable');
                header.setAttribute('aria-sort', 'none');
            }
        });
    }

    /**
     * Handles table sorting
     * @param {string} key - Column key to sort by
     * @private
     */
    handleSort(key) {
        if (this.isLoading || !this.tableBody) return;
        
        const { currentSort } = this.sortableTable;
        const direction = key === currentSort.key && 
            currentSort.direction === 'asc' ? 'desc' : 'asc';

        try {
            // Get and sort rows
            const rows = Array.from(this.tableBody.querySelectorAll('tr'));
            if (!rows.length) return;

            // Sort rows
            const fragment = document.createDocumentFragment();
            rows.sort((a, b) => {
                const aVal = getSortValue(a, key);
                const bVal = getSortValue(b, key);
                return direction === 'asc' ? 
                    (aVal > bVal ? 1 : -1) : 
                    (aVal < bVal ? 1 : -1);
            }).forEach(row => fragment.appendChild(row.cloneNode(true)));

            // Update DOM
            this.tableBody.innerHTML = '';
            this.tableBody.appendChild(fragment);

            // Update state and indicators
            this.sortableTable.currentSort = { key, direction };
            this.updateSortIndicators(
                this.tableBody.parentElement.querySelector(`th[data-sort-key="${key}"]`)
            );
            
            // Dispatch sort event
            this.dispatchEvent(new CustomEvent('categoriesSorted', {
                detail: { key, direction }
            }));
        } catch (error) {
            console.error('Sort error:', error);
            this.showMessage('Failed to sort categories', 'error', 'category');
        }
    }

    /**
     * Updates sort indicators in table headers
     * @param {HTMLElement} activeHeader - Currently active header
     * @private
     */
    updateSortIndicators(activeHeader) {
        if (!this.tableBody) return;
        
        const headers = this.tableBody.parentElement.querySelectorAll('th[data-sort-key]');
        headers.forEach(header => {
            if (header === activeHeader) {
                const direction = this.sortableTable.currentSort.direction;
                header.setAttribute('aria-sort', direction);
                header.dataset.sortDirection = direction;
            } else {
                header.setAttribute('aria-sort', 'none');
                header.removeAttribute('data-sort-direction');
            }
        });
    }

    /**
     * Loads categories from the API
     * @returns {Promise<void>}
     */
    async loadCategories() {
        if (this.isLoading) return;

        try {
            this.isLoading = true;
            const response = await this.apiGet('/api/categories');
            
            if (response.success) {
                displayCategories(response.data, this.tableBody);
                updateStats(response.data, this.categoryStats);
                this.lastUpdated = new Date();
                
                this.dispatchEvent(new CustomEvent('categoriesLoaded', {
                    detail: { categories: response.data }
                }));
            } else {
                throw new Error(response.message || 'Failed to load categories');
            }
        } catch (error) {
            console.error('Load error:', error);
            this.showMessage('Failed to load categories', 'error', 'category');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Cleans up event listeners and resources
     */
    destroy() {
        // Remove form listeners
        this.form?.removeEventListener('submit', this.boundHandleSubmit);
        this.form?.removeEventListener('reset', this.boundHandleReset);
        this.nameInput?.removeEventListener('input', this.boundHandleNameInput);

        // Remove settings listener
        window.removeEventListener('settingsUpdated', this.boundHandleSettingsUpdate);

        // Remove sort listeners
        const headers = this.tableBody?.parentElement.querySelectorAll('th[data-sort-key]');
        headers?.forEach(header => {
            if (header.dataset.sortKey !== 'actions') {
                header.removeEventListener('click', () => this.handleSort(header.dataset.sortKey));
            }
        });
    }
}