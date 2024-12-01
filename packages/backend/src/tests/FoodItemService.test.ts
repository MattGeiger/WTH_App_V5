import { FoodItem, CustomField } from '@prisma/client';
import { FoodItemService } from '../services/FoodItemService';
import { CategoryService } from '../services/CategoryService';
import { ApiError } from '../utils/ApiError';

type FoodItemWithRelations = FoodItem & {
  customFields: CustomField[];
};

describe('FoodItemService', () => {
  let foodItemService: FoodItemService;
  let categoryService: CategoryService;
  let testCategoryId: number;

  beforeAll(async () => {
    categoryService = new CategoryService();
    foodItemService = new FoodItemService();
    
    // Create a test category to use
    const category = await categoryService.create({ name: 'Test Category' });
    testCategoryId = category.id;
  });

  describe('create', () => {
    it('should create a new food item with basic details', async () => {
      const testData = {
        name: 'Test Food Item',
        categoryId: testCategoryId,
        inStock: true
      };

      const result = await foodItemService.create(testData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.categoryId).toBe(testCategoryId);
      expect(result.inStock).toBe(true);
    });

    it('should create a food item with all attributes', async () => {
      const testData = {
        name: 'Complete Food Item',
        categoryId: testCategoryId,
        inStock: true,
        mustGo: true,
        lowSupply: false,
        kosher: true,
        halal: true,
        vegetarian: true,
        vegan: false,
        glutenFree: true,
        organic: true,
        readyToEat: false,
        customFields: [
          { key: 'brand', value: 'Test Brand' },
          { key: 'origin', value: 'Test Country' }
        ]
      };

      const result = await foodItemService.create(testData);
      
      expect(result).toBeDefined();
      expect(result.kosher).toBe(true);
      expect((result as FoodItemWithRelations).customFields).toHaveLength(2);
    });

    it('should throw error with invalid category ID', async () => {
      const testData = {
        name: 'Invalid Category Item',
        categoryId: -1
      };

      await expect(foodItemService.create(testData))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('findAll', () => {
    it('should return paginated food items', async () => {
      // Create multiple items
      await Promise.all([
        foodItemService.create({ name: 'Item 1', categoryId: testCategoryId }),
        foodItemService.create({ name: 'Item 2', categoryId: testCategoryId }),
        foodItemService.create({ name: 'Item 3', categoryId: testCategoryId })
      ]);

      const { items, total } = await foodItemService.findAll({ limit: 2, page: 1 });
      
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeLessThanOrEqual(2);
      expect(total).toBeGreaterThanOrEqual(3);
    });

    it('should filter by category', async () => {
      const { items } = await foodItemService.findAll({ categoryId: testCategoryId });
      
      items.forEach(item => {
        expect(item.categoryId).toBe(testCategoryId);
      });
    });
  });

  describe('findById', () => {
    it('should find food item by id', async () => {
      const created = await foodItemService.create({ 
        name: 'Find Test Item',
        categoryId: testCategoryId
      });

      const found = await foodItemService.findById(created.id);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(created.name);
    });

    it('should throw ApiError if food item not found', async () => {
      await expect(foodItemService.findById(-1))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('update', () => {
    it('should update food item basic details', async () => {
      const created = await foodItemService.create({ 
        name: 'Update Test Item',
        categoryId: testCategoryId
      });

      const updated = await foodItemService.update(created.id, { 
        name: 'Updated Name',
        inStock: false
      });
      
      expect(updated.name).toBe('Updated Name');
      expect(updated.inStock).toBe(false);
    });

    it('should update custom fields', async () => {
      const created = await foodItemService.create({ 
        name: 'Custom Fields Test',
        categoryId: testCategoryId,
        customFields: [{ key: 'test', value: 'original' }]
      });

      const updated = await foodItemService.update(created.id, {
        customFields: [{ key: 'test', value: 'updated' }]
      });

      expect((updated as FoodItemWithRelations).customFields[0].value).toBe('updated');
    });
  });

  describe('delete', () => {
    it('should delete food item', async () => {
      const created = await foodItemService.create({ 
        name: 'To Delete',
        categoryId: testCategoryId
      });
      
      await expect(foodItemService.delete(created.id))
        .resolves
        .not
        .toThrow();

      await expect(foodItemService.findById(created.id))
        .rejects
        .toThrow(ApiError);
    });
  });
});