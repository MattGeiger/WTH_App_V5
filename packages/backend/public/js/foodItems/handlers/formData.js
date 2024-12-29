export function collectFormData(manager) {
    // Get limit type with fallback to perHousehold
    const limitTypeEl = document.querySelector('input[name="limitType"]:checked');
    const limitType = limitTypeEl?.value || 'perHousehold';
    
    // Get item limit with fallback to 0
    const itemLimit = parseInt(manager.itemLimitSelect?.value || '') || 0;

    // Get name with trimming and fallback to empty string
    const name = manager.nameInput?.value?.trim() || '';

    // Get category ID with fallback to 0
    const categoryId = parseInt(manager.categorySelect?.value || '') || 0;

    return {
        name,
        categoryId,
        itemLimit,
        limitType,
        ...collectStatusFlags(),
        ...collectDietaryFlags()
    };
}

function collectStatusFlags() {
    return {
        inStock: document.getElementById('foodItemInStock')?.checked || false,
        mustGo: document.getElementById('foodItemMustGo')?.checked || false,
        lowSupply: document.getElementById('foodItemLowSupply')?.checked || false,
        readyToEat: document.getElementById('foodItemReadyToEat')?.checked || false
    };
}

function collectDietaryFlags() {
    return {
        kosher: document.getElementById('foodItemKosher')?.checked || false,
        halal: document.getElementById('foodItemHalal')?.checked || false,
        vegetarian: document.getElementById('foodItemVegetarian')?.checked || false,
        vegan: document.getElementById('foodItemVegan')?.checked || false,
        glutenFree: document.getElementById('foodItemGlutenFree')?.checked || false,
        organic: document.getElementById('foodItemOrganic')?.checked || false
    };
}