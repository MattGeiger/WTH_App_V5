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
        const { name, itemLimit = 0 } = req.body;
        if (!name || name.trim() === '') {
            throw new ApiError(400, 'Category name is required');
        }

        const parsedLimit = parseInt(itemLimit);
        if (isNaN(parsedLimit) || parsedLimit < 0) {
            throw new ApiError(400, 'Item limit must be a non-negative number');
        }

        const category = await categoryService.create({ 
            name: name.trim(), 
            itemLimit: parsedLimit 
        });

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

        const { name, itemLimit } = req.body;
        const updateData: { name?: string; itemLimit?: number } = {};

        if (name !== undefined) {
            if (name.trim() === '') {
                throw new ApiError(400, 'Category name cannot be empty');
            }
            updateData.name = name.trim();
        }

        if (itemLimit !== undefined) {
            const parsedLimit = parseInt(itemLimit);
            if (isNaN(parsedLimit) || parsedLimit < 0) {
                throw new ApiError(400, 'Item limit must be a non-negative number');
            }
            updateData.itemLimit = parsedLimit;
        }

        const category = await categoryService.update(id, updateData);
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