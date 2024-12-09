import { PrismaClient, Category } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';

export class CategoryService {
    private prisma: PrismaClient;
    private translationService: TranslationService;

    constructor() {
        this.prisma = new PrismaClient();
        this.translationService = new TranslationService();
    }

    async create(data: { name: string }): Promise<Category> {
        try {
            // Create the category first
            const category = await this.prisma.category.create({
                data: {
                    name: data.name,
                }
            });

            // Generate translations asynchronously
            this.generateTranslations(category.id).catch(error => {
                console.error('Failed to generate translations for category:', error);
            });

            return category;
        } catch (error) {
            throw new ApiError(400, 'Error creating category');
        }
    }

    private async generateTranslations(categoryId: number): Promise<void> {
        try {
            await this.translationService.generateAutomaticTranslations(categoryId, 'category');
        } catch (error) {
            // Log error but don't throw - translation failures shouldn't block category creation
            console.error(`Failed to generate translations for category ${categoryId}:`, error);
        }
    }

    async findAll(): Promise<Category[]> {
        try {
            return await this.prisma.category.findMany({
                include: {
                    translations: {
                        include: {
                            language: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new ApiError(500, 'Error fetching categories');
        }
    }

    async findById(id: number): Promise<Category | null> {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id },
                include: {
                    translations: {
                        include: {
                            language: true
                        }
                    }
                }
            });

            if (!category) {
                throw new ApiError(404, 'Category not found');
            }

            return category;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Error fetching category');
        }
    }

    async update(id: number, data: { name: string }): Promise<Category> {
        try {
            const category = await this.prisma.category.update({
                where: { id },
                data: {
                    name: data.name,
                    updatedAt: new Date()
                }
            });

            // Regenerate translations after name update
            this.generateTranslations(category.id).catch(error => {
                console.error('Failed to update translations for category:', error);
            });

            return category;
        } catch (error) {
            throw new ApiError(400, 'Error updating category');
        }
    }

    async delete(id: number): Promise<void> {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id }
            });

            if (!category) {
                throw new ApiError(404, 'Category not found');
            }

            // Delete will cascade to translations due to Prisma schema relations
            await this.prisma.category.delete({
                where: { id }
            });
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(400, 'Error deleting category');
        }
    }

    async regenerateTranslations(id: number): Promise<void> {
        const category = await this.findById(id);
        if (!category) {
            throw new ApiError(404, 'Category not found');
        }

        await this.generateTranslations(id);
    }
}