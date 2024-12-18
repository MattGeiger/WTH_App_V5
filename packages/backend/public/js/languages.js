import { showMessage, apiGet, apiPost } from './utils.js';

export class LanguageManager {
    static baseLanguages = {
        "ar": "Arabic",
        "bn": "Bengali",
        "de": "German",
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "hi": "Hindi",
        "id": "Indonesian",
        "it": "Italian",
        "ja": "Japanese",
        "ko": "Korean",
        "ms": "Malay",
        "pt": "Portuguese",
        "ru": "Russian",
        "sw": "Swahili",
        "ta": "Tamil",
        "th": "Thai",
        "tr": "Turkish",
        "uk": "Ukrainian",
        "ur": "Urdu",
        "vi": "Vietnamese",
        "zh": "Chinese"
        // Add others as needed
    };

    constructor() {
        this.languageGrid = document.querySelector('.language-grid');
        this.tableBody = document.getElementById('languageTableBody');
        this.updateButton = document.getElementById('updateLanguages');
        this.setupLanguageGrid();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.updateButton.addEventListener('click', () => this.updateLanguageSettings());
    }

    setupLanguageGrid() {
        this.languageGrid.innerHTML = Object.entries(LanguageManager.baseLanguages)
            .map(([code, name]) => `
                <div class="language-item">
                    <input type="checkbox" 
                           id="lang-${code}" 
                           value="${code}" 
                           data-name="${name}">
                    <label for="lang-${code}">${code.toUpperCase()} - ${name}</label>
                </div>
            `).join('');
    }

    async loadLanguages() {
        try {
            const data = await apiGet('/api/languages');
            this.displayActiveLanguages(data.data);
            this.updateCheckboxesFromActive(data.data);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    updateCheckboxesFromActive(activeLanguages) {
        activeLanguages.forEach(lang => {
            const checkbox = document.getElementById(`lang-${lang.code}`);
            if (checkbox) checkbox.checked = lang.active;
        });
    }

    displayActiveLanguages(languages) {
        this.tableBody.innerHTML = languages
            .filter(lang => lang.active)
            .map(lang => `
                <tr>
                    <td>${lang.code.toUpperCase()}</td>
                    <td>${lang.name}</td>
                    <td>Active</td>
                </tr>
            `).join('') || '<tr><td colspan="3">No active languages</td></tr>';
    }

    async updateLanguageSettings() {
        const selectedLanguages = Array.from(this.languageGrid.querySelectorAll('input[type="checkbox"]:checked'))
            .map(checkbox => ({
                code: checkbox.value,
                name: checkbox.dataset.name,
                active: true
            }));

        try {
            await apiPost('/api/languages/bulk', { languages: selectedLanguages });
            showMessage('Language settings updated successfully', 'success');
            await this.loadLanguages();

            // Dispatch event so TranslationManager knows languages were updated
            window.dispatchEvent(new CustomEvent('languagesUpdated'));
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }
}
