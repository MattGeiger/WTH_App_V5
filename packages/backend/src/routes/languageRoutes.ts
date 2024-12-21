import { Router } from 'express';
import { LanguageService } from '../services/LanguageService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();
const languageService = new LanguageService();

// GET /api/languages
router.get('/', async (req, res, next) => {
    try {
        console.log('GET /api/languages - Starting request');
        const languages = await languageService.findAll();
        console.log(`GET /api/languages - Found ${languages.length} languages`);
        res.json(ApiResponse.success(languages));
    } catch (error) {
        console.error('GET /api/languages - Error:', error);
        next(error);
    }
});

// POST /api/languages/bulk
router.post('/bulk', async (req, res, next) => {
    try {
        console.log('POST /api/languages/bulk - Starting request');
        const { languages } = req.body;
        
        if (!Array.isArray(languages)) {
            throw new ApiError(400, 'Invalid languages data');
        }

        const updatedLanguages = await languageService.bulkUpdate(languages);
        console.log(`POST /api/languages/bulk - Updated ${updatedLanguages.length} languages`);
        res.json(ApiResponse.success(updatedLanguages, 'Languages updated successfully'));
    } catch (error) {
        console.error('POST /api/languages/bulk - Error:', error);
        next(error);
    }
});

// GET /api/languages/active
router.get('/active', async (req, res, next) => {
    try {
        console.log('GET /api/languages/active - Starting request');
        const languages = await languageService.findActive();
        console.log(`GET /api/languages/active - Found ${languages.length} active languages`);
        res.json(ApiResponse.success(languages));
    } catch (error) {
        console.error('GET /api/languages/active - Error:', error);
        next(error);
    }
});

export default router;