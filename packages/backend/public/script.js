document.addEventListener('DOMContentLoaded', () => {
    const messageArea = document.getElementById('messageArea');

    // Global limit elements
    const globalUpperLimitInput = document.getElementById('globalUpperLimit');
    const saveGlobalLimitBtn = document.getElementById('saveGlobalLimit');

    // Ensure input is a number and min = 1
    globalUpperLimitInput.setAttribute('type', 'number');
    globalUpperLimitInput.setAttribute('min', '1');

    // ISO languages list (shortened for demo; expand as needed)
    const isoLanguages = {
        "af": "Afrikaans",
        "ar": "Arabic",
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "ru": "Russian",
        "uk": "Ukrainian",
        "zh": "Chinese",
        "vi": "Vietnamese"
    };

    // Language Management Elements
    const languageForm = document.getElementById('languageForm');
    const isoLanguageSelect = document.getElementById('isoLanguageSelect');
    const languageNameInput = document.getElementById('languageName');
    const languageActiveCheckbox = document.getElementById('languageActive');
    const languageTableBody = document.getElementById('languageTableBody');

    // Category Management
    const categoryForm = document.getElementById('categoryForm');
    const categoryTableBody = document.getElementById('categoryTableBody');
    const resetFormButton = document.getElementById('resetForm');

    // Food Items
    const foodItemForm = document.getElementById('foodItemForm');
    const foodItemTableBody = document.getElementById('foodItemTableBody');
    const foodItemCategorySelect = document.getElementById('foodItemCategory');
    const resetFoodItemFormButton = document.getElementById('resetFoodItemForm');

    // Translations
    const translationForm = document.getElementById('translationForm');
    const translationTableBody = document.getElementById('translationTableBody');
    const translationTypeRadios = document.getElementsByName('translationType');
    const translationTarget = document.getElementById('translationTarget');
    const filterLanguage = document.getElementById('filterLanguage');
    const resetTranslationFormButton = document.getElementById('resetTranslationForm');

    // Populate ISO language select
    populateIsoLanguageSelect();

    // Initial loads
    loadGlobalSettings();
    loadLanguages();
    loadCategories();
    loadFoodItems();
    loadTranslations();

    // Event Listeners
    saveGlobalLimitBtn.addEventListener('click', saveGlobalSettings);

    // Prevent global upper limit from going below 1
    globalUpperLimitInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        if (value < 1) {
            e.target.value = 1;
        }
    });

    isoLanguageSelect.addEventListener('change', () => {
        const code = isoLanguageSelect.value;
        languageNameInput.value = isoLanguages[code] || '';
    });

    languageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = isoLanguageSelect.value;
        const name = languageNameInput.value.trim();
        const active = languageActiveCheckbox.checked;

        try {
            await createOrUpdateLanguage({ code, name, active });
            showMessage('Language saved successfully', 'success');
            languageForm.reset();
            languageActiveCheckbox.checked = false;
            loadLanguages();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

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

    const itemLimitValue = document.getElementById('itemLimitValue');
    itemLimitValue.addEventListener('input', (e) => {
        const globalUpperLimit = parseInt(document.getElementById('globalUpperLimit').value) || 40;
        let value = parseInt(e.target.value);
        if (isNaN(value) || value < 0) {
            e.target.value = 0;
        } else if (value > globalUpperLimit) {
            e.target.value = globalUpperLimit;
        }
    });

    foodItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('foodItemName');
        const categoryInput = document.getElementById('foodItemCategory');
        const foodItemId = document.getElementById('foodItemId');
        const globalUpperLimit = parseInt(document.getElementById('globalUpperLimit').value) || 40;

        const limitType = document.querySelector('input[name="limitType"]:checked').value;
        let itemLimit = parseInt(document.getElementById('itemLimitValue').value);
        if (isNaN(itemLimit)) itemLimit = 0;
        if (itemLimit < 0) itemLimit = 0;
        if (itemLimit > globalUpperLimit) itemLimit = globalUpperLimit;

        const foodItem = {
            name: nameInput.value.trim(),
            categoryId: parseInt(categoryInput.value),
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

    translationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const translationId = document.getElementById('translationId');
        const type = document.querySelector('input[name="translationType"]:checked').value;
        const targetId = document.getElementById('translationTarget').value;
        const languageCode = document.getElementById('language').value;
        const translatedText = document.getElementById('translatedText').value.trim();

        try {
            if (translationId.value) {
                await updateTranslation(translationId.value, { translatedText });
                showMessage('Translation updated successfully', 'success');
            } else {
                const endpoint = type === 'category' ? 
                    `/api/translations/category/${targetId}` : 
                    `/api/translations/food-item/${targetId}`;
                await createTranslation(endpoint, { languageCode, translatedText });
                showMessage('Translation created successfully', 'success');
            }
            resetTranslationForm();
            loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
    resetTranslationFormButton.addEventListener('click', resetTranslationForm);

    translationTypeRadios.forEach(radio => {
        radio.addEventListener('change', updateTranslationTargets);
    });
    filterLanguage.addEventListener('change', loadTranslations);

    document.getElementById('translationForm').addEventListener('change', async (e) => {
        if (e.target.id === 'translatedText') return;
        const text = document.getElementById('translationTarget').selectedOptions[0].text;
        const languageCode = document.getElementById('language').value;
        
        try {
            const result = await testTranslation(text, languageCode);
            document.getElementById('translatedText').value = result.data.translation;
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Helper Functions

    async function loadGlobalSettings() {
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Failed to load settings');
            const data = await response.json();
            globalUpperLimitInput.value = data.data.globalUpperLimit;
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function saveGlobalSettings() {
        const globalUpperLimit = parseInt(globalUpperLimitInput.value);
        if (isNaN(globalUpperLimit) || globalUpperLimit < 1) {
            showMessage('Global upper limit must be at least 1', 'error');
            globalUpperLimitInput.value = 1;
            return;
        }

        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ globalUpperLimit })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save settings');
            }
            showMessage('Global upper limit saved successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    function populateIsoLanguageSelect() {
        isoLanguageSelect.innerHTML = Object.keys(isoLanguages).map(code => 
            `<option value="${code}">${code} (${isoLanguages[code]})</option>`
        ).join('');
        isoLanguageSelect.value = 'en';
        languageNameInput.value = isoLanguages['en'] || '';
    }

    async function createOrUpdateLanguage(data) {
        const response = await fetch('/api/languages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to save language');
        }
        return response.json();
    }

    async function loadLanguages() {
        try {
            const response = await fetch('/api/languages');
            if (!response.ok) throw new Error('Failed to load languages');
            const data = await response.json();
            displayLanguages(data.data);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function deleteLanguage(id) {
        const response = await fetch(`/api/languages/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete language');
        }
    }

    function displayLanguages(languages) {
        languageTableBody.innerHTML = Array.isArray(languages) && languages.length > 0 ?
            languages.map(lang => `
                <tr>
                    <td>${lang.code}</td>
                    <td>${lang.name}</td>
                    <td>${lang.active}</td>
                    <td>
                        <button onclick="deleteLang(${lang.id})">Delete</button>
                    </td>
                </tr>
            `).join('') : '<tr><td colspan="4">No languages found</td></tr>';
    }

    window.deleteLang = async function(id) {
        if (!confirm('Are you sure you want to delete this language?')) return;
        try {
            await deleteLanguage(id);
            showMessage('Language deleted successfully', 'success');
            loadLanguages();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    };

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
            const url = language ? `/api/translations?languageCode=${language}` : '/api/translations';
            const response = await fetch(url);
            
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

    async function testTranslation(text, languageCode) {
        const response = await fetch('/api/categories/test-translation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, language: languageCode })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Translation test failed');
        }

        return response.json();
    }

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

                let limitDisplay;
                if (item.itemLimit === 0) {
                    limitDisplay = 'No Limit';
                } else {
                    limitDisplay = `${item.itemLimit} ${item.limitType === 'perPerson' ? 'Per Person' : 'Per Household'}`;
                }

                return `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.category?.name || 'Unknown'}</td>
                        <td>${status || 'None'}</td>
                        <td>${dietary || 'None'}</td>
                        <td>${limitDisplay}</td>
                        <td>${new Date(item.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button onclick='editFoodItem(${JSON.stringify(item)})'>Edit</button>
                            <button onclick="deleteFoodItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `;
            }).join('')
            : '<tr><td colspan="7">No food items found</td></tr>';
    }

    function updateTranslationTargets() {
        const type = document.querySelector('input[name="translationType"]:checked').value;
        let items = [];
        if (type === 'category') {
            items = Array.from(foodItemCategorySelect.options).map(opt => ({ id: opt.value, name: opt.text }));
        } else {
            items = Array.from(foodItemTableBody.querySelectorAll('tr')).map(row => {
                const editButton = row.querySelector('button');
                const idMatch = editButton.onclick.toString().match(/\d+/);
                const id = idMatch ? idMatch[0] : null;
                const name = row.cells[0].textContent;
                return { id, name };
            }).filter(i => i.id !== null);
        }

        translationTarget.innerHTML = items.map(item => 
            `<option value="${item.id}">${item.name}</option>`
        ).join('');
    }

    function displayTranslations(translations) {
        translationTableBody.innerHTML = Array.isArray(translations) && translations.length > 0 ?
            translations.map(translation => {
                const itemName = translation.category ? 
                    translation.category.name : 
                    translation.foodItem?.name || 'Unknown';
                const type = translation.category ? 'Category' : 'Food Item';
                const langCode = translation.language ? translation.language.code : 'N/A';

                return `
                    <tr>
                        <td>${itemName}</td>
                        <td>${langCode}</td>
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
        categoryForm.querySelector('button[type="submit"]').textContent = 'Add Category';
    }

    function resetFoodItemForm() {
        foodItemForm.reset();
        document.getElementById('foodItemId').value = '';
        foodItemForm.querySelector('button[type="submit"]').textContent = 'Add Food Item';
    }

    function resetTranslationForm() {
        translationForm.reset();
        document.getElementById('translationId').value = '';
        translationForm.querySelector('button[type="submit"]').textContent = 'Add/Update Translation';
    }

    window.editCategory = function(id, name) {
        document.getElementById('categoryId').value = id;
        document.getElementById('categoryName').value = name;
        categoryForm.querySelector('button[type="submit"]').textContent = 'Update Category';
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

        const globalUpperLimit = parseInt(document.getElementById('globalUpperLimit').value) || 40;
        const limitTypeInputs = document.querySelectorAll('input[name="limitType"]');
        const itemLimitValue = document.getElementById('itemLimitValue');

        // If itemLimit > globalUpperLimit, reduce it
        if (data.itemLimit > globalUpperLimit) data.itemLimit = globalUpperLimit;

        // If limitType is perPerson or perHousehold, set radios accordingly
        if (data.limitType === 'perPerson') {
            limitTypeInputs.forEach(r => { if (r.value === 'perPerson') r.checked = true; });
        } else {
            // Default to perHousehold if not specified
            limitTypeInputs.forEach(r => { if (r.value === 'perHousehold') r.checked = true; });
        }

        itemLimitValue.value = data.itemLimit;
        foodItemForm.querySelector('button[type="submit"]').textContent = 'Update Food Item';
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

    window.editTranslation = function(id, translatedText) {
        document.getElementById('translationId').value = id;
        document.getElementById('translatedText').value = translatedText;
        translationForm.querySelector('button[type="submit"]').textContent = 'Update Translation';
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
