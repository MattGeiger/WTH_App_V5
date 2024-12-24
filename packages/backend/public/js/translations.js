import { showMessage, apiGet, apiPut, apiDelete } from './utils.js';
import { SortableTable } from './utils/sortableTable.js';

export class TranslationManager {
    constructor() {
        this.translationTableBody = document.getElementById('translationTableBody');
        this.translationTypeRadios = document.querySelectorAll('input[name="translationType"]');
        this.filterLanguageSelect = document.getElementById('filterLanguage');
        this.sortableTable = new SortableTable('translationTableBody', this.getSortValue.bind(this));
        this.setupEventListeners();
        this.currentType = 'category';
        this.loadLanguagesFilter();
    }

    getSortValue(row, key) {
        const columnIndex = this.sortableTable.getColumnIndex(key);
        switch (key) {
            case 'originalText':
            case 'language':
            case 'translation':
            case 'type':
                return row.cells[columnIndex].textContent.toLowerCase();
            case 'created':
                return SortableTable.dateSortValue(row, columnIndex);
            default:
                return row.cells[columnIndex].textContent.toLowerCase();
        }
    }

    async loadLanguagesFilter() {
        try {
            const data = await apiGet('/api/languages');
            this.updateLanguageFilter(data.data);
        } catch (error) {
            showMessage(error.message, 'error', 'translation');
        }
    }

    updateLanguageFilter(languages) {
        if (!this.filterLanguageSelect) return;
        
        const currentValue = this.filterLanguageSelect.value;
        this.filterLanguageSelect.innerHTML = `
            <option value="">All Languages</option>
            ${languages
                .map(lang => `<option value="${lang.code}" ${lang.code === currentValue ? 'selected' : ''}>${lang.name}</option>`)
                .join('')}
        `;
    }

    isTypeCategory() {
        return this.currentType === 'category';
    }

    isTypeFoodItem() {
        return this.currentType === 'foodItem';
    }

    setupEventListeners() {
        this.translationTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.currentType = radio.value;
                this.loadTranslations();
            });
        });

        this.filterLanguageSelect.addEventListener('change', () => {
            this.loadTranslations();
        });

        document.addEventListener('languagesUpdated', () => {
            this.loadLanguagesFilter();
            this.loadTranslations();
        });

        this.addTableEventListeners();
    }

    addTableEventListeners() {
        this.translationTableBody.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('edit-translation-btn')) {
                await this.handleEditTranslation(target);
            } else if (target.classList.contains('delete-translation-btn')) {
                await this.handleDeleteTranslation(target);
            }
        });
    }

    async loadTranslations() {
        try {
            const type = this.currentType;
            const languageCode = this.filterLanguageSelect.value;
            const queryParams = new URLSearchParams({ type });
            if (languageCode) {
                queryParams.append('languageCode', languageCode);
            }
            
            const response = await apiGet(`/api/translations?${queryParams}`);
            this.displayTranslations(response.data);
        } catch (error) {
            showMessage(error.message, 'error', 'translation');
        }
    }

    displayTranslations(translations) {
        this.translationTableBody.innerHTML = '';
        if (!translations || translations.length === 0) {
            this.translationTableBody.innerHTML = '<tr><td colspan="6">No translations found</td></tr>';
            return;
        }
        translations.forEach(translation => {
            const row = this.createTranslationRow(translation);
            this.translationTableBody.appendChild(row);
        });
        
        // Initialize sorting controls after displaying data
        this.sortableTable.setupSortingControls();
    }

    createTranslationRow(translation) {
        const row = document.createElement('tr');
        const originalText = translation.category ? translation.category.name : 
                           (translation.foodItem ? translation.foodItem.name : '');
        
        row.innerHTML = `
            <td class="table__cell">${originalText}</td>
            <td class="table__cell">${translation.language.name}</td>
            <td class="table__cell">${translation.translatedText}</td>
            <td class="table__cell">${translation.category ? 'Category' : 'Food Item'}</td>
            <td class="table__cell">${new Date(translation.createdAt).toLocaleDateString()}</td>
            <td class="table__cell">
                <button class="edit-translation-btn" 
                        data-id="${translation.id}"
                        data-current-text="${translation.translatedText}">
                    Edit
                </button>
                <button class="delete-translation-btn" data-id="${translation.id}">
                    Delete
                </button>
            </td>
        `;
        
        return row;
    }

    async handleEditTranslation(button) {
        const id = button.dataset.id;
        const currentText = button.dataset.currentText;
        const newText = prompt('Enter new translation:', currentText);
        
        if (newText && newText !== currentText) {
            try {
                await apiPut(`/api/translations/${id}`, { translatedText: newText });
                showMessage('Translation updated successfully', 'success', 'translation');
                await this.loadTranslations();
            } catch (error) {
                showMessage(error.message, 'error', 'translation');
            }
        }
    }

    async handleDeleteTranslation(button) {
        const id = button.dataset.id;
        if (confirm('Are you sure you want to delete this translation?')) {
            try {
                await apiDelete(`/api/translations/${id}`);
                showMessage('Translation deleted successfully', 'success', 'translation');
                await this.loadTranslations();
            } catch (error) {
                showMessage(error.message, 'error', 'translation');
            }
        }
    }

    updateTranslationTargets() {
        this.loadTranslations();
    }
}