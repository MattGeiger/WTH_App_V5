import { PrismaClient, Translation } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

export class TranslationService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

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
            where: { code: languageCode }
        });

        if (!language) {
            throw new ApiError(400, 'Invalid language code');
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

    async createForCategory(categoryId: number, data: { languageCode: string; translatedText: string }) {
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        const language = await this.prisma.language.findFirst({
            where: { code: data.languageCode }
        });

        if (!language) {
            throw new ApiError(400, 'Invalid language code');
        }

        return await this.prisma.translation.create({
            data: {
                translatedText: data.translatedText,
                categoryId,
                languageId: language.id
            },
            include: { language: true }
        });
    }

    async createForFoodItem(foodItemId: number, data: { languageCode: string; translatedText: string }) {
        const foodItem = await this.prisma.foodItem.findUnique({
            where: { id: foodItemId }
        });

        if (!foodItem) {
            throw new ApiError(404, 'Food item not found');
        }

        const language = await this.prisma.language.findFirst({
            where: { code: data.languageCode }
        });

        if (!language) {
            throw new ApiError(400, 'Invalid language code');
        }

        return await this.prisma.translation.create({
            data: {
                translatedText: data.translatedText,
                foodItemId,
                languageId: language.id
            },
            include: { language: true }
        });
    }

    async update(id: number, data: { translatedText: string }) {
        const translation = await this.prisma.translation.findUnique({
            where: { id }
        });

        if (!translation) {
            throw new ApiError(404, 'Translation not found');
        }

        return await this.prisma.translation.update({
            where: { id },
            data: { translatedText: data.translatedText },
            include: { language: true }
        });
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