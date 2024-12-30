import CategoryManager from '../../CategoryManager';

describe('Category Module Integration', () => {
    let manager;
    const mockCategory = {
        id: 1,
        name: 'Existing Category',
        itemLimit: 5,
        created: new Date()
    };

    beforeEach(() => {
        document.body.innerHTML = `
            <form id="categoryForm">
                <input type="hidden" id="categoryId">
                <input type="text" id="categoryName">
                <select id="itemLimit"><option value="0">No Limit</option></select>
                <button type="submit">Add Category</button>
            </form>
            <table id="categoryTable"><tbody></tbody></table>
            <div id="categoryStats"></div>
        `;

        global.apiGet = jest.fn().mockResolvedValue([mockCategory]);
        global.apiPost = jest.fn().mockResolvedValue(mockCategory);
        global.apiPut = jest.fn().mockResolvedValue(mockCategory);
        global.apiDelete = jest.fn().mockResolvedValue({});
        global.showMessage = jest.fn();

        manager = new CategoryManager();
    });

    describe('End-to-End Category Management', () => {
        test('complete category lifecycle', async () => {
            // 1. Load existing categories
            await manager.loadCategories();
            expect(manager.tableBody.innerHTML).toContain('Existing Category');

            // 2. Create new category
            manager.nameInput.value = 'New Category';
            manager.itemLimitSelect.value = '10';
            await manager.handleSubmit(new Event('submit'));
            expect(global.apiPost).toHaveBeenCalled();

            // 3. Edit category
            manager.editCategory(1, 'Updated Category', 15);
            await manager.handleSubmit(new Event('submit'));
            expect(global.apiPut).toHaveBeenCalled();

            // 4. Delete category
            window.confirm = jest.fn().mockReturnValue(true);
            await manager.deleteCategory(1);
            expect(global.apiDelete).toHaveBeenCalled();
        });
    });

    describe('Component Integration', () => {
        test('form updates trigger table and stats refresh', async () => {
            manager.nameInput.value = 'Test Category';
            manager.itemLimitSelect.value = '5';
            await manager.handleSubmit(new Event('submit'));

            expect(manager.tableBody.innerHTML).toContain('Test Category');
            expect(manager.categoryStats.innerHTML).toContain('Total Categories: 1');
        });

        test('table sorting maintains data integrity', async () => {
            global.apiGet.mockResolvedValueOnce([
                { ...mockCategory, name: 'B Category' },
                { ...mockCategory, name: 'A Category' }
            ]);

            await manager.loadCategories();
            const headerCell = manager.tableBody.querySelector('th[data-sort-key="name"]');
            headerCell.click();

            const rows = manager.tableBody.querySelectorAll('tr');
            expect(rows[0].cells[0].textContent).toBe('A Category');
            expect(rows[1].cells[0].textContent).toBe('B Category');
        });

        test('form validation prevents invalid submissions', async () => {
            manager.nameInput.value = 'ab'; // Too short
            await manager.handleSubmit(new Event('submit'));

            expect(global.apiPost).not.toHaveBeenCalled();
            expect(showMessage).toHaveBeenCalledWith(
                expect.stringContaining('three characters'),
                'error',
                'category'
            );
        });
    });

    describe('Error Handling Integration', () => {
        test('handles API errors gracefully', async () => {
            global.apiGet.mockRejectedValueOnce(new Error('Network error'));
            await manager.loadCategories();

            expect(showMessage).toHaveBeenCalledWith(
                'Network error',
                'error',
                'category'
            );
        });

        test('maintains state on failed operations', async () => {
            global.apiPut.mockRejectedValueOnce(new Error('Update failed'));
            manager.editCategory(1, 'Updated Name', 6);
            await manager.handleSubmit(new Event('submit'));

            expect(showMessage).toHaveBeenCalledWith(
                'Update failed',
                'error',
                'category'
            );
        });
    });

    describe('Event Handling Integration', () => {
        test('settings updates trigger limit dropdown refresh', () => {
            document.dispatchEvent(new CustomEvent('settingsUpdated', {
                detail: { maxItemLimit: 10 }
            }));

            const options = manager.itemLimitSelect.options;
            expect(options.length).toBeGreaterThan(1);
            expect(options[0].value).toBe('0');
        });

        test('category updates trigger related component refreshes', () => {
            const event = new CustomEvent('categoryUpdated');
            document.dispatchEvent(event);

            expect(global.apiGet).toHaveBeenCalled();
        });
    });
});