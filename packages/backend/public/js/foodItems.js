import { showMessage, apiGet, apiPost, apiPut, apiDelete } from './utils.js';
import { managers } from './main.js';
import { SortableTable } from './utils/sortableTable.js';

export class FoodItemManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.form = document.getElementById('foodItemForm');
        this.tableBody = document.getElementById('foodItemTableBody');
        this.itemLimitValue = document.getElementById('itemLimitValue');
        this.resetButton = document.getElementById('resetFoodItemForm');
        this.categorySelect = document.getElementById('foodItemCategory');
        this.nameInput = document.getElementById('foodItemName');
        this.setupEventListeners();
        this.initSortableTable();
        this.init();
    }

    initSortableTable() {
        this.sortableTable = new SortableTable('foodItemTableBody', (row, key) => {
            const index = this.getColumnIndex(key);
            switch (key) {
                case 'name':
                case 'category':
                    return row.cells[index].textContent.toLowerCase();
                case 'status':
                case 'dietary':
                    return row.cells[index].textContent;
                case 'limit':
                    return SortableTable.numberSortValue(row, index);
                case 'created':
                    return SortableTable.dateSortValue(row, index);
                default:
                    return row.cells[index].textContent.toLowerCase();
            }
        });
        this.sortableTable.setupSortingControls();
    }

    getColumnIndex(key) {
        const headers = this.tableBody.closest('table').querySelectorAll('th');
        for (let i = 0; i < headers.length; i++) {
            if (headers[i].getAttribute('data-sort') === key) {
                return i;
            }
        }
        return 0;
    }

    async init() {
        await this.loadCategories();
        if (this.categorySelect.options.length === 0) {
            this.displayNoCategories();
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.itemLimitValue.addEventListener('input', this.handleLimitValidation.bind(this));
        this.nameInput.addEventListener('input', this.handleNameInput.bind(this));
        this.addTableEventListeners();
    }

    handleNameInput(e) {
        const input = e.target;
        const value = input.value;

        if (value.length > 36) {
            input.value = value.slice(0, 36);
            showMessage('Input cannot exceed 36 characters', 'warning', 'foodItem');
            return;
        }

        if (/\s{2,}/.test(value)) {
            input.value = value.replace(/\s{2,}/g, ' ');
        }

        const words = value.toLowerCase().split(' ');
        const uniqueWords = new Set(words);
        if (uniqueWords.size !== words.length) {
            showMessage('Input contains repeated words', 'warning', 'foodItem');
        }

        input.value = value
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    displayNoCategories() {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Please create a category first';
        this.categorySelect.appendChild(option);
        
        this.form.querySelector('button[type="submit"]').disabled = true;
        showMessage('Please create at least one category before adding food items', 'warning', 'foodItem');
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
                this.categorySelect.appendChild(option);
            });
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
        }
    }

    handleLimitValidation(e) {
        const globalUpperLimit = this.settingsManager.getCurrentLimit();
        let value = parseInt(e.target.value);

        if (isNaN(value) || value < 0) {
            e.target.value = 0;
        } else if (value > globalUpperLimit) {
            e.target.value = globalUpperLimit;
        }
    }

    addTableEventListeners() {
        this.tableBody.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('edit-food-item-btn')) {
                const itemData = target.getAttribute('data-item');
                this.editFoodItem(itemData);
            } else if (target.classList.contains('delete-food-item-btn')) {
                const id = target.dataset.id;
                await this.deleteFoodItem(id);
            }
        });
    }

    async handleSubmit(e) {
        e.preventDefault();
        const name = this.nameInput.value.trim();
        
        if (name.length < 3) {
            showMessage('Food item name must be at least three characters long', 'error', 'foodItem');
            return;
        }

        const letterCount = (name.match(/[a-zA-Z]/g) || []).length;
        if (letterCount < 3) {
            showMessage('Food item name must include at least three letters', 'error', 'foodItem');
            return;
        }

        const words = name.toLowerCase().split(' ');
        const uniqueWords = new Set(words);
        if (uniqueWords.size !== words.length) {
            showMessage('Food item name contains repeated words', 'error', 'foodItem');
            return;
        }

        const data = this.collectFormData();

        try {
            if (data.categoryId === '') {
                showMessage('Please select a category', 'error', 'foodItem');
                return;
            }

            const id = document.getElementById('foodItemId').value;
            if (id) {
                await apiPut(`/api/food-items/${id}`, data);
                showMessage('Food item updated successfully', 'success', 'foodItem');
            } else {
                await apiPost('/api/food-items', data);
                showMessage('Food item created successfully', 'success', 'foodItem');
            }
            this.resetForm();
            await this.loadFoodItems();
        } catch (error) {
            showMessage(error.message || 'An error occurred', 'error', 'foodItem');
        }
    }

    collectFormData() {
        const limitType = document.querySelector('input[name="limitType"]:checked').value;
        let itemLimit = parseInt(this.itemLimitValue.value);
        if (isNaN(itemLimit)) itemLimit = 0;
        if (itemLimit < 0) itemLimit = 0;

        const globalUpperLimit = this.settingsManager.getCurrentLimit();
        if (itemLimit > globalUpperLimit) itemLimit = globalUpperLimit;

        return {
            name: this.nameInput.value.trim(),
            categoryId: parseInt(this.categorySelect.value),
            itemLimit,
            limitType,
            inStock: document.getElementById('foodItemInStock').checked,
            mustGo: document.getElementById('foodItemMustGo').checked,
            lowSupply: document.getElementById('foodItemLowSupply').checked,
            kosher: document.getElementById('foodItemKosher').checked,
            halal: document.getElementById('foodItemHalal').checked,
            vegetarian: document.getElementById('foodItemVegetarian').checked,
            vegan: document.getElementById('foodItemVegan').checked,
            glutenFree: document.getElementById('foodItemGlutenFree').checked,
            organic: document.getElementById('foodItemOrganic').checked,
            readyToEat: document.getElementById('foodItemReadyToEat').checked
        };
    }

    async loadFoodItems() {
        try {
            await this.loadCategories();
            const data = await apiGet('/api/food-items?includeOutOfStock=true');
            this.displayFoodItems(data.data);
            if (this.sortableTable.currentSort.column) {
                this.sortableTable.sortTable();
            }
            if (managers.translations) {
                await managers.translations.loadTranslations();
            }
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
        }
    }

    displayFoodItems(foodItems) {
        if (!Array.isArray(foodItems) || foodItems.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7">No food items found</td></tr>';
            return;
        }

        this.tableBody.innerHTML = foodItems
            .map(item => this.createFoodItemRow(item))
            .join('');
    }

    createFoodItemRow(item) {
        const status = this.formatStatus(item);
        const dietary = this.formatDietary(item);
        const limitDisplay = this.formatLimit(item);

        const itemData = {
            id: item.id,
            name: item.name,
            categoryId: item.category?.id,
            itemLimit: item.itemLimit,
            limitType: item.limitType,
            inStock: item.inStock,
            mustGo: item.mustGo,
            lowSupply: item.lowSupply,
            kosher: item.kosher,
            halal: item.halal,
            vegetarian: item.vegetarian,
            vegan: item.vegan,
            glutenFree: item.glutenFree,
            organic: item.organic,
            readyToEat: item.readyToEat
        };

        const itemDataString = JSON.stringify(itemData).replace(/'/g, "\\'");

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.category?.name || 'Unknown'}</td>
                <td>${status || 'None'}</td>
                <td>${dietary || 'None'}</td>
                <td>${limitDisplay}</td>
                <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="edit-food-item-btn" data-item='${itemDataString}'>
                        Edit
                    </button>
                    <button class="delete-food-item-btn" data-id="${item.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }

    formatStatus(item) {
        return [
            item.inStock ? 'In Stock' : 'Out of Stock',
            item.mustGo ? 'Must Go' : '',
            item.lowSupply ? 'Low Supply' : '',
            item.readyToEat ? 'Ready to Eat' : ''
        ].filter(Boolean).join(', ');
    }

    formatDietary(item) {
        return [
            item.kosher ? 'Kosher' : '',
            item.halal ? 'Halal' : '',
            item.vegetarian ? 'Vegetarian' : '',
            item.vegan ? 'Vegan' : '',
            item.glutenFree ? 'GF' : '',
            item.organic ? 'Organic' : ''
        ].filter(Boolean).join(', ');
    }

    formatLimit(item) {
        if (item.itemLimit === 0) {
            return 'No Limit';
        }
        const limitType = item.limitType === 'perPerson' ? 'Per Person' : 'Per Household';
        return `${item.itemLimit} ${limitType}`;
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
        document.getElementById('foodItemInStock').checked = data.inStock;
        document.getElementById('foodItemMustGo').checked = data.mustGo;
        document.getElementById('foodItemLowSupply').checked = data.lowSupply;
        document.getElementById('foodItemKosher').checked = data.kosher;
        document.getElementById('foodItemHalal').checked = data.halal;
        document.getElementById('foodItemVegetarian').checked = data.vegetarian;
        document.getElementById('foodItemVegan').checked = data.vegan;
        document.getElementById('foodItemGlutenFree').checked = data.glutenFree;
        document.getElementById('foodItemOrganic').checked = data.organic;
        document.getElementById('foodItemReadyToEat').checked = data.readyToEat;

        const globalUpperLimit = this.settingsManager.getCurrentLimit();
        const limitTypeInputs = document.querySelectorAll('input[name="limitType"]');
        
        limitTypeInputs.forEach(r => {
            r.checked = (r.value === data.limitType);
        });

        const limitValue = Math.min(data.itemLimit, globalUpperLimit);
        this.itemLimitValue.value = limitValue;
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

    resetForm() {
        this.form.reset();
        document.getElementById('foodItemId').value = '';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Food Item';
    }
}