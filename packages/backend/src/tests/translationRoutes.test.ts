import request from 'supertest';
import { createApp } from '../index';
import { PrismaClient } from '@prisma/client';

describe('Translation Routes', () => {
  const app = createApp();
  const prisma = new PrismaClient();
  let testCategoryId: number;
  let testFoodItemId: number;
  let testTranslationId: number;
  let testLanguageId: number;

  beforeEach(async () => {
    await prisma.translation.deleteMany({});
    await prisma.customField.deleteMany({});
    await prisma.foodItem.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.language.deleteMany({});

    // Create test language first
    const language = await prisma.language.create({
      data: { code: 'es', name: 'Spanish', active: true }
    });
    testLanguageId = language.id;

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
          languageCode: 'es',
          translatedText: 'Categoría de Prueba'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.translatedText).toBe('Categoría de Prueba');
      expect(response.body.data.language.code).toBe('es');
      testTranslationId = response.body.data.id;
    });

    it('should reject invalid language code', async () => {
      await request(app)
        .post(`/api/translations/category/${testCategoryId}`)
        .send({
          languageCode: 'xx',
          translatedText: 'Invalid Language'
        })
        .expect(400);
    });

    it('should reject non-existent category', async () => {
      await request(app)
        .post('/api/translations/category/99999')
        .send({
          languageCode: 'es',
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
          languageCode: 'es',
          translatedText: 'Alimento de Prueba'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.translatedText).toBe('Alimento de Prueba');
      expect(response.body.data.language.code).toBe('es');
    });

    it('should reject non-existent food item', async () => {
      await request(app)
        .post('/api/translations/food-item/99999')
        .send({
          languageCode: 'es',
          translatedText: 'Test Translation'
        })
        .expect(404);
    });
  });

  describe('GET /api/translations/language/:languageCode', () => {
    beforeEach(async () => {
      await prisma.translation.create({
        data: {
          translatedText: 'Test Translation',
          categoryId: testCategoryId,
          languageId: testLanguageId
        }
      });
    });

    it('should get translations by language code and category', async () => {
      const response = await request(app)
        .get('/api/translations/language/es')
        .query({ categoryId: testCategoryId })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].language.code).toBe('es');
    });

    it('should handle invalid language code', async () => {
      await request(app)
        .get('/api/translations/language/xx')
        .expect(400);
    });
  });

  describe('PUT /api/translations/:id', () => {
    beforeEach(async () => {
      const translation = await prisma.translation.create({
        data: {
          translatedText: 'Original Text',
          categoryId: testCategoryId,
          languageId: testLanguageId
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
          translatedText: 'To Delete',
          categoryId: testCategoryId,
          languageId: testLanguageId
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