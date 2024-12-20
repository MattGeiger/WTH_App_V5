import { createApp } from '../index';
import { cleanDatabase } from './utils/dbHelpers';
import { createTestCategory, createTestFoodItem } from './utils/testFactories';
import { expectSuccessResponse, expectErrorResponse, testCrudEndpoints } from './utils/testHelpers';
import request from 'supertest';

describe('Food Item Routes', () => {
  const app = createApp();
  let testCategoryId: number;
  
  beforeEach(async () => {
    await cleanDatabase();
    const category = await createTestCategory();
    testCategoryId = category.id;
  });

  const validPayload = {
    name: 'Test Food Item',
    categoryId: 0, // Will be set in beforeAll
    inStock: true,
    itemLimit: 0,
    limitType: 'perHousehold'
  };

  beforeAll(() => {
    // Update payload with actual category ID
    validPayload.categoryId = testCategoryId;
  });

  // Test all CRUD endpoints
  testCrudEndpoints(app, '/api/food-items', validPayload);

  describe('Food Item Validations', () => {
    it('should reject empty name', async () => {
      const response = await request(app)
        .post('/api/food-items')
        .send({ ...validPayload, name: '' })
        .expect(400);

      expectErrorResponse(response);
    });

    it('should reject invalid category', async () => {
      const response = await request(app)
        .post('/api/food-items')
        .send({ ...validPayload, categoryId: -1 })
        .expect(400);

      expectErrorResponse(response);
    });

    it('should validate limit type', async () => {
      const response = await request(app)
        .post('/api/food-items')
        .send({ ...validPayload, limitType: 'invalid' })
        .expect(400);

      expectErrorResponse(response);
    });
  });

  describe('Stock Filtering', () => {
    beforeEach(async () => {
      await createTestFoodItem(testCategoryId, { inStock: true });
      await createTestFoodItem(testCategoryId, { inStock: false });
    });

    it('should filter out-of-stock items by default', async () => {
      const response = await request(app)
        .get('/api/food-items')
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.every((item: any) => item.inStock)).toBe(true);
    });

    it('should include out-of-stock items when requested', async () => {
      const response = await request(app)
        .get('/api/food-items?includeOutOfStock=true')
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.some((item: any) => !item.inStock)).toBe(true);
    });
  });
});