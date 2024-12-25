import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { OpenAIService } from './openai/OpenAIService';
import { LanguageConfig } from '../config/languageConfig';
import { ErrorTypes, ErrorMessages } from '../utils/errorConstants';
import { handleServiceError } from '../utils/errorHandler';

type ItemType = 'category' | 'foodItem' | 'customInput';

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
        try {
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
                } else if (params.type === 'customInput') {
                    whereClause.AND.push({ categoryId: null, foodItemId: null });
                }
            }

            return await this.prisma.translation.findMany({
                where: whereClause,
                include: { 
                    language: true,
                    category: true,
                    foodItem: true
                }
            });
        } catch (error) {
            throw handleServiceError(error, 'Error fetching translations');
        }
    }

    async findCustom(languageCode?: string) {
        try {
            const whereClause: any = {
                categoryId: null,
                foodItemId: null
            };

            if (languageCode) {
                whereClause.language = { code: languageCode };
            }

            return await this.prisma.translation.findMany({
                where: whereClause,
                include: {
                    language: true
                }
            });
        } catch (error) {
            throw handleServiceError(error, 'Error fetching custom translations');
        }
    }

    async findById(id: number) {
        try {
            const translation = await this.prisma.translation.findUnique({
                where: { id },
                include: { language: true }
            });

            if (!translation) {
                throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.TRANSLATION_NOT_FOUND);
            }

            return translation;
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.TRANSLATION_NOT_FOUND);
        }
    }

    async findByLanguage(languageCode: string, params: { categoryId?: number; foodItemId?: number }) {
        try {
            const language = await this.prisma.language.findFirst({
                where: { code: languageCode, active: true }
            });

            if (!language) {
                throw new ApiError(ErrorTypes.VALIDATION, ErrorMessages.INVALID_LANGUAGE);
            }

            return await this.prisma.translation.findMany({
                where: {
                    languageId: language.id,
                    ...(params.categoryId && { categoryId: params.categoryId }),
                    ...(params.foodItemId && { foodItemId: params.foodItemId })
                },
                include: { language: true }
            });
        } catch (error) {
            throw handleServiceError(error, `Error fetching translations for language: ${languageCode}`);
        }
    }

    async createCustom(text: string, languageCode: string) {
        try {
            const language = await this.prisma.language.findFirst({
                where: { code: languageCode, active: true }
            });

            if (!language) {
                throw new ApiError(ErrorTypes.VALIDATION, ErrorMessages.INVALID_LANGUAGE);
            }

            // Get translation from OpenAI
            const translatedText = await this.openAI.translateText(
                text,
                languageCode,
                'customInput'
            );

            // Store translation with original text in metadata
            return await this.prisma.translation.create({
                data: {
                    translatedText,
                    originalText: text,  // Store original text for reference
                    languageId: language.id,
                    isAutomatic: true
                },
                include: { language: true }
            });
        } catch (error) {
            throw handleServiceError(error, 'Error creating custom translation');
        }
    }

    async createForCategory(categoryId: number, data: CreateTranslationData) {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId }
            });

            if (!category) {
                throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.CATEGORY_NOT_FOUND);
            }

            const language = await this.prisma.language.findFirst({
                where: { code: data.languageCode, active: true }
            });

            if (!language) {
                throw new ApiError(ErrorTypes.VALIDATION, ErrorMessages.INVALID_LANGUAGE);
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
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.CREATE_ERROR('category translation'));
        }
    }

    async createForFoodItem(foodItemId: number, data: CreateTranslationData) {
        try {
            const foodItem = await this.prisma.foodItem.findUnique({
                where: { id: foodItemId }
            });

            if (!foodItem) {
                throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.FOOD_ITEM_NOT_FOUND);
            }

            const language = await this.prisma.language.findFirst({
                where: { code: data.languageCode, active: true }
            });

            if (!language) {
                throw new ApiError(ErrorTypes.VALIDATION, ErrorMessages.INVALID_LANGUAGE);
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
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.CREATE_ERROR('food item translation'));
        }
    }

    async update(id: number, data: { translatedText: string; isAutomatic?: boolean }) {
        try {
            const translation = await this.findById(id);

            return await this.prisma.translation.update({
                where: { id },
                data: {
                    translatedText: data.translatedText,
                    isAutomatic: data.isAutomatic ?? translation.isAutomatic
                },
                include: { language: true }
            });
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.UPDATE_ERROR('translation'));
        }
    }

    async generateAutomaticTranslations(itemId: number, itemType: ItemType) {
        try {
            const item = itemType === 'category' 
                ? await this.prisma.category.findUnique({ where: { id: itemId } })
                : await this.prisma.foodItem.findUnique({ where: { id: itemId } });

            if (!item) {
                throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages[itemType === 'category' ? 'CATEGORY_NOT_FOUND' : 'FOOD_ITEM_NOT_FOUND']);
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
                    console.error(`Failed translation for ${itemType} ${itemId} in ${language.code}:`, error);
                }
            }

            return results;
        } catch (error) {
            throw handleServiceError(error, 'Error generating automatic translations');
        }
    }

    async delete(id: number) {
        try {
            await this.findById(id);
            await this.prisma.translation.delete({
                where: { id }
            });
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.DELETE_ERROR('translation'));
        }
    }
}