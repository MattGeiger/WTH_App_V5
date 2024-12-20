import { SettingsManager } from './settings.js';
import { LanguageManager } from './languages.js';
import { CategoryManager } from './categories.js';
import { FoodItemManager } from './foodItems.js';
import { TranslationManager } from './translations.js';

// Initialize managers and export them for module access
export const managers = {
    settings: null,
    languages: null,
    categories: null,
    foodItems: null,
    translations: null
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    managers.settings = new SettingsManager();
    managers.languages = new LanguageManager();
    managers.categories = new CategoryManager();
    managers.foodItems = new FoodItemManager(managers.settings);
    managers.translations = new TranslationManager();
    
    // Initial data loads
    managers.settings.loadGlobalSettings();
    managers.languages.loadLanguages();
    managers.categories.loadCategories();
    managers.foodItems.loadFoodItems();
    managers.translations.loadTranslations();

    // Log initialization
    console.log('Application initialized with modular architecture');
});