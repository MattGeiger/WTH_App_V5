import { LanguageManager } from '../../../public/js/languages';
import { showMessage } from '../../../public/js/utils';

describe('LanguageManager', () => {
    let languageManager;

    beforeEach(() => {
        global.fetch.mockReset();
        languageManager = new LanguageManager();
    });

    test('loads and displays active languages', async () => {
        const mockLanguages = {
            data: [
                { id: 1, code: 'en', name: 'English', active: true },
                { id: 2, code: 'es', name: 'Spanish', active: true }
            ]
        };

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockLanguages)
            })
        );

        await languageManager.loadLanguages();
        expect(languageManager.tableBody.innerHTML).toContain('English');
        expect(languageManager.tableBody.innerHTML).toContain('Spanish');
    });

    test('updates language settings successfully', async () => {
        // Mock checkboxes
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = true;
        checkbox.value = 'en';
        checkbox.dataset.name = 'English';
        languageManager.languageGrid.appendChild(checkbox);

        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true })
            })
        );

        await languageManager.updateLanguageSettings();
        expect(global.fetch).toHaveBeenCalledWith(
            '/api/languages/bulk',
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('English')
            })
        );
        expect(showMessage).toHaveBeenCalledWith('Language settings updated successfully', 'success');
    });

    test('handles language load errors gracefully', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Network error'))
        );

        await languageManager.loadLanguages();
        expect(showMessage).toHaveBeenCalledWith('Network error', 'error');
    });
});