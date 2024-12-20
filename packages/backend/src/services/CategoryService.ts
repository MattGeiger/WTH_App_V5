import { PrismaClient, Category } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';
import { ErrorTypes, ErrorMessages } from '../utils/errorConstants';
import { handleServiceError } from '../utils/errorHandler';

export class CategoryService {
    private prisma: PrismaClient;
    private translationService: TranslationService;

    constructor() {
        this.prisma = new PrismaClient();
        this.translationService = new TranslationService();
    }

    async create(data: { name: string }): Promise<Category> {
        try {
            const category = await this.prisma.category.create({
                data,
                include: {
                    translations: {
                        include: {
                            language: true
                        }
                    }
                }
            });

            this.translationService.generateAutomaticTranslations(category.id, 'category')
                .catch(error => console.error('Translation generation failed:', error));

            return category;
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.CREATE_ERROR('category'));
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
            throw handleServiceError(error, 'Error fetching categories');
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
                throw new ApiError(ErrorTypes.NOT_FOUND, ErrorMessages.CATEGORY_NOT_FOUND);
            }

            return category;
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.CATEGORY_NOT_FOUND);
        }
    }

    async update(id: number, data: { name: string }): Promise<Category> {
        try {
            const existingCategory = await this.findById(id);

            const updated = await this.prisma.category.update({
                where: { id },
                data,
                include: {
                    translations: {
                        include: {
                            language: true
                        }
                    }
                }
            });

            if (existingCategory && data.name !== existingCategory.name) {
                this.translationService.generateAutomaticTranslations(id, 'category')
                    .catch(error => console.error('Translation update failed:', error));
            }

            return updated;
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.UPDATE_ERROR('category'));
        }
    }

    async delete(id: number): Promise<void> {
        try {
            await this.findById(id);
            await this.prisma.category.delete({ where: { id } });
        } catch (error) {
            throw handleServiceError(error, ErrorMessages.DELETE_ERROR('category'));
        }
    }
}