import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { OpenAIService } from './openai/OpenAIService';
import { LanguageConfig } from '../config/languageConfig';

type ItemType = 'category' | 'foodItem';

interface CreateTranslationData {
    languageCode: string;
    translatedText: string;
    isAutomatic?: boolean;
}

export class TranslationService {
    private prisma: PrismaClient;
    private openAI: OpenAIService;

    constructor() {
        this.prisma = new PrismaClient();
        this.openAI = new OpenAIService();
    }

    async findAll(params: { 
        languageCode?: string; 
        categoryId?: number; 
        foodItemId?: number;
        type?: ItemType;
    }) {
        console.log('TranslationService findAll params:', params);

        const whereClause: any = {
            AND: [
                params.languageCode ? { language: { code: params.languageCode } } : {},
                params.categoryId ? { categoryId: params.categoryId } : {},
                params.foodItemId ? { foodItemId: params.foodItemId } : {}
            ]
        };

        if (params.type) {
            if (params.type === 'category') {
                whereClause.AND.push({ categoryId: { not: null }, foodItemId: null });
            } else if (params.type === 'foodItem') {
                whereClause.AND.push({ foodItemId: { not: null }, categoryId: null });
            }
        }

        console.log('Final where clause:', whereClause);

        return await this.prisma.translation.findMany({
            where: whereClause,
            include: { 
                language: true,
                category: true,
                foodItem: true
            }
        });
    }

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

    async createForCategory(categoryId: number, data: CreateTranslationData) {
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

    async createForFoodItem(foodItemId: number, data: CreateTranslationData) {
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

    async generateAutomaticTranslations(itemId: number, itemType: ItemType) {
        const item = itemType === 'category' 
            ? await this.prisma.category.findUnique({ where: { id: itemId } })
            : await this.prisma.foodItem.findUnique({ where: { id: itemId } });

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

                const createMethod = itemType === 'category' 
                    ? this.createForCategory.bind(this)
                    : this.createForFoodItem.bind(this);

                const savedTranslation = await createMethod(
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
            }
        }

        return results;
    }

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