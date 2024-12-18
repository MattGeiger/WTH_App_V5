import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../utils/ApiResponse';
import { SettingsValidationError } from '../utils/ApiError';

const router = Router();
const prisma = new PrismaClient();

// GET /api/settings
router.get('/', async (req, res, next) => {
    try {
        const settings = await prisma.settings.findUnique({
            where: { id: 1 }
        });

        // If no settings exist, return default value of 10
        if (!settings) {
            return res.json(ApiResponse.success({
                globalUpperLimit: 10
            }));
        }

        res.json(ApiResponse.success({
            globalUpperLimit: settings.globalUpperLimit
        }));
    } catch (error) {
        next(error);
    }
});

// POST /api/settings
router.post('/', async (req, res, next) => {
    try {
        const { globalUpperLimit } = req.body;

        // Validate input
        if (globalUpperLimit === undefined || globalUpperLimit === null) {
            throw new SettingsValidationError('Global upper limit is required');
        }

        if (typeof globalUpperLimit !== 'number' || !Number.isInteger(globalUpperLimit)) {
            throw new SettingsValidationError('Global upper limit must be an integer');
        }

        if (globalUpperLimit < 1) {
            throw new SettingsValidationError('Global upper limit must be at least 1');
        }

        const settings = await prisma.settings.upsert({
            where: { id: 1 },
            update: {
                globalUpperLimit,
                updatedAt: new Date()
            },
            create: {
                globalUpperLimit,
                id: 1
            }
        });

        res.json(ApiResponse.success(settings, 'Settings updated successfully'));
    } catch (error) {
        next(error);
    } finally {
        await prisma.$disconnect(); // Ensure Prisma disconnects after handling the request
    }
});

export default router;
