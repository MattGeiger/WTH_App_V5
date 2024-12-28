export function updateStats(foodItems, manager) {
    if (!manager.foodItemStats) return;

    const stats = calculateStats(foodItems);
    const lastUpdatedStr = manager.lastUpdated ? 
        `Last Updated: ${manager.lastUpdated.toLocaleString()}` : '';

    manager.foodItemStats.innerHTML = `
        <div class="stats">
            <span>Total Items: ${stats.total}</span>
            <span>In Stock: ${stats.inStock}</span>
            <span>Out of Stock: ${stats.outOfStock}</span>
            <span>Limited: ${stats.limited}</span>
            <span>Unlimited: ${stats.unlimited}</span>
            <span>${lastUpdatedStr}</span>
        </div>
    `;
}

function calculateStats(foodItems) {
    const total = foodItems.length;
    const inStock = foodItems.filter(item => item.inStock).length;
    
    return {
        total,
        inStock,
        outOfStock: total - inStock,
        limited: foodItems.filter(item => item.itemLimit > 0).length,
        unlimited: foodItems.filter(item => !item.itemLimit).length
    };
}