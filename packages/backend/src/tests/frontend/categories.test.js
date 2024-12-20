import { CategoryManager } from '../../../public/js/categories';
import { showMessage } from '../../../public/js/utils';

describe('CategoryManager', () => {
    let categoryManager;

    beforeEach(() => {
        global.fetch.mockReset();
        categoryManager = new CategoryManager();
        // Mock translation manager
        global.translationManager = {
            updateTranslationTargets: jest.fn(),
            isTypeCategory: () => true
        };
    });

    test('creates category successfully', async () => {
        const mockCategory = { id: 1, name: 'Test Category', createdAt: new Date().toISOString() };
        document.getElementById('categoryName').value = mockCategory.name;

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ data: mockCategory })
            })
        );

        const event = { preventDefault: jest.fn() };
        await categoryManager.handleSubmit(event);

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/categories',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ name: mockCategory.name })
            })
        );
        expect(showMessage).toHaveBeenCalledWith('Category created successfully', 'success');
    });

    test('loads and displays categories', async () => {
        const mockCategories = {
            data: [
                { id: 1, name: 'Category 1', createdAt: new Date().toISOString() },
                { id: 2, name: 'Category 2', createdAt: new Date().toISOString() }
            ]
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockCategories)
            })
        );

        await categoryManager.loadCategories();
        expect(categoryManager.tableBody.innerHTML).toContain('Category 1');
        expect(categoryManager.tableBody.innerHTML).toContain('Category 2');
    });

    test('deletes category after confirmation', async () => {
        global.confirm = jest.fn(() => true);
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({ ok: true })
        );

        await categoryManager.deleteCategory(1);
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/categories/1',
            expect.objectContaining({ method: 'DELETE' })
        );
        expect(showMessage).toHaveBeenCalledWith('Category deleted successfully', 'success');
    });

    test('edits category successfully', () => {
        categoryManager.editCategory(1, 'Test Category');
        expect(document.getElementById('categoryId').value).toBe('1');
        expect(document.getElementById('categoryName').value).toBe('Test Category');
        expect(categoryManager.form.querySelector('button[type="submit"]').textContent)
            .toBe('Update Category');
    });
});