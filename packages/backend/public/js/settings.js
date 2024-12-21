import { showMessage, apiGet, apiPost } from './utils.js';

export class SettingsManager {
    constructor() {
        this.globalUpperLimitInput = document.getElementById('globalUpperLimit');
        this.saveGlobalLimitBtn = document.getElementById('saveGlobalLimit');
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.saveGlobalLimitBtn.addEventListener('click', () => this.saveGlobalSettings());
        this.globalUpperLimitInput.addEventListener('input', this.handleInputValidation.bind(this));
        this.globalUpperLimitInput.setAttribute('type', 'number');
        this.globalUpperLimitInput.setAttribute('min', '1');
    }

    async loadGlobalSettings() {
        try {
            const data = await apiGet('/api/settings');
            this.globalUpperLimitInput.value = data.data.globalUpperLimit;
        } catch (error) {
            showMessage(error.message, 'error', 'settings');
        }
    }

    async saveGlobalSettings() {
        const globalUpperLimit = parseInt(this.globalUpperLimitInput.value);
        if (isNaN(globalUpperLimit) || globalUpperLimit < 1) {
            showMessage('Global upper limit must be at least 1', 'error', 'settings');
            this.globalUpperLimitInput.value = 1;
            return;
        }

        try {
            await apiPost('/api/settings', { globalUpperLimit });
            showMessage('Global upper limit saved successfully', 'success', 'settings');
        } catch (error) {
            showMessage(error.message, 'error', 'settings');
        }
    }

    handleInputValidation(e) {
        const value = parseInt(e.target.value);
        if (value < 1) {
            e.target.value = 1;
        }
    }

    getCurrentLimit() {
        return parseInt(this.globalUpperLimitInput.value) || 10;
    }
}