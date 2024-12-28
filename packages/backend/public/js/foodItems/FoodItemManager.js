import { showMessage, apiGet, apiPost, apiPut, apiDelete } from '../utils.js';
import { managers } from '../main.js';
import { SortableTable } from '../utils/sortableTable.js';
import { handleSubmit } from './handlers/submit.js';
import { handleNameInput } from './handlers/validation.js';
import { createFormLayout } from './ui/forms.js';
import { displayFoodItems } from './ui/table.js';
import { updateStats } from './ui/stats.js';

export class FoodItemManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.form = document.getElementById('foodItemForm');
        this.tableBody = document.getElementById('foodItemTableBody');
        this.itemLimitSelect = document.getElementById('itemLimitSelect');
        this.resetButton = document.getElementById('resetFoodItemForm');
        this.categorySelect = document.getElementById('foodItemCategory');
        this.nameInput = document.getElementById('foodItemName');
        this.foodItemStats = document.getElementById('foodItemStats');
        this.sortableTable = new SortableTable('foodItemTableBody', this.getSortValue.bind(this));
        this.lastUpdated = null;

        this.initializeFormLayout();
        this.setupEventListeners();
        this.initializeItemLimitDropdown();
        this.init();
    }

    async init() {
        await this.loadCategories();
        if (this.categorySelect.options.length === 0) {
            this.displayNoCategories();
        }
    }

    initializeFormLayout() {
        createFormLayout(this);
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => handleSubmit(e, this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.nameInput.addEventListener('input', (e) => {
            this.nameInput.value = handleNameInput(this.nameInput);
        });
        this.addTableEventListeners();
        
        this.itemLimitSelect.addEventListener('change', () => {
            const limitTypeContainer = document.getElementById('limitTypeContainer');
            limitTypeContainer.style.display = this.itemLimitSelect.value === '0' ? 'none' : 'block';
        });
    }

    initializeItemLimitDropdown() {
        if (!this.itemLimitSelect) return;
        const globalLimit = this.settingsManager.getCurrentLimit();
        const options = ['<option value="0">No Limit</option>'];
        for (let i = 1; i <= globalLimit; i++) {
            options.push(`<option value="${i}">${i}</option>`);
        }
        this.itemLimitSelect.innerHTML = options.join('');
    }

    getSortValue(row, key) {
        const columnIndex = this.sortableTable.getColumnIndex(key);
        switch (key) {
            case 'name':
            case 'category':
                return row.cells[columnIndex].textContent.toLowerCase();
            case 'status':
            case 'dietary':
                return row.cells[columnIndex].textContent.toLowerCase();
            case 'limit':
                const limitText = row.cells[columnIndex].textContent;
                return limitText === 'No Limit' ? -1 : parseInt(limitText);
            case 'created':
                return SortableTable.dateSortValue(row, columnIndex);
            default:
                return row.cells[columnIndex].textContent.toLowerCase();
        }
    }

    addTableEventListeners() {
        this.tableBody.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('edit-food-item-btn')) {
                this.editFoodItem(target.getAttribute('data-item'));
            } else if (target.classList.contains('delete-food-item-btn')) {
                await this.deleteFoodItem(target.dataset.id);
            }
        });
    }

    async loadCategories() {
        try {
            const data = await apiGet('/api/categories');
            this.categorySelect.innerHTML = '';
            
            if (!data.data || data.data.length === 0) {
                this.displayNoCategories();
                return;
            }

            this.form.querySelector('button[type="submit"]').disabled = false;
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a category';
            this.categorySelect.appendChild(defaultOption);

            data.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                option.dataset.limit = category.itemLimit;
                this.categorySelect.appendChild(option);
            });
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
        }
    }

    displayNoCategories() {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Please create a category first';
        this.categorySelect.appendChild(option);
        
        this.form.querySelector('button[type="submit"]').disabled = true;
        showMessage('Please create at least one category before adding food items', 'warning', 'foodItem');
    }

    async loadFoodItems() {
        try {
            await this.loadCategories();
            const data = await apiGet('/api/food-items?includeOutOfStock=true');
            displayFoodItems(data.data, this);
            updateStats(data.data, this);
            this.lastUpdated = new Date();
            if (managers.translations) {
                await managers.translations.loadTranslations();
            }
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
        }
    }

    async createItem(data) {
        try {
            await apiPost('/api/food-items', data);
            showMessage('Food item created successfully', 'success', 'foodItem');
            return true;
        } catch (error) {
            showMessage(error.message || 'An error occurred', 'error', 'foodItem');
            return false;
        }
    }

    async updateItem(id, data) {
        try {
            await apiPut(`/api/food-items/${id}`, data);
            showMessage('Food item updated successfully', 'success', 'foodItem');
            return true;
        } catch (error) {
            showMessage(error.message || 'An error occurred', 'error', 'foodItem');
            return false;
        }
    }

    async deleteFoodItem(id) {
        if (!confirm('Are you sure you want to delete this food item?')) return;
        
        try {
            await apiDelete(`/api/food-items/${id}`);
            showMessage('Food item deleted successfully', 'success', 'foodItem');
            await this.loadFoodItems();
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
        }
    }

    editFoodItem(itemData) {
        const data = typeof itemData === 'string' ? JSON.parse(itemData) : itemData;
        this.populateForm(data);
        this.form.querySelector('button[type="submit"]').textContent = 'Update Food Item';
    }

    populateForm(data) {
        document.getElementById('foodItemId').value = data.id;
        this.nameInput.value = data.name;
        this.categorySelect.value = data.categoryId;
        Object.keys(data).forEach(key => {
            const element = document.getElementById(`foodItem${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element && element.type === 'checkbox') {
                element.checked = data[key];
            }
        });

        const limitTypeInputs = document.querySelectorAll('input[name="limitType"]');
        limitTypeInputs.forEach(r => {
            r.checked = (r.value === data.limitType);
        });

        this.itemLimitSelect.value = data.itemLimit;

        const limitTypeContainer = document.getElementById('limitTypeContainer');
        limitTypeContainer.style.display = data.itemLimit === 0 ? 'none' : 'block';
    }

    resetForm() {
        this.form.reset();
        document.getElementById('foodItemId').value = '';
        this.itemLimitSelect.value = '0';
        const limitTypeContainer = document.getElementById('limitTypeContainer');
        limitTypeContainer.style.display = 'none';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Food Item';
    }
}