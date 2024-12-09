import { PrismaClient, Translation } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { OpenAIService } from './openai/OpenAIService';
import { LanguageConfig } from '../config/languageConfig';

export class TranslationService {
    private prisma: PrismaClient;
    private openAI: OpenAIService;

    constructor() {
        this.prisma = new PrismaClient();
        this.openAI = new OpenAIService();
    }

    // Existing findAll method remains the same
    async findAll(params: { languageCode?: string; categoryId?: number; foodItemId?: number }) {
        return await this.prisma.translation.findMany({
            where: {
                AND: [
                    params.categoryId ? { categoryId: params.categoryId } : {},
                    params.foodItemId ? { foodItemId: params.foodItemId } : {},
                    params.languageCode ? { language: { code: params.languageCode } } : {}
                ]
            },
            include: { language: true }
        });
    }

    // Existing findById method remains the same
    async findById(id: number) {
        const translation = await this.prisma.translation.findUnique({
            where: { id },
            include: { language: true }
        });

        if (!translation) {
            throw new ApiError(404, 'Translation not found');
        }

        return translation;
    }

    // Updated to handle automatic translations
    async findByLanguage(languageCode: string, params: { categoryId?: number; foodItemId?: number }) {
        const language = await this.prisma.language.findFirst({
            where: { code: languageCode, active: true }
        });

        if (!language) {
            throw new ApiError(400, 'Invalid or inactive language code');
        }

        return await this.prisma.translation.findMany({
            where: {
                languageId: language.id,
                ...(params.categoryId && { categoryId: params.categoryId }),
                ...(params.foodItemId && { foodItemId: params.foodItemId })
            },
            include: { language: true }
        });
    }

    // Updated to handle automatic translations
    async createForCategory(categoryId: number, data: { languageCode: string; translatedText: string; isAutomatic?: boolean }) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        const language = await this.prisma.language.findFirst({
            where: { code: data.languageCode, active: true }
        });

        if (!language) {
            throw new ApiError(400, 'Invalid or inactive language code');
        }

        // Check for existing translation
        const existingTranslation = await this.prisma.translation.findFirst({
            where: {
                categoryId,
                languageId: language.id
            }
        });

        if (existingTranslation) {
            return this.update(existingTranslation.id, { 
                translatedText: data.translatedText,
                isAutomatic: data.isAutomatic ?? false
            });
        }

        return await this.prisma.translation.create({
            data: {
                translatedText: data.translatedText,
                categoryId,
                languageId: language.id,
                isAutomatic: data.isAutomatic ?? false
            },
            include: { language: true }
        });
    }

    // Similar update for food items
    async createForFoodItem(foodItemId: number, data: { languageCode: string; translatedText: string; isAutomatic?: boolean }) {
        const foodItem = await this.prisma.foodItem.findUnique({
            where: { id: foodItemId }
        });

        if (!foodItem) {
            throw new ApiError(404, 'Food item not found');
        }

        const language = await this.prisma.language.findFirst({
            where: { code: data.languageCode, active: true }
        });

        if (!language) {
            throw new ApiError(400, 'Invalid or inactive language code');
        }

        const existingTranslation = await this.prisma.translation.findFirst({
            where: {
                foodItemId,
                languageId: language.id
            }
        });

        if (existingTranslation) {
            return this.update(existingTranslation.id, { 
                translatedText: data.translatedText,
                isAutomatic: data.isAutomatic ?? false
            });
        }

        return await this.prisma.translation.create({
            data: {
                translatedText: data.translatedText,
                foodItemId,
                languageId: language.id,
                isAutomatic: data.isAutomatic ?? false
            },
            include: { language: true }
        });
    }

    // Updated update method
    async update(id: number, data: { translatedText: string; isAutomatic?: boolean }) {
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
                isAutomatic: data.isAutomatic ?? translation.isAutomatic
            },
            include: { language: true }
        });
    }

    // New method for automatic translations
    async generateAutomaticTranslations(itemId: number, itemType: 'category' | 'foodItem') {
        const item = await this.prisma[itemType].findUnique({
            where: { id: itemId }
        });

        if (!item) {
            throw new ApiError(404, `${itemType} not found`);
        }

        const activeLanguages = await this.prisma.language.findMany({
            where: { active: true }
        });

        const results = [];
        for (const language of activeLanguages) {
            if (language.code === LanguageConfig.DEFAULT_LANGUAGE) continue;

            try {
                const translation = await this.openAI.translateText(
                    item.name,
                    language.code,
                    itemType
                );

                const savedTranslation = await this[`createFor${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`](
                    itemId,
                    {
                        languageCode: language.code,
                        translatedText: translation,
                        isAutomatic: true
                    }
                );

                results.push(savedTranslation);
            } catch (error) {
                console.error(`Failed to generate translation for ${itemType} ${itemId} in ${language.code}:`, error);
                // Continue with next language even if one fails
            }
        }

        return results;
    }

    // Existing delete method remains the same
    async delete(id: number) {
        const translation = await this.prisma.translation.findUnique({
            where: { id }
        });

        if (!translation) {
            throw new ApiError(404, 'Translation not found');
        }

        await this.prisma.translation.delete({
            where: { id }
        });
    }
}