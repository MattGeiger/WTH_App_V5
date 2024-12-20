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

    console.log('Update Food Item - Request Body:', req.body);
    console.log('Update Food Item - ID:', id);

    // Check if the item exists
    const existingItem = await foodItemService.findById(id);
    if (!existingItem) {
      throw new ApiError(404, 'Food item not found');
    }

    console.log('Existing Item Found:', existingItem);

    // Type check categoryId
    if (req.body.categoryId && typeof req.body.categoryId !== 'number') {
      console.log('Invalid categoryId type:', typeof req.body.categoryId);
      throw new ApiError(400, 'Category ID must be a number');
    }

    // Validate update data
    const updateData = {
      name: req.body.name,
      categoryId: req.body.categoryId,
      itemLimit: req.body.itemLimit,
      limitType: req.body.limitType,
      inStock: req.body.inStock,
      mustGo: req.body.mustGo,
      lowSupply: req.body.lowSupply,
      kosher: req.body.kosher,
      halal: req.body.halal,
      vegetarian: req.body.vegetarian,
      vegan: req.body.vegan,
      glutenFree: req.body.glutenFree,
      organic: req.body.organic,
      readyToEat: req.body.readyToEat
    };

    console.log('Processed Update Data:', updateData);

    const foodItem = await foodItemService.update(id, updateData);
    console.log('Update Successful:', foodItem);

    res.json(ApiResponse.success(foodItem, 'Food item updated successfully'));
  } catch (error) {
    console.error('Update Error:', error);
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