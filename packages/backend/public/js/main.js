export const managers = {
    settings: null,
    languages: null,
    categories: null,
    foodItems: null,
    translations: null
};

export const EVENTS = {
    CATEGORY_UPDATED: 'categoryUpdated'
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { SettingsManager } = await import('./settings.js');
        const { LanguageManager } = await import('./languages.js');
        const { CategoryManager } = await import('./categories.js');
        const { FoodItemManager } = await import('./foodItems/index.js');
        const { TranslationManager } = await import('./translations.js');

        managers.settings = new SettingsManager();
        managers.languages = new LanguageManager();
        managers.categories = new CategoryManager();
        managers.foodItems = new FoodItemManager(managers.settings);
        managers.translations = new TranslationManager();
        
        await managers.settings.loadGlobalSettings();
        await managers.languages.loadLanguages();
        await managers.categories.loadCategories();
        await managers.foodItems.loadFoodItems();
        await managers.translations.loadTranslations();

        document.addEventListener(EVENTS.CATEGORY_UPDATED, async () => {
            if (managers.foodItems) {
                await managers.foodItems.loadCategories();
            }
        });

    } catch (error) {
        console.error('Error during initialization:', error);
    }
});