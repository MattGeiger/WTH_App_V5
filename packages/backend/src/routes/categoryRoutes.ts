import { Router } from 'express';
import { CategoryService } from '../services/CategoryService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { OpenAIService } from '../services/openai/OpenAIService';

const router = Router();
const categoryService = new CategoryService();

router.get('/', async (req, res, next) => {
  try {
    const categories = await categoryService.findAll();
    res.json(ApiResponse.success(categories));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const category = await categoryService.create(req.body);
    res.status(201).json(ApiResponse.success(category));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.findById(Number(req.params.id));
    res.json(ApiResponse.success(category));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const category = await categoryService.update(Number(req.params.id), req.body);
    res.json(ApiResponse.success(category));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await categoryService.delete(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/test-translation', async (req, res, next) => {
  try {
    const { text, language } = req.body;
    if (!text || !language) {
      throw new ApiError(400, 'Text and language are required');
    }
    const service = new OpenAIService();
    const result = await service.translateText(text, language, 'category');
    res.json(ApiResponse.success({ translation: result }));
  } catch (error) {
    next(error);
  }
});

export default router;