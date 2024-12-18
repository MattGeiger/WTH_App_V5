import { Router } from 'express';
import { FoodItemService } from '../services/FoodItemService';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const router = Router();
const foodItemService = new FoodItemService();

// GET /food-items
router.get('/', async (req, res, next) => {
  try {
    const { categoryId, includeOutOfStock, page, limit } = req.query;
    
    const params = {
      categoryId: categoryId ? parseInt(categoryId as string) : undefined,
      includeOutOfStock: includeOutOfStock === 'true',
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50
    };

    const { items, total } = await foodItemService.findAll(params);
    res.json(ApiResponse.paginated(items, params.page, params.limit, total));
  } catch (error) {
    next(error);
  }
});

// GET /food-items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid food item ID');
    }

    const foodItem = await foodItemService.findById(id);
    res.json(ApiResponse.success(foodItem));
  } catch (error) {
    next(error);
  }
});

// POST /food-items
router.post('/', async (req, res, next) => {
  try {
    const { 
      name, 
      categoryId,
      itemLimit,
      inStock,
      mustGo,
      lowSupply,
      kosher,
      halal,
      vegetarian,
      vegan,
      glutenFree,
      organic,
      readyToEat,
      customFields 
    } = req.body;

    if (!name || typeof name !== 'string') {
      throw new ApiError(400, 'Name is required and must be a string');
    }

    if (!categoryId || typeof categoryId !== 'number') {
      throw new ApiError(400, 'Valid category ID is required');
    }

    const foodItem = await foodItemService.create({
      name,
      categoryId,
      itemLimit,
      inStock,
      mustGo,
      lowSupply,
      kosher,
      halal,
      vegetarian,
      vegan,
      glutenFree,
      organic,
      readyToEat,
      customFields
    });

    res.status(201).json(ApiResponse.success(foodItem, 'Food item created successfully'));
  } catch (error) {
    next(error);
  }
});

// PUT /food-items/:id
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid food item ID');
    }

    // Check if the item exists
    const existingItem = await foodItemService.findById(id);
    if (!existingItem) {
      throw new ApiError(404, 'Food item not found');
    }

    const foodItem = await foodItemService.update(id, req.body);
    res.json(ApiResponse.success(foodItem, 'Food item updated successfully'));
  } catch (error) {
    next(error);
  }
});

// DELETE /food-items/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      throw new ApiError(400, 'Invalid food item ID');
    }

    // Check if the item exists
    const existingItem = await foodItemService.findById(id);
    if (!existingItem) {
      throw new ApiError(404, 'Food item not found');
    }

    await foodItemService.delete(id);
    res.json(ApiResponse.success(null, 'Food item deleted successfully'));
  } catch (error) {
    next(error);
  }
});

export default router;