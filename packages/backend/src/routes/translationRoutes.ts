import { Router } from 'express';
import { TranslationService } from '../services/TranslationService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();
const translationService = new TranslationService();

// GET /translations
router.get('/', async (req, res, next) => {
    try {
        const { languageCode, categoryId, foodItemId } = req.query;
        console.log('Translation query params:', { languageCode, categoryId, foodItemId });
        
        const params = {
            languageCode: languageCode as string,
            categoryId: categoryId ? parseInt(categoryId as string) : undefined,
            foodItemId: foodItemId ? parseInt(foodItemId as string) : undefined
        };
        console.log('Processed params:', params);

        const translations = await translationService.findAll(params);
        console.log('Found translations:', translations);
        
        res.json(ApiResponse.success(translations));
    } catch (error) {
        console.error('Translation error:', error);
        next(error);
    }
});

// GET /translations/language/:languageCode
router.get('/language/:languageCode', async (req, res, next) => {
    try {
        const { languageCode } = req.params;
        const { categoryId, foodItemId } = req.query;

        const params = {
            categoryId: categoryId ? parseInt(categoryId as string) : undefined,
            foodItemId: foodItemId ? parseInt(foodItemId as string) : undefined
        };

        const translations = await translationService.findByLanguage(languageCode, params);
        res.json(ApiResponse.success(translations));
    } catch (error) {
        next(error);
    }
});

// POST /translations/category/:categoryId
router.post('/category/:categoryId', async (req, res, next) => {
    try {
        const categoryId = parseInt(req.params.categoryId);
        if (isNaN(categoryId)) {
            throw new ApiError(400, 'Invalid category ID');
        }

        const { languageCode, translatedText } = req.body;
        if (!languageCode || !translatedText) {
            throw new ApiError(400, 'Language code and translated text are required');
        }

        const translation = await translationService.createForCategory(categoryId, {
            languageCode,
            translatedText
        });

        res.status(201).json(ApiResponse.success(translation, 'Translation created successfully'));
    } catch (error) {
        next(error);
    }
});

// POST /translations/food-item/:foodItemId
router.post('/food-item/:foodItemId', async (req, res, next) => {
    try {
        const foodItemId = parseInt(req.params.foodItemId);
        if (isNaN(foodItemId)) {
            throw new ApiError(400, 'Invalid food item ID');
        }

        const { languageCode, translatedText } = req.body;
        if (!languageCode || !translatedText) {
            throw new ApiError(400, 'Language code and translated text are required');
        }

        const translation = await translationService.createForFoodItem(foodItemId, {
            languageCode,
            translatedText
        });

        res.status(201).json(ApiResponse.success(translation, 'Translation created successfully'));
    } catch (error) {
        next(error);
    }
});

// Generic ID-based routes last
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new ApiError(400, 'Invalid translation ID');
        }

        const translation = await translationService.findById(id);
        res.json(ApiResponse.success(translation));
    } catch (error) {
        next(error);
    }
});

router.put('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new ApiError(400, 'Invalid translation ID');
        }

        const translation = await translationService.findById(id);
        if (!translation) {
            throw new ApiError(404, 'Translation not found');
        }

        const { translatedText } = req.body;
        if (!translatedText) {
            throw new ApiError(400, 'Translated text is required');
        }

        const updatedTranslation = await translationService.update(id, { translatedText });
        res.json(ApiResponse.success(updatedTranslation, 'Translation updated successfully'));
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new ApiError(400, 'Invalid translation ID');
        }

        const translation = await translationService.findById(id);
        if (!translation) {
            throw new ApiError(404, 'Translation not found');
        }

        await translationService.delete(id);
        res.json(ApiResponse.success(null, 'Translation deleted successfully'));
    } catch (error) {
        next(error);
    }
});

export default router;