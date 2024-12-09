import { SettingsManager } from './settings.js';
import { LanguageManager } from './languages.js';
import { CategoryManager } from './categories.js';
import { FoodItemManager } from './foodItems.js';
import { TranslationManager } from './translations.js';

document.addEventListener('DOMContentLoaded', () => {
    const settingsManager = new SettingsManager();
    window.languageManager = new LanguageManager();
    window.categoryManager = new CategoryManager();
    window.foodItemManager = new FoodItemManager(settingsManager);
    window.translationManager = new TranslationManager();
    
    settingsManager.loadGlobalSettings();
    languageManager.loadLanguages();
    categoryManager.loadCategories();
    foodItemManager.loadFoodItems();
    translationManager.loadTranslations();
});