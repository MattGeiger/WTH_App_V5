import { TranslationManager } from '../../../public/js/translations';
import { showMessage } from '../../../public/js/utils';

describe('TranslationManager', () => {
    let translationManager;

    beforeEach(() => {
        global.fetch.mockReset();
        translationManager = new TranslationManager();
        // Set up initial radio button state
        document.querySelector('input[name="translationType"][value="category"]').checked = true;
    });

    test('initializes language filter with active languages', async () => {
        const mockLanguages = {
            data: [
                { code: 'en', name: 'English', active: true },
                { code: 'es', name: 'Spanish', active: true },
                { code: 'fr', name: 'French', active: false }
            ]
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockLanguages)
            })
        );

        await translationManager.initializeLanguageFilter();
        const options = Array.from(translationManager.filterSelect.options);
        expect(options.length).toBe(3); // All Languages + 2 active languages
        expect(options[1].value).toBe('en');
        expect(options[2].value).toBe('es');
    });

    test('loads translations with language filter', async () => {
        translationManager.filterSelect.value = 'es';
        const mockTranslations = {
            data: [
                {
                    id: 1,
                    category: { name: 'Category 1' },
                    language: { name: 'Spanish' },
                    translatedText: 'Categoría 1',
                    createdAt: new Date().toISOString()
                }
            ]
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockTranslations)
            })
        );

        await translationManager.loadTranslations();
        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('languageCode=es'));
        expect(translationManager.tableBody.innerHTML).toContain('Categoría 1');
    });

    test('handles translation type switch', async () => {
        const typeRadio = document.querySelector('input[name="translationType"][value="foodItem"]');
        const mockTranslations = { data: [] };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockTranslations)
            })
        );

        typeRadio.checked = true;
        typeRadio.dispatchEvent(new Event('change'));

        expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('type=foodItem'));
    });

    test('creates translation row correctly', () => {
        const mockTranslation = {
            id: 1,
            category: { name: 'Test Category' },
            language: { name: 'Spanish' },
            translatedText: 'Categoría de Prueba',
            createdAt: new Date().toISOString()
        };

        const row = translationManager.createTranslationRow(mockTranslation);
        expect(row).toContain('Test Category');
        expect(row).toContain('Spanish');
        expect(row).toContain('Categoría de Prueba');
        expect(row).toContain('Category');
    });

    test('handles translation deletion after confirmation', async () => {
        global.confirm = jest.fn(() => true);
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({ ok: true })
        );

        await translationManager.deleteTranslation(1);
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/translations/1',
            expect.objectContaining({ method: 'DELETE' })
        );
        expect(showMessage).toHaveBeenCalledWith('Translation deleted successfully', 'success');
    });
});