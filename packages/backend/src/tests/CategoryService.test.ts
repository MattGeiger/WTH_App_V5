import { CategoryService } from '../services/CategoryService';
import { ApiError } from '../utils/ApiError';

describe('CategoryService', () => {
  let categoryService: CategoryService;

  beforeEach(() => {
    categoryService = new CategoryService();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const testData = { name: 'Test Category' };
      const result = await categoryService.create(testData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(testData.name);
      expect(result.id).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      // Create test categories
      await categoryService.create({ name: 'Category 1' });
      await categoryService.create({ name: 'Category 2' });

      const categories = await categoryService.findAll();
      
      expect(categories).toBeDefined();
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findById', () => {
    it('should find category by id', async () => {
      const created = await categoryService.create({ name: 'Test Category' });
      const found = await categoryService.findById(created.id);
      
      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe(created.name);
    });

    it('should throw ApiError if category not found', async () => {
      await expect(categoryService.findById(-1))
        .rejects
        .toThrow(ApiError);
    });
  });

  describe('update', () => {
    it('should update category', async () => {
      const created = await categoryService.create({ name: 'Original Name' });
      const updated = await categoryService.update(created.id, { name: 'Updated Name' });
      
      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete category', async () => {
      const created = await categoryService.create({ name: 'To Delete' });
      
      await expect(categoryService.delete(created.id))
        .resolves
        .not
        .toThrow();

      await expect(categoryService.findById(created.id))
        .rejects
        .toThrow(ApiError);
    });
  });
});