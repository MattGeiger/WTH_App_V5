import { TranslationService } from '../services/TranslationService';
import { ApiError } from '../utils/ApiError';
import { cleanDatabase } from './utils/dbHelpers';
import { createTestCategory, createTestFoodItem, createTestLanguage, createTestTranslation } from './utils/testFactories';

describe('TranslationService', () => {
  let translationService: TranslationService;
  let testLanguageId: number;
  let testCategoryId: number;
  let testFoodItemId: number;

  beforeEach(async () => {
    translationService = new TranslationService();
    await cleanDatabase();
    
    const language = await createTestLanguage();
    testLanguageId = language.id;
    
    const category = await createTestCategory();
    testCategoryId = category.id;
    
    const foodItem = await createTestFoodItem(category.id);
    testFoodItemId = foodItem.id;
  });

  describe('createForCategory', () => {
    it('should create category translation', async () => {
      const result = await translationService.createForCategory({
        categoryId: testCategoryId,
        languageId: testLanguageId,
        translatedText: 'Test Translation'
      });

      expect(result).toBeDefined();
      expect(result.categoryId).toBe(testCategoryId);
      expect(result.languageId).toBe(testLanguageId);
    });

    it('should validate category exists', async () => {
      await expect(translationService.createForCategory({
        categoryId: -1,
        languageId: testLanguageId,
        translatedText: 'Test'
      })).rejects.toThrow(ApiError);
    });
  });

  describe('createForFoodItem', () => {
    it('should create food item translation', async () => {
      const result = await translationService.createForFoodItem({
        foodItemId: testFoodItemId,
        languageId: testLanguageId,
        translatedText: 'Test Translation'
      });

      expect(result).toBeDefined();
      expect(result.foodItemId).toBe(testFoodItemId);
      expect(result.languageId).toBe(testLanguageId);
    });

    it('should validate food item exists', async () => {
      await expect(translationService.createForFoodItem({
        foodItemId: -1,
        languageId: testLanguageId,
        translatedText: 'Test'
      })).rejects.toThrow(ApiError);
    });
  });

  describe('findByLanguage', () => {
    beforeEach(async () => {
      await createTestTranslation({
        categoryId: testCategoryId,
        languageId: testLanguageId
      });
      await createTestTranslation({
        foodItemId: testFoodItemId,
        languageId: testLanguageId
      });
    });

    it('should find all translations for language', async () => {
      const translations = await translationService.findByLanguage(testLanguageId);
      expect(translations.length).toBe(2);
    });

    it('should filter by type', async () => {
      const categoryTranslations = await translationService.findByLanguage(
        testLanguageId,
        'category'
      );
      expect(categoryTranslations.every(t => t.categoryId !== null)).toBe(true);

      const foodItemTranslations = await translationService.findByLanguage(
        testLanguageId,
        'foodItem'
      );
      expect(foodItemTranslations.every(t => t.foodItemId !== null)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update translation text', async () => {
      const translation = await createTestTranslation({
        categoryId: testCategoryId,
        languageId: testLanguageId
      });

      const updated = await translationService.update(
        translation.id,
        'Updated Text'
      );
      
      expect(updated.translatedText).toBe('Updated Text');
    });
  });

  describe('delete', () => {
    it('should delete translation', async () => {
      const translation = await createTestTranslation({
        categoryId: testCategoryId,
        languageId: testLanguageId
      });

      await translationService.delete(translation.id);
      
      const translations = await translationService.findByLanguage(testLanguageId);
      expect(translations.find(t => t.id === translation.id)).toBeUndefined();
    });
  });
});