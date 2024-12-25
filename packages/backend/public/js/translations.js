import { showMessage, apiGet, apiPut, apiDelete, apiPost } from './utils.js';
import { SortableTable } from './utils/sortableTable.js';

export class TranslationManager {
    constructor() {
        this.translationTableBody = document.getElementById('translationTableBody');
        this.translationTypeRadios = document.querySelectorAll('input[name="translationType"]');
        this.filterLanguageSelect = document.getElementById('filterLanguage');
        this.customTextInput = document.getElementById('customText');
        this.addTranslationBtn = document.getElementById('addTranslation');
        this.translationStats = document.getElementById('translationStats');
        this.sortableTable = new SortableTable('translationTableBody', this.getSortValue.bind(this));
        this.setupEventListeners();
        this.currentType = 'category';
        this.lastUpdated = null;
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
            this.activeLanguages = data.data.filter(lang => lang.active);
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

    isTypeCustom() {
        return this.currentType === 'customInput';
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

        if (this.customTextInput) {
            this.customTextInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.handleCustomTranslation();
                }
            });
        }

        if (this.addTranslationBtn) {
            this.addTranslationBtn.addEventListener('click', () => {
                this.handleCustomTranslation();
            });
        }

        this.addTableEventListeners();
    }

    async handleCustomTranslation() {
        const text = this.customTextInput.value.trim();
        if (!text) {
            showMessage('Please enter text to translate', 'error', 'translation');
            return;
        }

        try {
            const activeLanguages = await apiGet('/api/languages/active');
            const translations = [];
            let errors = 0;

            for (const language of activeLanguages.data) {
                try {
                    const response = await apiPost('/api/translations/custom', {
                        text,
                        languageCode: language.code,
                        type: 'customInput'
                    });
                    translations.push(response);
                } catch (error) {
                    errors++;
                    console.error(`Failed to translate to ${language.code}:`, error);
                }
            }

            this.customTextInput.value = '';
            const successCount = translations.length;
            const message = errors > 0 ? 
                `Custom text translated to ${successCount} languages (${errors} failed)` :
                `Custom text translated to ${successCount} languages`;
            showMessage(message, errors > 0 ? 'warning' : 'success', 'translation');
            
            // Select custom type and reload translations
            const customRadio = Array.from(this.translationTypeRadios)
                .find(radio => radio.value === 'customInput');
            if (customRadio) {
                customRadio.checked = true;
                this.currentType = 'customInput';
            }
            await this.loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error', 'translation');
        }
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
            let queryParams = new URLSearchParams();
            
            // Only add type for category and foodItem
            if (!this.isTypeCustom()) {
                queryParams.append('type', this.currentType);
            }
            
            if (this.filterLanguageSelect.value) {
                queryParams.append('languageCode', this.filterLanguageSelect.value);
            }

            // For custom type, use a different endpoint
            const endpoint = this.isTypeCustom() ? 
                '/api/translations/custom' : 
                `/api/translations?${queryParams}`;

            const response = await apiGet(endpoint);
            this.displayTranslations(response.data);
            this.updateStats(response.data);
            this.lastUpdated = new Date();
        } catch (error) {
            if (this.isTypeCustom()) {
                // If no custom translations yet, show empty state
                this.displayTranslations([]);
                this.updateStats([]);
            } else {
                showMessage(error.message, 'error', 'translation');
            }
        }
    }

    updateStats(translations) {
        if (!this.translationStats) return;

        const uniqueLanguages = new Set(translations.map(t => t.language.code)).size;
        const uniqueTexts = new Set(translations.map(t => 
            t.category?.name || t.foodItem?.name || t.originalText
        )).size;
        const lastUpdatedStr = this.lastUpdated ? 
            `Last Updated: ${this.lastUpdated.toLocaleString()}` : '';

        this.translationStats.innerHTML = `
            <div class="stats">
                <span>Total Translations: ${translations.length}</span>
                <span>Unique Items: ${uniqueTexts}</span>
                <span>Languages: ${uniqueLanguages}</span>
                <span>${lastUpdatedStr}</span>
            </div>
        `;
    }

    displayTranslations(translations) {
        this.translationTableBody.innerHTML = '';
        if (!translations || translations.length === 0) {
            const message = this.isTypeCustom() ? 
                'No custom translations found' : 
                'No translations found';
            this.translationTableBody.innerHTML = `
                <tr><td colspan="6" class="table__cell--empty">${message}</td></tr>
            `;
            return;
        }
        translations.forEach(translation => {
            const row = this.createTranslationRow(translation);
            this.translationTableBody.appendChild(row);
        });
        
        this.sortableTable.setupSortingControls();
    }

    createTranslationRow(translation) {
        const row = document.createElement('tr');
        const originalText = translation.category ? translation.category.name : 
                           (translation.foodItem ? translation.foodItem.name : translation.originalText);
        
        row.innerHTML = `
            <td class="table__cell">${originalText}</td>
            <td class="table__cell">${translation.language.name}</td>
            <td class="table__cell">${translation.translatedText}</td>
            <td class="table__cell">${this.getTranslationType(translation)}</td>
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

    getTranslationType(translation) {
        if (translation.category) return 'Category';
        if (translation.foodItem) return 'Food Item';
        return 'Custom';
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