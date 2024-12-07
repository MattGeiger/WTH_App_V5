import request from 'supertest';
import { createApp } from '../index';
import { PrismaClient } from '@prisma/client';

describe('Language Routes', () => {
  const app = createApp();
  const prisma = new PrismaClient();

  beforeEach(async () => {
    await prisma.translation.deleteMany({});
    await prisma.foodItem.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.language.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/languages', () => {
    it('should create a new language', async () => {
      const response = await request(app)
        .post('/api/languages')
        .send({ code: 'fr', name: 'French' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('fr');
      expect(response.body.data.name).toBe('French');
    });

    it('should reject if code is missing', async () => {
      const response = await request(app)
        .post('/api/languages')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject duplicates', async () => {
      await prisma.language.create({ data: { code: 'fr', name: 'French', active: true } });

      const response = await request(app)
        .post('/api/languages')
        .send({ code: 'fr', name: 'French' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/languages', () => {
    beforeEach(async () => {
      await prisma.language.create({
        data: { code: 'es', name: 'Spanish', active: true }
      });
      await prisma.language.create({
        data: { code: 'ru', name: 'Russian', active: true }
      });
    });

    it('should return all active languages', async () => {
      const response = await request(app)
        .get('/api/languages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      const codes = response.body.data.map((l: any) => l.code);
      expect(codes).toContain('es');
      expect(codes).toContain('ru');
    });
  });
});
