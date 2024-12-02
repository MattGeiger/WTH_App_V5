import request from 'supertest';
import { createApp } from '../index';
import { PrismaClient } from '@prisma/client';

describe('Category Routes', () => {
  const app = createApp();
  const prisma = new PrismaClient();
  let testCategoryId: number;

  beforeEach(async () => {
    // Clean up and create fresh test data
    await prisma.translation.deleteMany({});
    await prisma.foodItem.deleteMany({});
    await prisma.category.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Test Category' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Category');
      testCategoryId = response.body.data.id;
    });

    it('should reject invalid input', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      // Create test category if it doesn't exist
      const category = await prisma.category.create({
        data: { name: 'Test Category' }
      });
      testCategoryId = category.id;
    });

    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return a specific category', async () => {
      const response = await request(app)
        .get(`/api/categories/${testCategoryId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCategoryId);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/99999')
        .expect(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    beforeEach(async () => {
      // Create test category if it doesn't exist
      const category = await prisma.category.create({
        data: { name: 'Test Category' }
      });
      testCategoryId = category.id;
    });

    it('should update a category', async () => {
      const response = await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .send({ name: 'Updated Category' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Category');
    });

    it('should reject invalid updates', async () => {
      await request(app)
        .put(`/api/categories/${testCategoryId}`)
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    beforeEach(async () => {
      // Create test category if it doesn't exist
      const category = await prisma.category.create({
        data: { name: 'Test Category' }
      });
      testCategoryId = category.id;
    });

    it('should delete a category', async () => {
      await request(app)
        .delete(`/api/categories/${testCategoryId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/categories/${testCategoryId}`)
        .expect(404);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .delete('/api/categories/99999')
        .expect(404);
    });
  });
});