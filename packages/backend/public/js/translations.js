import { showMessage, apiGet, apiPut, apiDelete, formatDate } from './utils.js';

export class TranslationManager {
    constructor() {
        this.typeRadios = document.getElementsByName('translationType');
        this.filterSelect = document.getElementById('filterLanguage');
        this.tableBody = document.getElementById('translationTableBody');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.typeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.loadTranslations());
        });
        this.filterSelect.addEventListener('change', () => this.loadTranslations());
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
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    getSelectedType() {
        return document.querySelector('input[name="translationType"]:checked').value;
    }

    displayTranslations(translations) {
        this.tableBody.innerHTML = translations.length ? 
            translations.map(translation => this.createTranslationRow(translation)).join('') :
            '<tr><td colspan="6">No translations found</td></tr>';
    }

    createTranslationRow(translation) {
        const originalText = translation.category ? 
            translation.category.name : 
            translation.foodItem?.name || 'Unknown';
        const type = translation.category ? 'Category' : 'Food Item';

        return `
            <tr>
                <td>${originalText}</td>
                <td>${translation.language.name}</td>
                <td>${translation.translatedText}</td>
                <td>${type}</td>
                <td>${formatDate(translation.createdAt)}</td>
                <td>
                    <button onclick="translationManager.editTranslation(${translation.id}, '${translation.translatedText.replace(/'/g, "\\'")}')">Edit</button>
                    <button onclick="translationManager.deleteTranslation(${translation.id})">Delete</button>
                </td>
            </tr>
        `;
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
}