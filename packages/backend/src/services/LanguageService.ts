import { PrismaClient, Language } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';

export class LanguageService {
    private prisma: PrismaClient;
    private translationService: TranslationService;

    constructor() {
        this.prisma = new PrismaClient();
        this.translationService = new TranslationService();
    }

    /**
     * Generates translations for all existing items when a language is activated
     */
    private async generateTranslationsForLanguage(languageCode: string): Promise<void> {
        try {
            // Get all categories and food items
            const [categories, foodItems] = await Promise.all([
                this.prisma.category.findMany(),
                this.prisma.foodItem.findMany()
            ]);

            // Generate translations for categories
            for (const category of categories) {
                await this.translationService.generateAutomaticTranslations(
                    category.id,
                    'category'
                ).catch(error => {
                    console.error(`Failed to translate category ${category.id} to ${languageCode}:`, error);
                });
            }

            // Generate translations for food items
            for (const item of foodItems) {
                await this.translationService.generateAutomaticTranslations(
                    item.id,
                    'foodItem'
                ).catch(error => {
                    console.error(`Failed to translate food item ${item.id} to ${languageCode}:`, error);
                });
            }
        } catch (error) {
            console.error(`Failed to generate translations for language ${languageCode}:`, error);
        }
    }

    /**
     * Adds a new language to the database.
     * Throws ApiError if the language code already exists.
     */
    async addLanguage(code: string, name?: string): Promise<Language> {
        if (!code || code.trim() === '') {
            throw new ApiError(400, 'Language code is required');
        }

        const existing = await this.prisma.language.findUnique({ where: { code } });
        if (existing) {
            throw new ApiError(400, `Language code '${code}' already exists`);
        }

        try {
            const lang = await this.prisma.language.create({
                data: {
                    code,
                    name: name || code.toUpperCase(),
                    active: true
                }
            });

            // Generate translations for new language asynchronously
            this.generateTranslationsForLanguage(code).catch(error => {
                console.error(`Failed to generate initial translations for ${code}:`, error);
            });

            return lang;
        } catch (error) {
            throw new ApiError(500, 'Error creating language');
        }
    }

    /**
     * Updates a language's active status or name.
     * Generates translations when a language is activated.
     */
    async update(id: number, data: { active?: boolean; name?: string }): Promise<Language> {
        try {
            const language = await this.prisma.language.update({
                where: { id },
                data
            });

            // If language is being activated, generate translations
            if (data.active === true) {
                this.generateTranslationsForLanguage(language.code).catch(error => {
                    console.error(`Failed to generate translations after activating ${language.code}:`, error);
                });
            }

            return language;
        } catch (error) {
            throw new ApiError(404, `Language with ID ${id} not found`);
        }
    }

    /**
     * Returns all languages.
     */
    async findAll(): Promise<Language[]> {
        try {
            return await this.prisma.language.findMany();
        } catch (error) {
            throw new ApiError(500, 'Error fetching languages');
        }
    }

    /**
     * Returns a language by code.
     * Throws ApiError if not found.
     */
    async findByCode(code: string): Promise<Language> {
        try {
            const lang = await this.prisma.language.findUnique({
                where: { code }
            });
            if (!lang) {
                throw new ApiError(404, `Language '${code}' not found`);
            }
            return lang;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Error fetching language');
        }
    }

    /**
     * Fetches all languages that are active.
     */
    async findActive(): Promise<Language[]> {
        try {
            return await this.prisma.language.findMany({
                where: { active: true }
            });
        } catch (error) {
            throw new ApiError(500, 'Error fetching active languages');
        }
    }

    /**
     * Regenerates all translations for a specific language
     */
    async regenerateAllTranslations(code: string): Promise<void> {
        const language = await this.findByCode(code);
        if (!language.active) {
            throw new ApiError(400, 'Cannot regenerate translations for inactive language');
        }

        await this.generateTranslationsForLanguage(code);
    }
}