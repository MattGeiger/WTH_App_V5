import { TranslationService } from '../services/TranslationService';
import { CategoryService } from '../services/CategoryService';
import { FoodItemService } from '../services/FoodItemService';
import { ApiError } from '../utils/ApiError';

describe('TranslationService', () => {
  let translationService: TranslationService;
  let categoryService: CategoryService;
  let foodItemService: FoodItemService;
  let testCategoryId: number;
  let testFoodItemId: number;

  beforeAll(async () => {
    translationService = new TranslationService();
    categoryService = new CategoryService();
    foodItemService = new FoodItemService();

    // Create test category and food item
    const category = await categoryService.create({ name: 'Test Category' });
    testCategoryId = category.id;

    const foodItem = await foodItemService.create({
      name: 'Test Food Item',
      categoryId: testCategoryId
    });
    testFoodItemId = foodItem.id;
  });

  describe('createForCategory', () => {
    it('should create a translation for a category', async () => {
      const translationData = {
        language: 'es',
        translatedText: 'Categoría de Prueba'
      };

      const result = await translationService.createForCategory(
        testCategoryId,
        translationData
      );

      expect(result).toBeDefined();
      expect(result.language).toBe('es');
      expect(result.translatedText).toBe('Categoría de Prueba');
      expect(result.categoryId).toBe(testCategoryId);
    });

    it('should reject invalid language code', async () => {
      const translationData = {
        language: 'xx',
        translatedText: 'Invalid Language'
      };

      await expect(
        translationService.createForCategory(testCategoryId, translationData)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('createForFoodItem', () => {
    it('should create a translation for a food item', async () => {
      const translationData = {
        language: 'ru',
        translatedText: 'Тестовая Еда'
      };

      const result = await translationService.createForFoodItem(
        testFoodItemId,
        translationData
      );

      expect(result).toBeDefined();
      expect(result.language).toBe('ru');
      expect(result.translatedText).toBe('Тестовая Еда');
      expect(result.foodItemId).toBe(testFoodItemId);
    });

    it('should reject translation for non-existent food item', async () => {
      const translationData = {
        language: 'ru',
        translatedText: 'Test Translation'
      };

      await expect(
        translationService.createForFoodItem(-1, translationData)
      ).rejects.toThrow(ApiError);
    });
  });

  describe('findByLanguage', () => {
    it('should find translations by language for category', async () => {
      const translations = await translationService.findByLanguage('es', {
        categoryId: testCategoryId
      });

      expect(Array.isArray(translations)).toBe(true);
      translations.forEach(translation => {
        expect(translation.language).toBe('es');
        expect(translation.categoryId).toBe(testCategoryId);
      });
    });

    it('should find translations by language for food item', async () => {
      const translations = await translationService.findByLanguage('ru', {
        foodItemId: testFoodItemId
      });

      expect(Array.isArray(translations)).toBe(true);
      translations.forEach(translation => {
        expect(translation.language).toBe('ru');
        expect(translation.foodItemId).toBe(testFoodItemId);
      });
    });
  });

  describe('update', () => {
    it('should update a translation', async () => {
      // Create a translation with a different language
      const translation = await translationService.createForCategory(
        testCategoryId,
        {
          language: 'uk',
          translatedText: 'Original Text'
        }
      );

      // Then update it
      const updated = await translationService.update(translation.id, {
        translatedText: 'Updated Text'
      });

      expect(updated.id).toBe(translation.id);
      expect(updated.translatedText).toBe('Updated Text');
    });
  });

  describe('delete', () => {
    it('should delete a translation', async () => {
      // Create a translation with a different language
      const translation = await translationService.createForCategory(
        testCategoryId,
        {
          language: 'zh',
          translatedText: 'To Delete'
        }
      );

      // Then delete it
      await expect(translationService.delete(translation.id))
        .resolves
        .not
        .toThrow();

      // Verify it's deleted
      await expect(translationService.findById(translation.id))
        .rejects
        .toThrow(ApiError);
    });
  });
});