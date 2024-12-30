/**
 * CategoryManager class
 * Manages category-related functionality and coordinates between UI components
 */

import { showMessage, apiGet, apiPost, apiPut, apiDelete } from '../utils.js';
import { managers, EVENTS } from '../main.js';
import { handleSubmit } from './handlers/submit.js';
import { validateCategoryName } from './handlers/validation.js';
import { createFormLayout } from './ui/forms.js';
import { createTableLayout } from './ui/table.js';
import { createStatsView } from './ui/stats.js';
import { formatLimit } from './utils/formatters.js';

export class CategoryManager {
    constructor() {
        // Core properties
        this.lastUpdated = null;
        this.categories = [];
        
        // Initialize UI components
        this.initializeComponents();
        this.setupEventListeners();
    }

    initializeComponents() {
        // Initialize UI layouts
        this.form = createFormLayout();
        this.table = createTableLayout();
        this.stats = createStatsView();

        // Cache DOM elements
        this.nameInput = document.getElementById('categoryName');
        this.itemLimitSelect = document.getElementById('categoryItemLimit');
        this.resetButton = document.getElementById('resetForm');

        // Initialize dropdown with current settings
        this.initializeItemLimitDropdown();
    }

    initializeItemLimitDropdown() {
        if (!this.itemLimitSelect) return;

        const globalLimit = managers.settings.getCurrentLimit();
        let options = ['<option value="0">No Limit</option>'];
        
        for (let i = 1; i <= globalLimit; i++) {
            options.push(`<option value="${i}">${i}</option>`);
        }
        
        this.itemLimitSelect.innerHTML = options.join('');
    }

    setupEventListeners() {
        // Form events
        this.form.addEventListener('submit', (e) => handleSubmit(e, this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.nameInput.addEventListener('input', (e) => validateCategoryName(e, this));

        // Listen for global events
        document.addEventListener(EVENTS.SETTINGS_UPDATED, () => {
            this.initializeItemLimitDropdown();
        });
    }

    async loadCategories() {
        try {
            const response = await apiGet('/api/categories');
            if (response && response.data) {
                this.categories = response.data;
                this.table.displayCategories(this.categories);
                this.stats.updateStats(this.categories);
                this.lastUpdated = new Date();
            }
        } catch (error) {
            showMessage(error.message || 'Error loading categories', 'error', 'category');
        }
    }

    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await apiDelete(`/api/categories/${id}`);
            showMessage('Category deleted successfully', 'success', 'category');
            await this.loadCategories();
            
            document.dispatchEvent(new Event(EVENTS.CATEGORY_UPDATED));
        } catch (error) {
            showMessage(error.message || 'Error deleting category', 'error', 'category');
        }
    }

    editCategory(id, name, itemLimit) {
        document.getElementById('categoryId').value = id;
        this.nameInput.value = name || '';
        this.itemLimitSelect.value = itemLimit || 0;
        this.form.querySelector('button[type="submit"]').textContent = 'Update Category';
    }

    resetForm() {
        this.form.reset();
        document.getElementById('categoryId').value = '';
        this.itemLimitSelect.value = '0';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Category';
    }

    // Utility methods
    getCategories() {
        return this.categories;
    }

    getLastUpdated() {
        return this.lastUpdated;
    }

    formatLimit(limit) {
        return formatLimit(limit);
    }
}