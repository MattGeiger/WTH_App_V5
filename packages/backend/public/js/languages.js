import { showMessage, apiGet, apiPost } from './utils.js';

export class LanguageManager {
    constructor() {
        this.languageTableBody = document.getElementById('languageTableBody');
        this.updateLanguagesBtn = document.getElementById('updateLanguages');
        this.languageGrid = document.querySelector('.language-grid');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.updateLanguagesBtn.addEventListener('click', () => this.handleLanguageUpdate());
    }

    async loadLanguages() {
        try {
            const data = await apiGet('/api/languages');
            this.displayLanguages(data.data);
            this.displayLanguageToggles(data.data);
        } catch (error) {
            showMessage(error.message, 'error', 'language');
        }
    }

    displayLanguageToggles(languages) {
        this.languageGrid.innerHTML = languages.map(lang => `
            <div class="language-toggle">
                <label>
                    <input type="checkbox" 
                           class="language-checkbox" 
                           data-code="${lang.code}"
                           data-name="${lang.name}"
                           ${lang.active ? 'checked' : ''}>
                    ${lang.name}
                </label>
            </div>
        `).join('');
    }

    async handleLanguageUpdate() {
        try {
            const languages = Array.from(document.querySelectorAll('.language-checkbox'))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => ({
                    code: checkbox.dataset.code,
                    name: checkbox.dataset.name
                }));

            await apiPost('/api/languages/bulk', { languages });
            showMessage('Language settings updated successfully', 'success', 'language');
            await this.loadLanguages();
            document.dispatchEvent(new Event('languagesUpdated'));
        } catch (error) {
            showMessage(error.message, 'error', 'language');
        }
    }

    displayLanguages(languages) {
        if (!Array.isArray(languages)) {
            showMessage('Invalid language data received', 'error', 'language');
            return;
        }

        this.languageTableBody.innerHTML = languages
            .map(lang => this.createLanguageRow(lang))
            .join('');
    }

    createLanguageRow(language) {
        return `
            <tr>
                <td class="table__cell">${language.code}</td>
                <td class="table__cell">${language.name}</td>
                <td class="table__cell">${language.active ? 'Active' : 'Inactive'}</td>
            </tr>
        `;
    }
}