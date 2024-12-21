import { showMessage, apiGet, apiPut, apiDelete, formatDate } from './utils.js';
import { managers } from './main.js';

export class TranslationManager {
    constructor() {
        this.typeRadios = document.getElementsByName('translationType');
        this.filterSelect = document.getElementById('filterLanguage');
        this.tableBody = document.getElementById('translationTableBody');
        this.setupEventListeners();

        // Initialize language filter on construction
        this.initializeLanguageFilter();

        // Listen for when languages are updated in LanguageManager
        window.addEventListener('languagesUpdated', () => {
            this.initializeLanguageFilter();
        });
    }

    setupEventListeners() {
        // Radio buttons for translation type
        this.typeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.loadTranslations();
                this.updateTranslationTargets();
            });
        });

        // Language filter dropdown
        this.filterSelect.addEventListener('change', () => this.loadTranslations());
    }

    getSelectedType() {
        return document.querySelector('input[name="translationType"]:checked').value;
    }

    isTypeCategory() {
        return this.getSelectedType() === 'category';
    }

    isTypeFoodItem() {
        return this.getSelectedType() === 'foodItem';
    }

    async initializeLanguageFilter() {
        try {
            const data = await apiGet('/api/languages');
            const activeLanguages = data.data.filter(lang => lang.active);

            this.filterSelect.innerHTML = `
                <option value="">All Languages</option>
                ${activeLanguages.map(lang => 
                    `<option value="${lang.code}">${lang.name}</option>`
                ).join('')}
            `;
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async loadTranslations() {
        try {
            const type = this.getSelectedType();
            const language = this.filterSelect.value;
            let url = '/api/translations';

            if (language) {
                url += `?languageCode=${language}`;
            }
            if (type) {
                url += `${language ? '&' : '?'}type=${type}`;
            }

            const data = await apiGet(url);
            this.displayTranslations(data.data);
            this.updateTranslationTargets();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    displayTranslations(translations) {
        if (!Array.isArray(translations) || translations.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="6">No translations found</td></tr>';
            return;
        }

        // Build table rows with no inline onclick
        this.tableBody.innerHTML = translations
            .map(translation => this.createTranslationRow(translation))
            .join('');

        // Attach event listeners for edit/delete after rendering
        this.addTableEventListeners();
    }

    createTranslationRow(translation) {
        const originalText = translation.category
            ? translation.category.name
            : (translation.foodItem?.name || 'Unknown');

        const type = translation.category ? 'Category' : 'Food Item';
        const safeText = translation.translatedText.replace(/'/g, "\\'");

        return `
            <tr>
                <td>${originalText}</td>
                <td>${translation.language.name}</td>
                <td>${translation.translatedText}</td>
                <td>${type}</td>
                <td>${formatDate(translation.createdAt)}</td>
                <td>
                    <button class="edit-translation-btn"
                            data-id="${translation.id}"
                            data-current-text="${safeText}">
                        Edit
                    </button>
                    <button class="delete-translation-btn"
                            data-id="${translation.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }

    addTableEventListeners() {
        // Handle EDIT
        const editButtons = this.tableBody.querySelectorAll('.edit-translation-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id, 10);
                const currentText = btn.dataset.currentText || '';
                this.editTranslation(id, currentText);
            });
        });

        // Handle DELETE
        const deleteButtons = this.tableBody.querySelectorAll('.delete-translation-btn');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id, 10);
                this.deleteTranslation(id);
            });
        });
    }

    async editTranslation(id, currentText) {
        const newText = prompt('Enter new translation:', currentText);
        if (newText && newText !== currentText) {
            try {
                await apiPut(`/api/translations/${id}`, { translatedText: newText });
                showMessage('Translation updated successfully', 'success');
                await this.loadTranslations();
            } catch (error) {
                showMessage(error.message, 'error');
            }
        }
    }

    async deleteTranslation(id) {
        if (!confirm('Delete this translation? Note: It may be regenerated during the next translation update.')) {
            return;
        }

        try {
            await apiDelete(`/api/translations/${id}`);
            showMessage('Translation deleted successfully', 'success');
            await this.loadTranslations();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    updateTranslationTargets() {
        const type = this.getSelectedType();
        const select = document.getElementById('translationTarget');
        if (!select) return;

        let items = [];

        if (type === 'category') {
            // Reuse the categories from the foodItemCategory select
            const categorySelect = document.getElementById('foodItemCategory');
            if (categorySelect) {
                items = Array.from(categorySelect.options).map(opt => ({
                    id: opt.value,
                    name: opt.text
                }));
            }
        } else {
            // Attempt to read the #foodItemTableBody to gather IDs & names
            const foodItemTableBody = document.getElementById('foodItemTableBody');
            if (foodItemTableBody) {
                items = Array.from(foodItemTableBody.querySelectorAll('tr'))
                    .map(row => {
                        const nameCell = row.cells[0];
                        if (!nameCell) return null;

                        // In this approach, we'd have .edit-food-item-btn or similar
                        // but for simplicity, let's just read row 0 for name
                        const name = nameCell.textContent;
                        // If we wanted the ID, we'd store it in data-* somewhere
                        // This is just placeholder logic from before
                        return { id: row.dataset?.id || '', name };
                    })
                    .filter(item => item !== null);
            }
        }

        select.innerHTML = items
            .map(item => `<option value="${item.id}">${item.name}</option>`)
            .join('');
    }
}