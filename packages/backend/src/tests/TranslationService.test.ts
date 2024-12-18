import { PrismaClient } from '@prisma/client';
import { LanguageService } from '../services/LanguageService';
import { TranslationService } from '../services/TranslationService';
import { ApiError } from '../utils/ApiError';

// Mock TranslationService
jest.mock('../services/TranslationService');

describe('LanguageService', () => {
    let languageService: LanguageService;
    let prisma: PrismaClient;
    let mockGenerateTranslations: jest.Mock;

    beforeAll(() => {
        // Setup TranslationService mock
        mockGenerateTranslations = jest.fn();
        (TranslationService as jest.Mock).mockImplementation(() => ({
            generateAutomaticTranslations: mockGenerateTranslations
        }));
    });

    beforeEach(async () => {
        prisma = new PrismaClient();
        languageService = new LanguageService();

        // Clean up database
        await prisma.translation.deleteMany({});
        await prisma.language.deleteMany({});
        await prisma.foodItem.deleteMany({});
        await prisma.category.deleteMany({});

        // Reset mocks
        mockGenerateTranslations.mockClear();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('addLanguage', () => {
        it('should create a new language and trigger translations', async () => {
            const result = await languageService.addLanguage('fr', 'French');

            expect(result.code).toBe('fr');
            expect(result.name).toBe('French');
            expect(result.active).toBe(true);

            // Allow time for async translation generation
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockGenerateTranslations).toHaveBeenCalled();
        });

        it('should reject duplicate language codes', async () => {
            await languageService.addLanguage('fr', 'French');
            await expect(
                languageService.addLanguage('fr', 'French Again')
            ).rejects.toThrow('Language code \'fr\' already exists');
        });

        it('should handle empty language code', async () => {
            await expect(
                languageService.addLanguage('')
            ).rejects.toThrow('Language code is required');
        });
    });

    describe('update', () => {
        it('should trigger translations when language is activated', async () => {
            // Create inactive language
            const language = await prisma.language.create({
                data: { code: 'de', name: 'German', active: false }
            });

            // Create some test data
            await prisma.category.create({
                data: { name: 'Test Category' }
            });

            // Activate language
            const result = await languageService.update(language.id, { active: true });

            expect(result.active).toBe(true);
            // Allow time for async translation generation
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockGenerateTranslations).toHaveBeenCalled();
        });

        it('should not trigger translations when language is deactivated', async () => {
            // Create active language
            const language = await prisma.language.create({
                data: { code: 'de', name: 'German', active: true }
            });

            // Deactivate language
            const result = await languageService.update(language.id, { active: false });

            expect(result.active).toBe(false);
            expect(mockGenerateTranslations).not.toHaveBeenCalled();
        });

        it('should handle non-existent language', async () => {
            await expect(
                languageService.update(999, { active: true })
            ).rejects.toThrow('Language with ID 999 not found');
        });
    });

    describe('findAll and findActive', () => {
        beforeEach(async () => {
            // Create test languages
            await prisma.language.createMany({
                data: [
                    { code: 'en', name: 'English', active: true },
                    { code: 'es', name: 'Spanish', active: true },
                    { code: 'fr', name: 'French', active: false }
                ]
            });
        });

        it('should return all languages', async () => {
            const languages = await languageService.findAll();
            expect(languages).toHaveLength(3);
        });

        it('should return only active languages', async () => {
            const languages = await languageService.findActive();
            expect(languages).toHaveLength(2);
            languages.forEach(lang => {
                expect(lang.active).toBe(true);
            });
        });
    });

    describe('regenerateAllTranslations', () => {
        it('should regenerate translations for active language', async () => {
            // Create active language
            await prisma.language.create({
                data: { code: 'it', name: 'Italian', active: true }
            });

            // Create test data
            await prisma.category.create({
                data: { name: 'Test Category' }
            });

            await languageService.regenerateAllTranslations('it');
            expect(mockGenerateTranslations).toHaveBeenCalled();
        });

        it('should not regenerate translations for inactive language', async () => {
            // Create inactive language
            await prisma.language.create({
                data: { code: 'it', name: 'Italian', active: false }
            });

            await expect(
                languageService.regenerateAllTranslations('it')
            ).rejects.toThrow('Cannot regenerate translations for inactive language');
        });

        it('should handle non-existent language', async () => {
            await expect(
                languageService.regenerateAllTranslations('xx')
            ).rejects.toThrow('Language \'xx\' not found');
        });
    });
});