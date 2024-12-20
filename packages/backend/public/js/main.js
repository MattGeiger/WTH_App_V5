import { SettingsManager } from './settings.js';
import { LanguageManager } from './languages.js';
import { CategoryManager } from './categories.js';
import { FoodItemManager } from './foodItems.js';
import { TranslationManager } from './translations.js';

// Initialize managers after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create instances
    const settingsManager = new SettingsManager();
    window.settingsManager = settingsManager;  // Make available globally
    
    window.languageManager = new LanguageManager();
    window.categoryManager = new CategoryManager();
    window.foodItemManager = new FoodItemManager(settingsManager);
    window.translationManager = new TranslationManager();
    
    // Initial data loads
    settingsManager.loadGlobalSettings();
    window.languageManager.loadLanguages();
    window.categoryManager.loadCategories();
    window.foodItemManager.loadFoodItems();
    window.translationManager.loadTranslations();

    // Log initialization
    console.log('Application initialized');
});