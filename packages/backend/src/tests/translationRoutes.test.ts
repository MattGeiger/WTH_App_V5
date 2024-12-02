import request from 'supertest';
import { createApp } from '../index';
import { PrismaClient } from '@prisma/client';

describe('Translation Routes', () => {
  const app = createApp();
  const prisma = new PrismaClient();
  let testCategoryId: number;
  let testFoodItemId: number;
  let testTranslationId: number;

  beforeEach(async () => {
    await prisma.translation.deleteMany({});
    await prisma.customField.deleteMany({});
    await prisma.foodItem.deleteMany({});
    await prisma.category.deleteMany({});

    const category = await prisma.category.create({
      data: { name: 'Test Category' }
    });
    testCategoryId = category.id;

    const foodItem = await prisma.foodItem.create({
      data: {
        name: 'Test Food Item',
        categoryId: testCategoryId
      }
    });
    testFoodItemId = foodItem.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/translations/category/:categoryId', () => {
    it('should create a translation for a category', async () => {
      const response = await request(app)
        .post(`/api/translations/category/${testCategoryId}`)
        .send({
          language: 'es',
          translatedText: 'Categoría de Prueba'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.translatedText).toBe('Categoría de Prueba');
      testTranslationId = response.body.data.id;
    });

    it('should reject invalid language', async () => {
      await request(app)
        .post(`/api/translations/category/${testCategoryId}`)
        .send({
          language: 'xx',
          translatedText: 'Invalid Language'
        })
        .expect(400);
    });

    it('should reject non-existent category', async () => {
      await request(app)
        .post('/api/translations/category/99999')
        .send({
          language: 'es',
          translatedText: 'Test Translation'
        })
        .expect(404);
    });
  });

  describe('POST /api/translations/food-item/:foodItemId', () => {
    it('should create a translation for a food item', async () => {
      const response = await request(app)
        .post(`/api/translations/food-item/${testFoodItemId}`)
        .send({
          language: 'es',
          translatedText: 'Alimento de Prueba'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.translatedText).toBe('Alimento de Prueba');
    });

    it('should reject non-existent food item', async () => {
      await request(app)
        .post('/api/translations/food-item/99999')
        .send({
          language: 'es',
          translatedText: 'Test Translation'
        })
        .expect(404);
    });
  });

  describe('GET /api/translations/language/:language', () => {
    beforeEach(async () => {
      await prisma.translation.create({
        data: {
          language: 'es',
          translatedText: 'Test Translation',
          categoryId: testCategoryId
        }
      });
    });

    it('should get translations by language and category', async () => {
      const response = await request(app)
        .get('/api/translations/language/es')
        .query({ categoryId: testCategoryId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should handle invalid language', async () => {
      await request(app)
        .get('/api/translations/language/xx')
        .expect(400);
    });
  });

  describe('PUT /api/translations/:id', () => {
    beforeEach(async () => {
      const translation = await prisma.translation.create({
        data: {
          language: 'es',
          translatedText: 'Original Text',
          categoryId: testCategoryId
        }
      });
      testTranslationId = translation.id;
    });

    it('should update a translation', async () => {
      const response = await request(app)
        .put(`/api/translations/${testTranslationId}`)
        .send({
          translatedText: 'Updated Text'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.translatedText).toBe('Updated Text');
    });

    it('should reject invalid update data', async () => {
      await request(app)
        .put(`/api/translations/${testTranslationId}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /api/translations/:id', () => {
    beforeEach(async () => {
      const translation = await prisma.translation.create({
        data: {
          language: 'es',
          translatedText: 'To Delete',
          categoryId: testCategoryId
        }
      });
      testTranslationId = translation.id;
    });

    it('should delete a translation', async () => {
      await request(app)
        .delete(`/api/translations/${testTranslationId}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/translations/${testTranslationId}`)
        .expect(404);
    });

    it('should handle non-existent translation', async () => {
      await request(app)
        .delete('/api/translations/99999')
        .expect(404);
    });
  });
});