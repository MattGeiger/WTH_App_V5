import { PrismaClient, FoodItem, Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';

// Use Prisma's types
type FoodItemCreateInput = Prisma.FoodItemCreateInput;
type FoodItemUpdateInput = Prisma.FoodItemUpdateInput;

export class FoodItemService {
  private prisma: PrismaClient;
  private translationService: TranslationService;
  private testMode: boolean;

  constructor(testMode = false) {
    this.prisma = new PrismaClient();
    this.translationService = new TranslationService();
    this.testMode = testMode;
  }

  private async generateTranslations(foodItemId: number): Promise<void> {
    if (this.testMode) return; // Skip translations in test mode
    
    try {
      await this.translationService.generateAutomaticTranslations(foodItemId, 'foodItem');
    } catch (error) {
      console.error(`Failed to generate translations for food item ${foodItemId}:`, error);
    }
  }

  async create(data: {
    name: string;
    categoryId: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    itemLimit?: number;
    limitType?: string;
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
  }): Promise<FoodItem> {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!category) {
        throw new ApiError(400, 'Invalid category ID');
      }

      const { customFields, categoryId, ...foodItemData } = data;

      const createData: FoodItemCreateInput = {
        ...foodItemData,
        limitType: foodItemData.limitType || 'perHousehold',
        category: {
          connect: { id: categoryId }
        },
        customFields: customFields ? {
          create: customFields
        } : undefined
      };

      const foodItem = await this.prisma.foodItem.create({
        data: createData,
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
      this.generateTranslations(foodItem.id);

      return foodItem;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error creating food item');
    }
  }

  async update(id: number, data: {
    name?: string;
    categoryId?: number;
    imageUrl?: string;
    thumbnailUrl?: string;
    itemLimit?: number;
    limitType?: string;
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
  }): Promise<FoodItem> {
    console.log('FoodItemService.update - Input Data:', { id, data });
    try {
      const existingItem = await this.prisma.foodItem.findUnique({
        where: { id },
        include: { customFields: true }
      });

      console.log('FoodItemService.update - Existing Item:', existingItem);

      if (!existingItem) {
        throw new ApiError(404, 'Food item not found');
      }

      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId }
        });

        if (!category) {
          throw new ApiError(400, 'Invalid category ID');
        }
      }

      const { customFields, categoryId, ...updateData } = data;

      const prismaUpdateData: FoodItemUpdateInput = {
        ...updateData,
        ...(categoryId && {
          category: {
            connect: { id: categoryId }
          }
        })
      };

      console.log('FoodItemService.update - Final Update Data:', prismaUpdateData);

      try {
        const updatedItem = await this.prisma.foodItem.update({
          where: { id },
          data: prismaUpdateData,
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

        console.log('FoodItemService.update - Update Success:', updatedItem);

        // If name was updated, regenerate translations
        if (data.name && data.name !== existingItem.name) {
          this.generateTranslations(id);
        }

        return updatedItem;
      } catch (error) {
        console.error('FoodItemService.update - Prisma Error:', error);
        throw error;
      }

    } catch (error) {
      console.error('FoodItemService.update - Error:', error);
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error updating food item');
    }
  }

  async findById(id: number): Promise<FoodItem | null> {
    return await this.prisma.foodItem.findUnique({
      where: { id },
      include: {
        category: true,
        translations: {
          include: {
            language: true
          }
        }
      }
    });
  }

  async findAll(params: {
    categoryId?: number;
    includeOutOfStock?: boolean;
  } = {}): Promise<FoodItem[]> {
    const { categoryId, includeOutOfStock = true } = params;
    
    return await this.prisma.foodItem.findMany({
      where: {
        ...(categoryId && { categoryId }),
        ...(!includeOutOfStock && { inStock: true })
      },
      include: {
        category: true,
        translations: {
          include: {
            language: true
          }
        }
      }
    });
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