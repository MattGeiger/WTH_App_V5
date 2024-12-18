import request from 'supertest';
import { createApp } from '../index';
import { PrismaClient } from '@prisma/client';

describe('Settings Routes', () => {
    const app = createApp();
    const prisma = new PrismaClient();

    beforeEach(async () => {
        await prisma.settings.deleteMany({});
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('GET /api/settings', () => {
        it('should return default settings when none exist', async () => {
            const response = await request(app)
                .get('/api/settings')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: { globalUpperLimit: 10 }
            });
        });

        it('should return existing settings', async () => {
            await prisma.settings.create({
                data: {
                    id: 1,
                    globalUpperLimit: 20
                }
            });

            const response = await request(app)
                .get('/api/settings')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: { globalUpperLimit: 20 }
            });
        });
    });

    describe('POST /api/settings', () => {
        it('should create new settings when none exist', async () => {
            const response = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 30 })
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: expect.objectContaining({
                    id: 1,
                    globalUpperLimit: 30
                }),
                message: 'Settings updated successfully'
            });
        });

        it('should update existing settings', async () => {
            await prisma.settings.create({
                data: {
                    id: 1,
                    globalUpperLimit: 20
                }
            });

            const response = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 40 })
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: expect.objectContaining({
                    id: 1,
                    globalUpperLimit: 40
                }),
                message: 'Settings updated successfully'
            });
        });

        it('should reject non-numeric global upper limit', async () => {
            const response = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 'invalid' })
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'Global upper limit must be an integer',
                status: 400
            });
        });

        it('should reject negative global upper limit', async () => {
            const response = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: -1 })
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'Global upper limit cannot be negative',
                status: 400
            });
        });

        it('should reject missing global upper limit', async () => {
            const response = await request(app)
                .post('/api/settings')
                .send({})
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'Global upper limit is required',
                status: 400
            });
        });

        it('should reject decimal global upper limit', async () => {
            const response = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 10.5 })
                .expect(400);

            expect(response.body).toEqual({
                success: false,
                message: 'Global upper limit must be an integer',
                status: 400
            });
        });
    });

    describe('Settings persistence', () => {
        it('should maintain settings across requests', async () => {
            await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 50 })
                .expect(200);

            const response = await request(app)
                .get('/api/settings')
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                data: { globalUpperLimit: 50 }
            });
        });

        it('should update updatedAt timestamp when modified', async () => {
            const createResponse = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 60 })
                .expect(200);

            const initialTimestamp = new Date(createResponse.body.data.updatedAt).getTime();

            // Wait a bit to ensure timestamp difference
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updateResponse = await request(app)
                .post('/api/settings')
                .send({ globalUpperLimit: 70 })
                .expect(200);

            const updatedTimestamp = new Date(updateResponse.body.data.updatedAt).getTime();
            expect(updatedTimestamp).toBeGreaterThan(initialTimestamp);
        });
    });
});