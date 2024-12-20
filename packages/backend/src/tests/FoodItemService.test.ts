import { FoodItemService } from '../services/FoodItemService';
import { ApiError } from '../utils/ApiError';
import { cleanDatabase } from './utils/dbHelpers';
import { createTestCategory, createTestFoodItem } from './utils/testFactories';

describe('FoodItemService', () => {
  let foodItemService: FoodItemService;
  let testCategoryId: number;

  beforeEach(async () => {
    foodItemService = new FoodItemService();
    await cleanDatabase();
    const category = await createTestCategory();
    testCategoryId = category.id;
  });

  describe('create', () => {
    it('should create a food item', async () => {
      const testData = {
        name: 'Test Food',
        categoryId: testCategoryId,
        inStock: true,
        itemLimit: 0,
        limitType: 'perHousehold'
      };
      const result = await foodItemService.create(testData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.categoryId).toBe(testCategoryId);
      expect(result.id).toBeDefined();
    });

    it('should validate category exists', async () => {
      const testData = {
        name: 'Test Food',
        categoryId: -1,
        inStock: true,
        itemLimit: 0,
        limitType: 'perHousehold'
      };
      await expect(foodItemService.create(testData)).rejects.toThrow(ApiError);
    });
  });

  describe('findAll', () => {
    it('should return all food items', async () => {
      await createTestFoodItem(testCategoryId, { name: 'Food 1' });
      await createTestFoodItem(testCategoryId, { name: 'Food 2' });

      const items = await foodItemService.findAll();
      expect(items.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter out-of-stock items', async () => {
      await createTestFoodItem(testCategoryId, { name: 'In Stock', inStock: true });
      await createTestFoodItem(testCategoryId, { name: 'Out of Stock', inStock: false });

      const items = await foodItemService.findAll({ includeOutOfStock: false });
      expect(items.every(item => item.inStock)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find food item by id', async () => {
      const created = await createTestFoodItem(testCategoryId);
      const found = await foodItemService.findById(created.id);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
    });

    it('should throw ApiError if not found', async () => {
      await expect(foodItemService.findById(-1)).rejects.toThrow(ApiError);
    });
  });

  describe('update', () => {
    it('should update food item', async () => {
      const created = await createTestFoodItem(testCategoryId);
      const updated = await foodItemService.update(created.id, { name: 'Updated Name' });
      
      expect(updated.name).toBe('Updated Name');
      expect(updated.id).toBe(created.id);
    });

    it('should validate category on update', async () => {
      const created = await createTestFoodItem(testCategoryId);
      await expect(foodItemService.update(created.id, { categoryId: -1 }))
        .rejects.toThrow(ApiError);
    });
  });

  describe('delete', () => {
    it('should delete food item', async () => {
      const created = await createTestFoodItem(testCategoryId);
      await foodItemService.delete(created.id);
      await expect(foodItemService.findById(created.id)).rejects.toThrow(ApiError);
    });
  });

  describe('limitType handling', () => {
    it('should handle per-household limits', async () => {
      const item = await createTestFoodItem(testCategoryId, {
        itemLimit: 5,
        limitType: 'perHousehold'
      });
      expect(item.limitType).toBe('perHousehold');
      expect(item.itemLimit).toBe(5);
    });

    it('should handle per-person limits', async () => {
      const item = await createTestFoodItem(testCategoryId, {
        itemLimit: 2,
        limitType: 'perPerson'
      });
      expect(item.limitType).toBe('perPerson');
      expect(item.itemLimit).toBe(2);
    });
  });
});