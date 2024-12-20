import { PrismaClient, FoodItem, Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';
import { ErrorTypes, ErrorMessages } from '../utils/errorConstants';
import { handleServiceError } from '../utils/errorHandler';

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
    if (this.testMode) return;
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
        throw new ApiError(ErrorTypes.VALIDATION, ErrorMessages.INVALID_CATEGORY);
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

      this.generateTranslations(foodItem.id);

      return foodItem;
    } catch (error) {
      throw handleServiceError(error, ErrorMessages.CREATE_ERROR('food item'));
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
    try {
      const existingItem = await this.prisma.foodItem.findUnique({
        where: { id },
        include: { customFields: true }
      });

      if (!existingItem) {
        throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.FOOD_ITEM_NOT_FOUND);
      }

      if (data.categoryId) {
        const category = await this.prisma.category.findUnique({
          where: { id: data.categoryId }
        });

        if (!category) {
          throw new ApiError(ErrorTypes.VALIDATION, ErrorMessages.INVALID_CATEGORY);
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

      if (data.name && data.name !== existingItem.name) {
        this.generateTranslations(id);
      }

      return updatedItem;
    } catch (error) {
      throw handleServiceError(error, ErrorMessages.UPDATE_ERROR('food item'));
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
          }
        }
      });

      if (!item) {
        throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.FOOD_ITEM_NOT_FOUND);
      }

      return item;
    } catch (error) {
      throw handleServiceError(error, ErrorMessages.FOOD_ITEM_NOT_FOUND);
    }
  }

  async findAll(params: {
    categoryId?: number;
    includeOutOfStock?: boolean;
  } = {}): Promise<FoodItem[]> {
    try {
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
    } catch (error) {
      throw handleServiceError(error, 'Error fetching food items');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const existingItem = await this.findById(id);
      if (!existingItem) {
        throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.FOOD_ITEM_NOT_FOUND);
      }

      await this.prisma.foodItem.delete({
        where: { id }
      });
    } catch (error) {
      throw handleServiceError(error, ErrorMessages.DELETE_ERROR('food item'));
    }
  }
}