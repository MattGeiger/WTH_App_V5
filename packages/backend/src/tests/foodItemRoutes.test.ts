import request from 'supertest';
import { createApp } from '../index';
import { PrismaClient } from '@prisma/client';

describe('FoodItem Routes', () => {
  const app = createApp();
  const prisma = new PrismaClient();
  let testCategoryId: number;
  let testFoodItemId: number;

  beforeEach(async () => {
    // Clean up and create fresh test data
    await prisma.translation.deleteMany({});
    await prisma.customField.deleteMany({});
    await prisma.foodItem.deleteMany({});
    await prisma.category.deleteMany({});

    // Create test category
    const category = await prisma.category.create({
      data: { name: 'Test Category' }
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/food-items', () => {
    it('should create a new food item with basic details', async () => {
      const response = await request(app)
        .post('/api/food-items')
        .send({
          name: 'Test Food Item',
          categoryId: testCategoryId,
          inStock: true
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Food Item');
      testFoodItemId = response.body.data.id;
    });

    it('should create a food item with all attributes', async () => {
      const response = await request(app)
        .post('/api/food-items')
        .send({
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
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.kosher).toBe(true);
      expect(response.body.data.customFields).toHaveLength(2);
    });

    it('should reject creation without required fields', async () => {
      await request(app)
        .post('/api/food-items')
        .send({
          name: 'Invalid Item'
          // missing categoryId
        })
        .expect(400);
    });
  });

  describe('GET /api/food-items', () => {
    beforeEach(async () => {
      // Create test food items
      const item = await prisma.foodItem.create({
        data: {
          name: 'Test Food Item',
          categoryId: testCategoryId
        }
      });
      testFoodItemId = item.id;
    });

    it('should return paginated food items', async () => {
      const response = await request(app)
        .get('/api/food-items')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/food-items')
        .query({ categoryId: testCategoryId })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((item: any) => {
        expect(item.categoryId).toBe(testCategoryId);
      });
    });

    it('should get a specific food item', async () => {
      const response = await request(app)
        .get(`/api/food-items/${testFoodItemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testFoodItemId);
    });

    it('should return 404 for non-existent food item', async () => {
      await request(app)
        .get('/api/food-items/99999')
        .expect(404);
    });
  });

  describe('PUT /api/food-items/:id', () => {
    beforeEach(async () => {
      const item = await prisma.foodItem.create({
        data: {
          name: 'Test Food Item',
          categoryId: testCategoryId
        }
      });
      testFoodItemId = item.id;
    });

    it('should update a food item', async () => {
      const response = await request(app)
        .put(`/api/food-items/${testFoodItemId}`)
        .send({
          name: 'Updated Food Item',
          inStock: false
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Food Item');
      expect(response.body.data.inStock).toBe(false);
    });

    it('should update custom fields', async () => {
      const response = await request(app)
        .put(`/api/food-items/${testFoodItemId}`)
        .send({
          customFields: [
            { key: 'test', value: 'updated value' }
          ]
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customFields[0].value).toBe('updated value');
    });

    it('should return 404 for non-existent food item', async () => {
      await request(app)
        .put('/api/food-items/99999')
        .send({ name: 'Updated Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/food-items/:id', () => {
    beforeEach(async () => {
      const item = await prisma.foodItem.create({
        data: {
          name: 'Test Food Item',
          categoryId: testCategoryId
        }
      });
      testFoodItemId = item.id;
    });

    it('should delete a food item', async () => {
      await request(app)
        .delete(`/api/food-items/${testFoodItemId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/food-items/${testFoodItemId}`)
        .expect(404);
    });

    it('should return 404 for non-existent food item', async () => {
      await request(app)
        .delete('/api/food-items/99999')
        .expect(404);
    });
  });
});