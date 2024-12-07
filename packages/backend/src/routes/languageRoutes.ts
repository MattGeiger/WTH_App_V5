import { Router } from 'express';
import { LanguageService } from '../services/LanguageService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();
const languageService = new LanguageService();

/**
 * POST /api/languages
 * Add a new language by code and optional name.
 * Example body: { "code": "fr", "name": "French" }
 */
router.post('/', async (req, res, next) => {
  try {
    const { code, name } = req.body;
    if (!code) {
      throw new ApiError(400, 'Language code is required');
    }

    const newLang = await languageService.addLanguage(code, name);
    res.status(201).json(ApiResponse.success(newLang, 'Language created successfully'));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/languages
 * Returns a list of all active languages.
 */
router.get('/', async (req, res, next) => {
  try {
    const languages = await languageService.findAll();
    res.json(ApiResponse.success(languages));
  } catch (error) {
    next(error);
  }
});

export default router;
