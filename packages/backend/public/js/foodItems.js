import { showMessage, apiGet, apiPost, apiPut, apiDelete } from './utils.js';
import { managers } from './main.js';

export class FoodItemManager {
    constructor(settingsManager) {
        this.settingsManager = settingsManager;
        this.form = document.getElementById('foodItemForm');
        this.tableBody = document.getElementById('foodItemTableBody');
        this.itemLimitValue = document.getElementById('itemLimitValue');
        this.resetButton = document.getElementById('resetFoodItemForm');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
        this.resetButton.addEventListener('click', () => this.resetForm());
        this.itemLimitValue.addEventListener('input', this.handleLimitValidation.bind(this));
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

    async handleSubmit(e) {
        e.preventDefault();
        const data = this.collectFormData();
        const id = document.getElementById('foodItemId').value;

        try {
            if (id) {
                await apiPut(`/api/food-items/${id}`, data);
                showMessage('Food item updated successfully', 'success');
            } else {
                await apiPost('/api/food-items', data);
                showMessage('Food item created successfully', 'success');
            }
            this.resetForm();
            await this.loadFoodItems();
            if (managers.translations) {
                managers.translations.updateTranslationTargets();
            }
        } catch (error) {
            showMessage(error.message, 'error');
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
            name: document.getElementById('foodItemName').value.trim(),
            categoryId: parseInt(document.getElementById('foodItemCategory').value),
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
            const data = await apiGet('/api/food-items?includeOutOfStock=true');
            this.displayFoodItems(data.data);
            if (managers.translations?.isTypeFoodItem()) {
                managers.translations.updateTranslationTargets();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    displayFoodItems(foodItems) {
        this.tableBody.innerHTML = Array.isArray(foodItems) && foodItems.length > 0 ? 
            foodItems.map(item => this.createFoodItemRow(item)).join('') :
            '<tr><td colspan="7">No food items found</td></tr>';
    }

    createFoodItemRow(item) {
        const status = this.formatStatus(item);
        const dietary = this.formatDietary(item);
        const limitDisplay = this.formatLimit(item);

        const editData = {
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

        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.category?.name || 'Unknown'}</td>
                <td>${status || 'None'}</td>
                <td>${dietary || 'None'}</td>
                <td>${limitDisplay}</td>
                <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                <td>
                    <button onclick="managers.foodItems.editFoodItem('${JSON.stringify(editData).replace(/'/g, "\\'")}')">Edit</button>
                    <button onclick="managers.foodItems.deleteFoodItem(${item.id})">Delete</button>
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
        return item.itemLimit === 0 ?
            'No Limit' :
            `${item.itemLimit} ${item.limitType === 'perPerson' ? 'Per Person' : 'Per Household'}`;
    }

    editFoodItem(itemData) {
        const data = typeof itemData === 'string' ? JSON.parse(itemData) : itemData;
        this.populateForm(data);
        this.form.querySelector('button[type="submit"]').textContent = 'Update Food Item';
    }

    populateForm(data) {
        document.getElementById('foodItemId').value = data.id;
        document.getElementById('foodItemName').value = data.name;
        document.getElementById('foodItemCategory').value = data.categoryId;
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
        
        if (data.limitType === 'perPerson') {
            limitTypeInputs.forEach(r => { if (r.value === 'perPerson') r.checked = true; });
        } else {
            limitTypeInputs.forEach(r => { if (r.value === 'perHousehold') r.checked = true; });
        }

        this.itemLimitValue.value = Math.min(data.itemLimit, globalUpperLimit);
    }

    async deleteFoodItem(id) {
        if (!confirm('Are you sure you want to delete this food item?')) return;
        
        try {
            await apiDelete(`/api/food-items/${id}`);
            showMessage('Food item deleted successfully', 'success');
            await this.loadFoodItems();
            if (managers.translations) {
                await managers.translations.loadTranslations();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    resetForm() {
        this.form.reset();
        document.getElementById('foodItemId').value = '';
        this.form.querySelector('button[type="submit"]').textContent = 'Add Food Item';
    }
}