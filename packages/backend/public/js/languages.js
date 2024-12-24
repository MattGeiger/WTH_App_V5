import { showMessage, apiGet, apiPost } from './utils.js';
import { SortableTable } from './utils/sortableTable.js';

export class LanguageManager {
    constructor() {
        this.languageTableBody = document.getElementById('languageTableBody');
        this.updateLanguagesBtn = document.getElementById('updateLanguages');
        this.languageGrid = document.querySelector('.language-grid');
        this.filterSelect = document.getElementById('languageFilter');
        this.sortableTable = new SortableTable('languageTableBody', this.getSortValue.bind(this));
        this.setupEventListeners();
    }

    getSortValue(row, key) {
        const columnIndex = this.sortableTable.getColumnIndex(key);
        switch (key) {
            case 'code':
                return row.cells[columnIndex].textContent.toLowerCase();
            case 'name':
                return row.cells[columnIndex].textContent.toLowerCase();
            case 'status':
                return row.cells[columnIndex].textContent === 'Active' ? 1 : 0;
            default:
                return row.cells[columnIndex].textContent.toLowerCase();
        }
    }

    setupEventListeners() {
        this.updateLanguagesBtn.addEventListener('click', () => this.handleLanguageUpdate());
        this.filterSelect.addEventListener('change', () => this.loadLanguages());
    }

    async loadLanguages() {
        try {
            const data = await apiGet('/api/languages');
            const languages = this.filterLanguages(data.data);
            this.displayLanguages(languages);
            this.displayLanguageToggles(data.data);
        } catch (error) {
            showMessage(error.message, 'error', 'language');
        }
    }

    filterLanguages(languages) {
        const filterValue = this.filterSelect.value;
        switch (filterValue) {
            case 'active':
                return languages.filter(lang => lang.active);
            case 'inactive':
                return languages.filter(lang => !lang.active);
            default:
                return languages;
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

        // Initialize sorting controls after displaying data
        this.sortableTable.setupSortingControls();
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