import { createApp } from '../index';
import { cleanDatabase } from './utils/dbHelpers';
import { createTestCategory } from './utils/testFactories';
import { expectSuccessResponse, expectErrorResponse, testCrudEndpoints } from './utils/testHelpers';
import request from 'supertest';

describe('Category Routes', () => {
  const app = createApp();
  
  beforeEach(async () => {
    await cleanDatabase();
  });

  // Test all CRUD endpoints
  testCrudEndpoints(app, '/api/categories', { name: 'Test Category' });

  // Additional category-specific tests
  describe('Category Validations', () => {
    it('should reject empty category name', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ name: '' })
        .expect(400);

      expectErrorResponse(response);
    });

    it('should handle duplicate category names', async () => {
      const category = await createTestCategory('Duplicate');
      
      const response = await request(app)
        .post('/api/categories')
        .send({ name: 'Duplicate' })
        .expect(400);

      expectErrorResponse(response);
    });
  });
});