document.addEventListener('DOMContentLoaded', () => {
    // Category Management Elements
    const categoryForm = document.getElementById('categoryForm');
    const categoryTableBody = document.getElementById('categoryTableBody');
    const messageArea = document.getElementById('messageArea');
    const resetFormButton = document.getElementById('resetForm');

    // Food Item Management Elements
    const foodItemForm = document.getElementById('foodItemForm');
    const foodItemTableBody = document.getElementById('foodItemTableBody');
    const foodItemCategorySelect = document.getElementById('foodItemCategory');
    const resetFoodItemFormButton = document.getElementById('resetFoodItemForm');

    // Translation Management Elements
    const translationForm = document.getElementById('translationForm');
    const translationTableBody = document.getElementById('translationTableBody');
    const translationTypeRadios = document.getElementsByName('translationType');
    const translationTarget = document.getElementById('translationTarget');
    const filterLanguage = document.getElementById('filterLanguage');
    const resetTranslationFormButton = document.getElementById('resetTranslationForm');

    // Load initial data
    loadCategories();
    loadFoodItems();
    loadTranslations();

    // Update translation target options when type changes
    translationTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateTranslationTargets);
    });

    // Update translations when language filter changes
    filterLanguage.addEventListener('change', loadTranslations);

    // Category Form Handlers
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('categoryName');
        const categoryId = document.getElementById('categoryId');
        const name = nameInput.value.trim();

        try {
            if (categoryId.value) {
                await updateCategory(categoryId.value, name);
                showMessage('Category updated successfully', 'success');
            } else {
                await createCategory(name);
                showMessage('Category created successfully', 'success');
            }
            resetForm();
            loadCategories();
            updateTranslationTargets();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    resetFormButton.addEventListener('click', resetForm);

    // Food Item Form Handlers
    foodItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('foodItemName');
        const categoryInput = document.getElementById('foodItemCategory');
        const foodItemId = document.getElementById('foodItemId');

        const foodItem = {
            name: nameInput.value.trim(),
            categoryId: parseInt(categoryInput.value),
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

        try {
            if (foodItemId.value) {
                await updateFoodItem(foodItemId.value, foodItem);
                showMessage('Food item updated successfully', 'success');
            } else {
                await createFoodItem(foodItem);
                showMessage('Food item created successfully', 'success');
            }
            resetFoodItemForm();
            loadFoodItems();
            updateTranslationTargets();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    resetFoodItemFormButton.addEventListener('click', resetFoodItemForm);

    // Translation Form Handlers
    translationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const translationId = document.getElementById('translationId');
        const type = document.querySelector('input[name="translationType"]:checked').value;
        const targetId = document.getElementById('translationTarget').value;
        const language = document.getElementById('language').value;
        const translatedText = document.getElementById('translatedText').value.trim();

        try {
            if (translationId.value) {
                await updateTranslation(translationId.value, { translatedText });
                showMessage('Translation updated successfully', 'success');
            } else {
                const endpoint = type === 'category' ? 
                    `/api/translations/category/${targetId}` : 
                    `/api/translations/food-item/${targetId}`;
                await createTranslation(endpoint, { language, translatedText });
                showMessage('Translation created successfully', 'success');
            }
            resetTranslationForm();
            loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    resetTranslationFormButton.addEventListener('click', resetTranslationForm);

    // Category API Functions
    async function createCategory(name) {
        const response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create category');
        }
        
        return response.json();
    }

    async function loadCategories() {
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to load categories');
            
            const data = await response.json();
            displayCategories(data.data);
            updateCategorySelect(data.data);
            if (document.querySelector('input[name="translationType"]:checked').value === 'category') {
                updateTranslationTargets();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function updateCategory(id, name) {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update category');
        }

        return response.json();
    }

    async function deleteCategory(id) {
        const response = await fetch(`/api/categories/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete category');
        }
    }

    // Food Item API Functions
    async function createFoodItem(foodItem) {
        const response = await fetch('/api/food-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foodItem)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create food item');
        }
        
        return response.json();
    }

    async function loadFoodItems() {
        try {
            const response = await fetch('/api/food-items?includeOutOfStock=true');
            if (!response.ok) throw new Error('Failed to load food items');
            
            const data = await response.json();
            displayFoodItems(data.data);
            if (document.querySelector('input[name="translationType"]:checked').value === 'foodItem') {
                updateTranslationTargets();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function updateFoodItem(id, foodItem) {
        const response = await fetch(`/api/food-items/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(foodItem)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update food item');
        }

        return response.json();
    }

    async function deleteFoodItem(id) {
        const response = await fetch(`/api/food-items/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete food item');
        }
    }

    // Translation API Functions
    async function createTranslation(endpoint, data) {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create translation');
        }

        return response.json();
    }

    async function loadTranslations() {
        try {
            const language = filterLanguage.value;
            const response = await fetch(language ? 
                `/api/translations?language=${language}` : 
                '/api/translations'
            );
            
            if (!response.ok) throw new Error('Failed to load translations');
            
            const data = await response.json();
            displayTranslations(data.data);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function updateTranslation(id, data) {
        const response = await fetch(`/api/translations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update translation');
        }

        return response.json();
    }

    async function deleteTranslation(id) {
        const response = await fetch(`/api/translations/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete translation');
        }
    }

// Category UI Helper Functions
function displayCategories(categories) {
    categoryTableBody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${new Date(category.createdAt).toLocaleDateString()}</td>
            <td>
                <button onclick="editCategory(${category.id}, '${category.name}')">Edit</button>
                <button onclick="deleteCategory(${category.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateCategorySelect(categories) {
    foodItemCategorySelect.innerHTML = categories.map(category => 
        `<option value="${category.id}">${category.name}</option>`
    ).join('');
}

// Food Item UI Helper Functions
function displayFoodItems(foodItems) {
    foodItemTableBody.innerHTML = Array.isArray(foodItems) && foodItems.length > 0 ? 
        foodItems.map(item => {
            const status = [
                item.inStock ? 'In Stock' : 'Out of Stock',
                item.mustGo ? 'Must Go' : '',
                item.lowSupply ? 'Low Supply' : '',
                item.readyToEat ? 'Ready to Eat' : ''
            ].filter(Boolean).join(', ');

            const dietary = [
                item.kosher ? 'Kosher' : '',
                item.halal ? 'Halal' : '',
                item.vegetarian ? 'Vegetarian' : '',
                item.vegan ? 'Vegan' : '',
                item.glutenFree ? 'GF' : '',
                item.organic ? 'Organic' : ''
            ].filter(Boolean).join(', ');

            return `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.category?.name || 'Unknown'}</td>
                    <td>${status || 'None'}</td>
                    <td>${dietary || 'None'}</td>
                    <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button onclick='editFoodItem(${JSON.stringify(item)})'>Edit</button>
                        <button onclick="deleteFoodItem(${item.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('') 
        : '<tr><td colspan="6">No food items found</td></tr>';
}

// Translation UI Helper Functions
function updateTranslationTargets() {
    const type = document.querySelector('input[name="translationType"]:checked').value;
    const items = type === 'category' ? 
        Array.from(foodItemCategorySelect.options).map(opt => ({ id: opt.value, name: opt.text })) :
        Array.from(document.querySelectorAll('#foodItemTableBody tr')).map(row => ({
            id: row.querySelector('button').onclick.toString().match(/\d+/)[0],
            name: row.cells[0].textContent
        }));

    translationTarget.innerHTML = items.map(item => 
        `<option value="${item.id}">${item.name}</option>`
    ).join('');
}

    function displayTranslations(translations) {
        translationTableBody.innerHTML = Array.isArray(translations) && translations.length > 0 ?
            translations.map(translation => {
                const itemName = translation.category ? 
                    translation.category.name : 
                    translation.foodItem.name;
                const type = translation.category ? 'Category' : 'Food Item';
                
                return `
                    <tr>
                        <td>${itemName}</td>
                        <td>${translation.language}</td>
                        <td>${translation.translatedText}</td>
                        <td>${type}</td>
                        <td>${new Date(translation.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button onclick="editTranslation(${translation.id}, '${translation.translatedText}')">Edit</button>
                            <button onclick="deleteTranslation(${translation.id})">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('') :
            '<tr><td colspan="6">No translations found</td></tr>';
    }

    // Shared UI Helper Functions
    function showMessage(message, type) {
        messageArea.textContent = message;
        messageArea.className = type;
        setTimeout(() => {
            messageArea.textContent = '';
            messageArea.className = '';
        }, 3000);
    }

    function resetForm() {
        categoryForm.reset();
        document.getElementById('categoryId').value = '';
        document.querySelector('button[type="submit"]').textContent = 'Add Category';
    }

    function resetFoodItemForm() {
        foodItemForm.reset();
        document.getElementById('foodItemId').value = '';
        document.querySelector('#foodItemForm button[type="submit"]').textContent = 'Add Food Item';
    }

    function resetTranslationForm() {
        translationForm.reset();
        document.getElementById('translationId').value = '';
        document.querySelector('#translationForm button[type="submit"]').textContent = 'Add Translation';
    }

    // Global handlers for Category operations
    window.editCategory = function(id, name) {
        document.getElementById('categoryId').value = id;
        document.getElementById('categoryName').value = name;
        document.querySelector('button[type="submit"]').textContent = 'Update Category';
    };

    window.deleteCategory = async function(id) {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            await deleteCategory(id);
            showMessage('Category deleted successfully', 'success');
            loadCategories();
            loadFoodItems();
            loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Global handlers for Food Item operations
    window.editFoodItem = function(itemData) {
        const data = typeof itemData === 'string' ? JSON.parse(itemData) : itemData;
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
        document.querySelector('#foodItemForm button[type="submit"]').textContent = 'Update Food Item';
    };

    window.deleteFoodItem = async function(id) {
        if (!confirm('Are you sure you want to delete this food item?')) return;
        
        try {
            await deleteFoodItem(id);
            showMessage('Food item deleted successfully', 'success');
            loadFoodItems();
            loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

    // Global handlers for Translation operations
    window.editTranslation = function(id, translatedText) {
        document.getElementById('translationId').value = id;
        document.getElementById('translatedText').value = translatedText;
        document.querySelector('#translationForm button[type="submit"]').textContent = 'Update Translation';
    };

    window.deleteTranslation = async function(id) {
        if (!confirm('Are you sure you want to delete this translation?')) return;
        
        try {
            await deleteTranslation(id);
            showMessage('Translation deleted successfully', 'success');
            loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };
});