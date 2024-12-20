import { createApp } from '../index';
import { cleanDatabase } from './utils/dbHelpers';
import { createTestCategory, createTestFoodItem, createTestLanguage, createTestTranslation } from './utils/testFactories';
import { expectSuccessResponse, expectErrorResponse } from './utils/testHelpers';
import request from 'supertest';

describe('Translation Routes', () => {
  const app = createApp();
  let testLanguageId: number;
  let testCategoryId: number;
  let testFoodItemId: number;

  beforeEach(async () => {
    await cleanDatabase();
    
    const language = await createTestLanguage();
    testLanguageId = language.id;
    
    const category = await createTestCategory();
    testCategoryId = category.id;
    
    const foodItem = await createTestFoodItem(category.id);
    testFoodItemId = foodItem.id;
  });

  describe('GET /api/translations/language/:languageCode', () => {
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

    it('should get translations by language code', async () => {
      const response = await request(app)
        .get('/api/translations/language/en')
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.length).toBe(2);
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/translations/language/en?type=category')
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.every((t: any) => t.categoryId)).toBe(true);
    });
  });

  describe('POST /api/translations/category/:categoryId', () => {
    it('should create category translation', async () => {
      const response = await request(app)
        .post(`/api/translations/category/${testCategoryId}`)
        .send({
          languageId: testLanguageId,
          translatedText: 'Test Translation'
        })
        .expect(201);

      expectSuccessResponse(response);
      expect(response.body.data.categoryId).toBe(testCategoryId);
    });

    it('should validate inputs', async () => {
      const response = await request(app)
        .post(`/api/translations/category/${testCategoryId}`)
        .send({
          languageId: -1,
          translatedText: ''
        })
        .expect(400);

      expectErrorResponse(response);
    });
  });

  describe('POST /api/translations/food-item/:foodItemId', () => {
    it('should create food item translation', async () => {
      const response = await request(app)
        .post(`/api/translations/food-item/${testFoodItemId}`)
        .send({
          languageId: testLanguageId,
          translatedText: 'Test Translation'
        })
        .expect(201);

      expectSuccessResponse(response);
      expect(response.body.data.foodItemId).toBe(testFoodItemId);
    });

    it('should validate inputs', async () => {
      const response = await request(app)
        .post(`/api/translations/food-item/${testFoodItemId}`)
        .send({
          languageId: -1,
          translatedText: ''
        })
        .expect(400);

      expectErrorResponse(response);
    });
  });

  describe('PUT /api/translations/:id', () => {
    it('should update translation', async () => {
      const translation = await createTestTranslation({
        categoryId: testCategoryId,
        languageId: testLanguageId
      });

      const response = await request(app)
        .put(`/api/translations/${translation.id}`)
        .send({ translatedText: 'Updated Text' })
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.translatedText).toBe('Updated Text');
    });
  });

  describe('DELETE /api/translations/:id', () => {
    it('should delete translation', async () => {
      const translation = await createTestTranslation({
        categoryId: testCategoryId,
        languageId: testLanguageId
      });

      await request(app)
        .delete(`/api/translations/${translation.id}`)
        .expect(200);

      // Verify deletion
      await request(app)
        .get(`/api/translations/${translation.id}`)
        .expect(404);
    });
  });
});