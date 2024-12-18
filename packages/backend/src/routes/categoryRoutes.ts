import { Router } from 'express';
import { CategoryService } from '../services/CategoryService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();
const categoryService = new CategoryService();

// GET /categories
router.get('/', async (req, res, next) => {
    try {
        const categories = await categoryService.findAll();
        res.json(ApiResponse.success(categories));
    } catch (error) {
        next(error);
    }
});

// GET /categories/:id
router.get('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new ApiError(400, 'Invalid category ID');
        }

        const category = await categoryService.findById(id);
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        res.json(ApiResponse.success(category));
    } catch (error) {
        next(error);
    }
});

// POST /categories
router.post('/', async (req, res, next) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json(ApiResponse.error('Category name is required'));
        }

        const category = await categoryService.create({ name });
        res.status(201).json(ApiResponse.success(category, 'Category created successfully'));
    } catch (error) {
        next(error);
    }
});

// PUT /categories/:id
router.put('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new ApiError(400, 'Invalid category ID');
        }

        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json(ApiResponse.error('Category name is required'));
        }

        const category = await categoryService.update(id, { name });
        res.json(ApiResponse.success(category, 'Category updated successfully'));
    } catch (error) {
        next(error);
    }
});

// DELETE /categories/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new ApiError(400, 'Invalid category ID');
        }

        await categoryService.delete(id);
        res.json(ApiResponse.success(null, 'Category deleted successfully'));
    } catch (error) {
        next(error);
    }
});

export default router;