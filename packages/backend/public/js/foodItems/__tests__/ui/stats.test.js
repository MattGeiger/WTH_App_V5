import { updateStats } from '../../ui/stats.js';

describe('Stats UI Component', () => {
    let mockManager;
    const mockItems = [
        {
            id: 1,
            name: 'Item 1',
            inStock: true,
            itemLimit: 5
        },
        {
            id: 2,
            name: 'Item 2',
            inStock: false,
            itemLimit: 0
        },
        {
            id: 3,
            name: 'Item 3',
            inStock: true,
            itemLimit: 3
        }
    ];

    beforeEach(() => {
        // Set up our DOM environment
        document.body.innerHTML = '<div id="foodItemStats"></div>';
        mockManager = {
            foodItemStats: document.getElementById('foodItemStats'),
            lastUpdated: new Date('2024-12-27T12:00:00Z')
        };
    });

    it('should not update stats if stats container is missing', () => {
        const managerWithoutStats = { ...mockManager, foodItemStats: null };
        expect(() => updateStats(mockItems, managerWithoutStats)).not.toThrow();
    });

    it('should display correct total items count', () => {
        updateStats(mockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Total Items: 3');
    });

    it('should display correct in-stock count', () => {
        updateStats(mockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('In Stock: 2');
    });

    it('should display correct out-of-stock count', () => {
        updateStats(mockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Out of Stock: 1');
    });

    it('should display correct limited items count', () => {
        updateStats(mockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Limited: 2');
    });

    it('should display correct unlimited items count', () => {
        updateStats(mockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Unlimited: 1');
    });

    it('should display last updated timestamp', () => {
        updateStats(mockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Last Updated: ');
        expect(mockManager.foodItemStats.textContent).toContain(
            mockManager.lastUpdated.toLocaleString()
        );
    });

    it('should handle empty items array', () => {
        updateStats([], mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Total Items: 0');
        expect(mockManager.foodItemStats.textContent).toContain('In Stock: 0');
        expect(mockManager.foodItemStats.textContent).toContain('Out of Stock: 0');
    });

    it('should handle missing lastUpdated timestamp', () => {
        const managerWithoutTimestamp = { ...mockManager, lastUpdated: null };
        updateStats(mockItems, managerWithoutTimestamp);
        expect(mockManager.foodItemStats.textContent).not.toContain('Last Updated: ');
    });

    it('should create stats with correct DOM structure', () => {
        updateStats(mockItems, mockManager);
        
        const statsDiv = mockManager.foodItemStats.querySelector('.stats');
        expect(statsDiv).toBeTruthy();
        
        const statSpans = statsDiv.querySelectorAll('span');
        expect(statSpans.length).toBe(6); // 5 stats + timestamp
    });

    it('should handle all items being in stock', () => {
        const allInStockItems = mockItems.map(item => ({ ...item, inStock: true }));
        updateStats(allInStockItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('In Stock: 3');
        expect(mockManager.foodItemStats.textContent).toContain('Out of Stock: 0');
    });

    it('should handle all items being limited', () => {
        const allLimitedItems = mockItems.map(item => ({ ...item, itemLimit: 5 }));
        updateStats(allLimitedItems, mockManager);
        expect(mockManager.foodItemStats.textContent).toContain('Limited: 3');
        expect(mockManager.foodItemStats.textContent).toContain('Unlimited: 0');
    });
});