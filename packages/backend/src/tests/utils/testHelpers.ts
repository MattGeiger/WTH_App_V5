import { Express } from 'express';
import request from 'supertest';

export const expectSuccessResponse = (response: request.Response) => {
  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
};

export const expectErrorResponse = (response: request.Response) => {
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
};

export const testCrudEndpoints = (app: Express, baseUrl: string, validPayload: any) => {
  describe('CRUD Operations', () => {
    let createdId: number;

    it('should create resource', async () => {
      const response = await request(app)
        .post(baseUrl)
        .send(validPayload)
        .expect(201);

      expectSuccessResponse(response);
      createdId = response.body.data.id;
    });

    it('should get all resources', async () => {
      const response = await request(app)
        .get(baseUrl)
        .expect(200);

      expectSuccessResponse(response);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get specific resource', async () => {
      const response = await request(app)
        .get(`${baseUrl}/${createdId}`)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.id).toBe(createdId);
    });

    it('should update resource', async () => {
      const response = await request(app)
        .put(`${baseUrl}/${createdId}`)
        .send(validPayload)
        .expect(200);

      expectSuccessResponse(response);
      expect(response.body.data.id).toBe(createdId);
    });

    it('should delete resource', async () => {
      await request(app)
        .delete(`${baseUrl}/${createdId}`)
        .expect(200);

      await request(app)
        .get(`${baseUrl}/${createdId}`)
        .expect(404);
    });
  });
};