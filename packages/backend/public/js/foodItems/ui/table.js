export function createFoodItemRow(item, manager) {
    const status = formatStatus(item);
    const dietary = formatDietary(item);
    const limitDisplay = formatLimit(item);
    const itemData = prepareItemData(item);

    return `
        <tr>
            <td class="table__cell">${item.name}</td>
            <td class="table__cell">${item.category?.name || 'Unknown'}</td>
            <td class="table__cell">${status || 'None'}</td>
            <td class="table__cell">${dietary || 'None'}</td>
            <td class="table__cell">${limitDisplay}</td>
            <td class="table__cell">${new Date(item.createdAt).toLocaleDateString()}</td>
            <td class="table__cell">
                <button class="edit-food-item-btn" data-item='${JSON.stringify(itemData)}'>
                    Edit
                </button>
                <button class="delete-food-item-btn" data-id="${item.id}">
                    Delete
                </button>
            </td>
        </tr>
    `;
}

function formatStatus(item) {
    return [
        item.inStock ? 'In Stock' : 'Out of Stock',
        item.mustGo ? 'Must Go' : '',
        item.lowSupply ? 'Low Supply' : '',
        item.readyToEat ? 'Ready to Eat' : ''
    ].filter(Boolean).join(', ');
}

function formatDietary(item) {
    return [
        item.kosher ? 'Kosher' : '',
        item.halal ? 'Halal' : '',
        item.vegetarian ? 'Vegetarian' : '',
        item.vegan ? 'Vegan' : '',
        item.glutenFree ? 'GF' : '',
        item.organic ? 'Organic' : ''
    ].filter(Boolean).join(', ');
}

function formatLimit(item) {
    if (item.itemLimit === 0) {
        return 'No Limit';
    }
    const limitType = item.limitType === 'perPerson' ? 'Per Person' : 'Per Household';
    return `${item.itemLimit} ${limitType}`;
}

function prepareItemData(item) {
    return {
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
}

export function displayFoodItems(foodItems, manager) {
    if (!Array.isArray(foodItems) || foodItems.length === 0) {
        manager.tableBody.innerHTML = '<tr><td colspan="7" class="table__cell--empty">No food items found</td></tr>';
        return;
    }

    manager.tableBody.innerHTML = foodItems
        .map(item => createFoodItemRow(item, manager))
        .join('');

    manager.sortableTable.setupSortingControls();
}