import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();
const prisma = new PrismaClient();

// GET /api/languages
router.get('/', async (req, res, next) => {
    try {
        const languages = await prisma.language.findMany({
            orderBy: { code: 'asc' }
        });
        res.json(ApiResponse.success(languages));
    } catch (error) {
        next(error);
    }
});

// POST /api/languages/bulk
router.post('/bulk', async (req, res, next) => {
    try {
        const { languages } = req.body;
        
        if (!Array.isArray(languages)) {
            throw new ApiError(400, 'Invalid languages data');
        }

        // Deactivate all languages first
        await prisma.language.updateMany({
            data: { active: false }
        });

        // Upsert each language
        const operations = languages.map(lang => 
            prisma.language.upsert({
                where: { code: lang.code },
                update: { 
                    name: lang.name,
                    active: true
                },
                create: {
                    code: lang.code,
                    name: lang.name,
                    active: true
                }
            })
        );

        await prisma.$transaction(operations);

        const updatedLanguages = await prisma.language.findMany({
            where: { active: true },
            orderBy: { code: 'asc' }
        });

        res.json(ApiResponse.success(updatedLanguages, 'Languages updated successfully'));
    } catch (error) {
        next(error);
    }
});

export default router;