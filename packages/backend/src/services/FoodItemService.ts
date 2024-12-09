import { PrismaClient, FoodItem } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

interface CreateFoodItemData {
  name: string;
  categoryId: number;
  imageUrl?: string;
  thumbnailUrl?: string;
  itemLimit?: number;
  inStock?: boolean;
  mustGo?: boolean;
  lowSupply?: boolean;
  kosher?: boolean;
  halal?: boolean;
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  organic?: boolean;
  readyToEat?: boolean;
  customFields?: { key: string; value: string; }[];
}

interface UpdateFoodItemData extends Partial<CreateFoodItemData> {}

export class FoodItemService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CreateFoodItemData): Promise<FoodItem> {
    try {
      // Verify category exists
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new ApiError(400, 'Invalid category ID');
      }

      const { customFields, ...foodItemData } = data;

      return await this.prisma.foodItem.create({
        data: {
          ...foodItemData,
          customFields: customFields ? { create: customFields } : undefined
        },
        include: {
          category: true,
          translations: true,
          customFields: true
        }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error creating food item');
    }
  }

  async findAll(params: {
    categoryId?: number;
    includeOutOfStock?: boolean;
    page?: number;
    limit?: number;
  } = {}): Promise<{ items: FoodItem[]; total: number }> {
    const { categoryId, includeOutOfStock = true, page = 1, limit = 50 } = params;
    
    try {
      const where = {
        ...(categoryId && { categoryId }),
        ...(!includeOutOfStock && { inStock: true })
      };

      const [items, total] = await Promise.all([
        this.prisma.foodItem.findMany({
          where,
          include: {
            category: true,
            translations: true,
            customFields: true
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        this.prisma.foodItem.count({ where })
      ]);

      return { items, total };
    } catch (error) {
      throw new ApiError(500, 'Error fetching food items');
    }
  }

  async findById(id: number): Promise<FoodItem | null> {
    try {
      const item = await this.prisma.foodItem.findUnique({
        where: { id },
        include: {
          category: true,
          translations: true,
          customFields: true
        }
      });

      if (!item) {
        throw new ApiError(404, 'Food item not found');
      }

      return item;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching food item');
    }
  }

  async update(id: number, data: UpdateFoodItemData): Promise<FoodItem> {
    try {
      const existingItem = await this.prisma.foodItem.findUnique({
        where: { id },
        include: { customFields: true }
      });

      if (!existingItem) {
        throw new ApiError(404, 'Food item not found');
      }

      // If categoryId is being updated, verify new category exists
      if (data.categoryId && data.categoryId !== existingItem.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId }
        });
        if (!category) {
          throw new ApiError(400, 'Invalid category ID');
        }
      }

      const { customFields, ...itemData } = data;
      const globalUpperLimit =  50
      // For this example, we'll just ensure itemLimit remains as is if not provided.

      // Merge existing item values with the new data, ensuring booleans and itemLimit are handled correctly
      const updatedData = {
        name: itemData.name ?? existingItem.name,
        categoryId: itemData.categoryId ?? existingItem.categoryId,
        imageUrl: itemData.imageUrl ?? existingItem.imageUrl,
        thumbnailUrl: itemData.thumbnailUrl ?? existingItem.thumbnailUrl,
        itemLimit: (itemData.itemLimit !== undefined) ? itemData.itemLimit : existingItem.itemLimit,
        inStock: (itemData.inStock !== undefined) ? itemData.inStock : existingItem.inStock,
        mustGo: (itemData.mustGo !== undefined) ? itemData.mustGo : existingItem.mustGo,
        lowSupply: (itemData.lowSupply !== undefined) ? itemData.lowSupply : existingItem.lowSupply,
        kosher: (itemData.kosher !== undefined) ? itemData.kosher : existingItem.kosher,
        halal: (itemData.halal !== undefined) ? itemData.halal : existingItem.halal,
        vegetarian: (itemData.vegetarian !== undefined) ? itemData.vegetarian : existingItem.vegetarian,
        vegan: (itemData.vegan !== undefined) ? itemData.vegan : existingItem.vegan,
        glutenFree: (itemData.glutenFree !== undefined) ? itemData.glutenFree : existingItem.glutenFree,
        organic: (itemData.organic !== undefined) ? itemData.organic : existingItem.organic,
        readyToEat: (itemData.readyToEat !== undefined) ? itemData.readyToEat : existingItem.readyToEat,
        updatedAt: new Date(),
        ...(customFields ? {
          customFields: {
            deleteMany: {},
            create: customFields
          }
        } : {})
      };

      const updatedItem = await this.prisma.foodItem.update({
        where: { id },
        data: updatedData,
        include: {
          category: true,
          translations: true,
          customFields: true
        }
      });

      return updatedItem;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error updating food item');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.foodItem.delete({
        where: { id }
      });
    } catch (error) {
      throw new ApiError(400, 'Error deleting food item');
    }
  }
}
