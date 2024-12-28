export function collectFormData(manager) {
    const limitType = document.querySelector('input[name="limitType"]:checked')?.value || 'perHousehold';
    const itemLimit = parseInt(manager.itemLimitSelect.value) || 0;

    return {
        name: manager.nameInput.value.trim(),
        categoryId: parseInt(manager.categorySelect.value),
        itemLimit,
        limitType,
        ...collectStatusFlags(),
        ...collectDietaryFlags()
    };
}

function collectStatusFlags() {
    return {
        inStock: document.getElementById('foodItemInStock').checked,
        mustGo: document.getElementById('foodItemMustGo').checked,
        lowSupply: document.getElementById('foodItemLowSupply').checked,
        readyToEat: document.getElementById('foodItemReadyToEat').checked
    };
}

function collectDietaryFlags() {
    return {
        kosher: document.getElementById('foodItemKosher').checked,
        halal: document.getElementById('foodItemHalal').checked,
        vegetarian: document.getElementById('foodItemVegetarian').checked,
        vegan: document.getElementById('foodItemVegan').checked,
        glutenFree: document.getElementById('foodItemGlutenFree').checked,
        organic: document.getElementById('foodItemOrganic').checked
    };
}