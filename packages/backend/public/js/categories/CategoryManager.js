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

        // Initialize form with fallback
        try {
            this.form = createFormLayout();
        } catch (error) {
            console.warn('Form creation failed:', error);
            this.form = document.createElement('form');
            this.form.id = 'categoryForm';
        }

        // Initialize form elements with fallbacks
        this.nameInput = document.getElementById('categoryName');
        if (!this.nameInput) {
            this.nameInput = document.createElement('input');
            this.nameInput.id = 'categoryName';
            this.nameInput.type = 'text';
            this.form.appendChild(this.nameInput);
        }

        this.itemLimitSelect = document.getElementById('itemLimit');
        if (!this.itemLimitSelect) {
            this.itemLimitSelect = document.createElement('select');
            this.itemLimitSelect.id = 'itemLimit';
            this.form.appendChild(this.itemLimitSelect);
        }

        // Initialize table
        let table = document.getElementById('categoryTable');
        if (!table) {
            table = createTableLayout();
            container.innerHTML = '';
            container.appendChild(table);
        }

        // Initialize tbody with fallback
        this.tableBody = table.querySelector('tbody');
        if (!this.tableBody) {
            this.tableBody = document.createElement('tbody');
            table.appendChild(this.tableBody);
        }

        // Initialize stats container with fallback
        this.categoryStats = document.getElementById('categoryStats');
        if (!this.categoryStats) {
            this.categoryStats = document.createElement('div');
            this.categoryStats.id = 'categoryStats';
            container.parentNode.insertBefore(this.categoryStats, container.nextSibling);
        }

        // Initialize sorting
        this.initializeSorting();

        // Initial data load if not in test environment
        if (!process.env.NODE_ENV === 'test') {
            this.loadCategories();
        }
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

    handleSort(key) {
        if (this.isLoading || !this.tableBody) return;
        
        // Get current direction or set initial
        const { currentSort } = this.sortableTable;
        const direction = key === currentSort.key && 
            currentSort.direction === 'asc' ? 'desc' : 'asc';

        try {
            // Get and sort rows
            const rows = Array.from(this.tableBody.querySelectorAll('tr'));
            if (!rows.length) return;

            // Create fragment for better performance
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

    // ... rest of the class implementation remains the same ...
}