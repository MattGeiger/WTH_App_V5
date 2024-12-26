import { showMessage, apiGet, apiPost, apiPut, apiDelete } from './utils.js';
import { managers } from './main.js';
import { SortableTable } from './utils/sortableTable.js';

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

    initializeFormLayout() {
        const formSections = ['input', 'status', 'dietary'];
        formSections.forEach(section => {
            const container = document.createElement('div');
            container.className = `form-section ${section}-section`;
            this.form.appendChild(container);
        });

        this.appendToFormSection('input', [
            this.createFormGroup('Item Name:', this.nameInput),
            this.createFormGroup('Category:', this.categorySelect),
            this.createFormGroup('Item Limit:', this.itemLimitSelect),
            this.createLimitTypeGroup()
        ]);

        const statusFlags = this.createStatusFlagsGroup();
        this.appendToFormSection('status', [statusFlags]);

        const dietaryFlags = this.createDietaryFlagsGroup();
        this.appendToFormSection('dietary', [dietaryFlags]);
    }

    createFormGroup(label, element) {
        const group = document.createElement('div');
        group.className = 'form__group';
        
        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.className = 'required';
        
        group.appendChild(labelEl);
        group.appendChild(element);
        return group;
    }

    createLimitTypeGroup() {
        const container = document.createElement('div');
        container.id = 'limitTypeContainer';
        container.style.display = 'none';
        container.className = 'limit-type-group';

        const perHousehold = document.createElement('input');
        perHousehold.type = 'radio';
        perHousehold.name = 'limitType';
        perHousehold.value = 'perHousehold';
        perHousehold.id = 'perHousehold';
        perHousehold.checked = true;

        const perPerson = document.createElement('input');
        perPerson.type = 'radio';
        perPerson.name = 'limitType';
        perPerson.value = 'perPerson';
        perPerson.id = 'perPerson';

        const perHouseholdLabel = document.createElement('label');
        perHouseholdLabel.htmlFor = 'perHousehold';
        perHouseholdLabel.textContent = 'Per Household';

        const perPersonLabel = document.createElement('label');
        perPersonLabel.htmlFor = 'perPerson';
        perPersonLabel.textContent = 'Per Person';

        container.appendChild(perHousehold);
        container.appendChild(perHouseholdLabel);
        container.appendChild(perPerson);
        container.appendChild(perPersonLabel);

        return container;
    }

    createStatusFlagsGroup() {
        const container = document.createElement('div');
        container.className = 'status-flags-group';
        
        const flags = [
            { id: 'foodItemInStock', label: 'In Stock' },
            { id: 'foodItemMustGo', label: 'Must Go' },
            { id: 'foodItemLowSupply', label: 'Low Supply' },
            { id: 'foodItemReadyToEat', label: 'Ready to Eat' }
        ];

        flags.forEach(flag => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = flag.id;
            
            const label = document.createElement('label');
            label.htmlFor = flag.id;
            label.textContent = flag.label;
            
            container.appendChild(checkbox);
            container.appendChild(label);
        });

        return container;
    }

    createDietaryFlagsGroup() {
        const container = document.createElement('div');
        container.className = 'dietary-flags-group';
        
        const flags = [
            { id: 'foodItemKosher', label: 'Kosher' },
            { id: 'foodItemHalal', label: 'Halal' },
            { id: 'foodItemVegetarian', label: 'Vegetarian' },
            { id: 'foodItemVegan', label: 'Vegan' },
            { id: 'foodItemGlutenFree', label: 'Gluten Free' },
            { id: 'foodItemOrganic', label: 'Organic' }
        ];

        flags.forEach(flag => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = flag.id;
            
            const label = document.createElement('label');
            label.htmlFor = flag.id;
            label.textContent = flag.label;
            
            container.appendChild(checkbox);
            container.appendChild(label);
        });

        return container;
    }

    async init() {
        await this.loadCategories();
        if (this.categorySelect.options.length === 0) {
            this.displayNoCategories();
        }
    }

    initializeItemLimitDropdown() {
        if (!this.itemLimitSelect) return;

        const globalLimit = this.settingsManager.getCurrentLimit();
        let options = ['<option value="0">No Limit</option>'];
        
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

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.nameInput.addEventListener('input', this.handleNameInput.bind(this));
        this.addTableEventListeners();
        
        this.itemLimitSelect.addEventListener('change', () => {
            const limitTypeContainer = document.getElementById('limitTypeContainer');
            limitTypeContainer.style.display = this.itemLimitSelect.value === '0' ? 'none' : 'block';
        });
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
                option.dataset.limit = category.itemLimit;
                this.categorySelect.appendChild(option);
            });
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
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
        const limitType = document.querySelector('input[name="limitType"]:checked')?.value || 'perHousehold';
        const itemLimit = parseInt(this.itemLimitSelect.value) || 0;

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
            this.updateStats(data.data);
            this.lastUpdated = new Date();
            if (managers.translations) {
                await managers.translations.loadTranslations();
            }
        } catch (error) {
            showMessage(error.message, 'error', 'foodItem');
        }
    }

    updateStats(foodItems) {
        if (!this.foodItemStats) return;

        const totalItems = foodItems.length;
        const inStock = foodItems.filter(item => item.inStock).length;
        const outOfStock = totalItems - inStock;
        const limited = foodItems.filter(item => item.itemLimit > 0).length;
        const unlimited = totalItems - limited;
        const lastUpdatedStr = this.lastUpdated ? 
            `Last Updated: ${this.lastUpdated.toLocaleString()}` : '';

        this.foodItemStats.innerHTML = `
            <div class="stats">
                <span>Total Items: ${totalItems}</span>
                <span>In Stock: ${inStock}</span>
                <span>Out of Stock: ${outOfStock}</span>
                <span>Limited: ${limited}</span>
                <span>Unlimited: ${unlimited}</span>
                <span>${lastUpdatedStr}</span>
            </div>
        `;
    }

    displayFoodItems(foodItems) {
        if (!Array.isArray(foodItems) || foodItems.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7" class="table__cell--empty">No food items found</td></tr>';
            return;
        }

        this.tableBody.innerHTML = foodItems
            .map(item => this.createFoodItemRow(item))
            .join('');

        this.sortableTable.setupSortingControls();
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
                <td class="table__cell">${item.name}</td>
                <td class="table__cell">${item.category?.name || 'Unknown'}</td>
                <td class="table__cell">${status || 'None'}</td>
                <td class="table__cell">${dietary || 'None'}</td>
                <td class="table__cell">${limitDisplay}</td>
                <td class="table__cell">${new Date(item.createdAt).toLocaleDateString()}</td>
                <td class="table__cell">
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

        const limitTypeInputs = document.querySelectorAll('input[name="limitType"]');
        limitTypeInputs.forEach(r => {
            r.checked = (r.value === data.limitType);
        });

        this.itemLimitSelect.value = data.itemLimit;

        const limitTypeContainer = document.getElementById('limitTypeContainer');
        limitTypeContainer.style.display = data.itemLimit === 0 ? 'none' : 'block';
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
        this.itemLimitSelect.value = '0';
        const limitTypeContainer = document.getElementById('limitTypeContainer');
        limitTypeContainer.style.display = 'none';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Food Item';
    }

    appendToFormSection(section, elements) {
        const container = this.form.querySelector(`.${section}-section`);
        if (container) {
            elements.forEach(el => container.appendChild(el));
        }
    }
}