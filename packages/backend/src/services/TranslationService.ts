import { PrismaClient, Translation } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

interface CreateTranslationData {
  language: string;
  translatedText: string;
  categoryId?: number;
  foodItemId?: number;
}

interface UpdateTranslationData {
  translatedText: string;
}

export class TranslationService {
  private prisma: PrismaClient;
  private supportedLanguages: string[];

  constructor() {
    this.prisma = new PrismaClient();
    this.supportedLanguages = process.env.SUPPORTED_LANGUAGES ? 
      JSON.parse(process.env.SUPPORTED_LANGUAGES) : 
      ['es', 'ru', 'uk', 'zh', 'vi', 'ko', 'ar'];
  }

  async createForCategory(categoryId: number, data: CreateTranslationData): Promise<Translation> {
    try {
      if (!this.supportedLanguages.includes(data.language)) {
        throw new ApiError(400, `Language ${data.language} is not supported`);
      }

      // Verify category exists
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        throw new ApiError(404, 'Category not found');
      }

      return await this.prisma.translation.create({
        data: {
          language: data.language,
          translatedText: data.translatedText,
          categoryId
        }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error creating category translation');
    }
  }

  async createForFoodItem(foodItemId: number, data: CreateTranslationData): Promise<Translation> {
    try {
      if (!this.supportedLanguages.includes(data.language)) {
        throw new ApiError(400, `Language ${data.language} is not supported`);
      }

      // Verify food item exists
      const foodItem = await this.prisma.foodItem.findUnique({
        where: { id: foodItemId }
      });

      if (!foodItem) {
        throw new ApiError(404, 'Food item not found');
      }

      return await this.prisma.translation.create({
        data: {
          language: data.language,
          translatedText: data.translatedText,
          foodItemId
        }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error creating food item translation');
    }
  }

  async findById(id: number): Promise<Translation | null> {
    try {
      const translation = await this.prisma.translation.findUnique({
        where: { id }
      });

      if (!translation) {
        throw new ApiError(404, 'Translation not found');
      }

      return translation;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching translation');
    }
  }

  async findByLanguage(language: string, params: {
    categoryId?: number;
    foodItemId?: number;
  }): Promise<Translation[]> {
    try {
      if (!this.supportedLanguages.includes(language)) {
        throw new ApiError(400, `Language ${language} is not supported`);
      }

      return await this.prisma.translation.findMany({
        where: {
          language,
          ...params
        }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, 'Error fetching translations');
    }
  }

  async update(id: number, data: UpdateTranslationData): Promise<Translation> {
    try {
      // Verify translation exists
      const translation = await this.prisma.translation.findUnique({
        where: { id }
      });

      if (!translation) {
        throw new ApiError(404, 'Translation not found');
      }

      return await this.prisma.translation.update({
        where: { id },
        data: {
          translatedText: data.translatedText,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, 'Error updating translation');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.prisma.translation.delete({
        where: { id }
      });
    } catch (error) {
      throw new ApiError(400, 'Error deleting translation');
    }
  }
}