import { PrismaClient, FoodItem } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';

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
  private translationService: TranslationService;

  constructor() {
    this.prisma = new PrismaClient();
    this.translationService = new TranslationService();
  }

  private async generateTranslations(foodItemId: number): Promise<void> {
    try {
      await this.translationService.generateAutomaticTranslations(foodItemId, 'foodItem');
    } catch (error) {
      console.error(`Failed to generate translations for food item ${foodItemId}:`, error);
    }
  }

  async create(data: CreateFoodItemData): Promise<FoodItem> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new ApiError(400, 'Invalid category ID');
      }

      const { customFields, ...foodItemData } = data;

      const foodItem = await this.prisma.foodItem.create({
        data: {
          ...foodItemData,
          customFields: customFields ? { create: customFields } : undefined
        },
        include: {
          category: true,
          translations: {
            include: {
              language: true
            }
          },
          customFields: true
        }
      });

      // Generate translations asynchronously
      this.generateTranslations(foodItem.id).catch(error => {
        console.error('Failed to generate translations for food item:', error);
      });

      return foodItem;
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
            translations: {
              include: {
                language: true
              }
            },
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
          translations: {
            include: {
              language: true
            }
          },
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

      if (data.categoryId && data.categoryId !== existingItem.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId }
        });
        if (!category) {
          throw new ApiError(400, 'Invalid category ID');
        }
      }

      const { customFields, ...itemData } = data;

      const updatedData = {
        ...existingItem,
        ...itemData,
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
          translations: {
            include: {
              language: true
            }
          },
          customFields: true
        }
      });

      // If name was updated, regenerate translations
      if (data.name && data.name !== existingItem.name) {
        this.generateTranslations(id).catch(error => {
          console.error('Failed to update translations for food item:', error);
        });
      }

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

  async regenerateTranslations(id: number): Promise<void> {
    const item = await this.findById(id);
    if (!item) {
      throw new ApiError(404, 'Food item not found');
    }

    await this.generateTranslations(id);
  }
}