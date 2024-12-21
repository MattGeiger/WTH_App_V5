import { PrismaClient, Language } from '@prisma/client';
import { ApiError } from '../utils/ApiError';
import { TranslationService } from './TranslationService';
import { LanguageConfig, getDefaultLanguages } from '../config/languageConfig';

export class LanguageService {
    private prisma: PrismaClient;
    private translationService: TranslationService;

    constructor() {
        this.prisma = new PrismaClient();
        this.translationService = new TranslationService();
    }

    /**
     * Initializes the language table with default supported languages if empty
     */
    async initializeLanguages(): Promise<void> {
        try {
            const count = await this.prisma.language.count();
            if (count === 0) {
                console.log('Initializing default languages...');
                const defaultLanguages = getDefaultLanguages();
                const operations = defaultLanguages.map(lang => ({
                    code: lang.code,
                    name: lang.name,
                    active: lang.active,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));

                await this.prisma.language.createMany({
                    data: operations
                });
                console.log('Default languages initialized successfully');
            }
        } catch (error) {
            console.error('Error initializing languages:', error);
            throw new ApiError(500, `Error initializing languages: ${error.message}`);
        }
    }

    /**
     * Generates translations for all existing items when a language is activated
     */
    private async generateTranslationsForLanguage(languageCode: string): Promise<void> {
        try {
            const [categories, foodItems] = await Promise.all([
                this.prisma.category.findMany(),
                this.prisma.foodItem.findMany()
            ]);

            for (const category of categories) {
                await this.translationService.generateAutomaticTranslations(
                    category.id,
                    'category'
                ).catch(error => {
                    console.error(`Failed to translate category ${category.id} to ${languageCode}:`, error);
                });
            }

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
     * Returns all languages, creating default ones if none exist
     */
    async findAll(): Promise<Language[]> {
        try {
            await this.initializeLanguages();
            const languages = await this.prisma.language.findMany({
                orderBy: { name: 'asc' }
            });
            return languages;
        } catch (error) {
            console.error('Error in findAll:', error);
            throw new ApiError(500, `Error fetching languages: ${error.message}`);
        }
    }

    /**
     * Updates languages in bulk, maintaining active status
     */
    async bulkUpdate(languages: { code: string; name: string; }[]): Promise<Language[]> {
        try {
            await this.initializeLanguages();

            await this.prisma.language.updateMany({
                data: { active: false }
            });

            const operations = languages.map(lang => 
                this.prisma.language.update({
                    where: { code: lang.code },
                    data: { 
                        active: true,
                        updatedAt: new Date()
                    }
                })
            );

            await this.prisma.$transaction(operations);

            for (const lang of languages) {
                await this.generateTranslationsForLanguage(lang.code);
            }

            return this.findAll();
        } catch (error) {
            console.error('Error in bulkUpdate:', error);
            throw new ApiError(500, `Error updating languages: ${error.message}`);
        }
    }

    async findByCode(code: string): Promise<Language> {
        try {
            await this.initializeLanguages();
            const lang = await this.prisma.language.findUnique({
                where: { code }
            });
            if (!lang) {
                throw new ApiError(404, `Language '${code}' not found`);
            }
            return lang;
        } catch (error) {
            console.error('Error in findByCode:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, `Error fetching language: ${error.message}`);
        }
    }

    async findActive(): Promise<Language[]> {
        try {
            await this.initializeLanguages();
            return await this.prisma.language.findMany({
                where: { active: true },
                orderBy: { name: 'asc' }
            });
        } catch (error) {
            console.error('Error in findActive:', error);
            throw new ApiError(500, `Error fetching active languages: ${error.message}`);
        }
    }
}