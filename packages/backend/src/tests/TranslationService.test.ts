import { PrismaClient } from '@prisma/client';
import { TranslationService } from '../services/TranslationService';
import { CategoryService } from '../services/CategoryService';
import { FoodItemService } from '../services/FoodItemService';
import { ApiError } from '../utils/ApiError';

describe('TranslationService', () => {
    let translationService: TranslationService;
    let categoryService: CategoryService;
    let foodItemService: FoodItemService;
    let prisma: PrismaClient;
    let testCategoryId: number;
    let testFoodItemId: number;
    let testLanguageId: number;

    beforeAll(async () => {
        translationService = new TranslationService();
        categoryService = new CategoryService();
        foodItemService = new FoodItemService();
        prisma = new PrismaClient();

        // Clean up all tables to avoid uniqueness errors
        await prisma.translation.deleteMany({});
        await prisma.customField.deleteMany({});
        await prisma.foodItem.deleteMany({});
        await prisma.category.deleteMany({});
        await prisma.language.deleteMany({});

        // Create test language
        const language = await prisma.language.create({
            data: { code: 'es', name: 'Spanish', active: true }
        });
        testLanguageId = language.id;

        // Create test category and food item
        const category = await categoryService.create({ name: 'Test Category' });
        testCategoryId = category.id;

        const foodItem = await foodItemService.create({
            name: 'Test Food Item',
            categoryId: testCategoryId
        });
        testFoodItemId = foodItem.id;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clean up translations before each test
        await prisma.translation.deleteMany({});
    });

    describe('createForCategory', () => {
        it('should create a translation for a category', async () => {
            const translationData = {
                languageCode: 'es',
                translatedText: 'Categoría de Prueba'
            };

            const result = await translationService.createForCategory(
                testCategoryId,
                translationData
            );

            expect(result).toBeDefined();
            expect(result.language!.code).toBe('es');
            expect(result.translatedText).toBe('Categoría de Prueba');
            expect(result.categoryId).toBe(testCategoryId);
        });

        it('should reject invalid language code', async () => {
            const translationData = {
                languageCode: 'xx',
                translatedText: 'Invalid Language'
            };

            await expect(
                translationService.createForCategory(testCategoryId, translationData)
            ).rejects.toThrow(ApiError);
        });
    });

    describe('createForFoodItem', () => {
        it('should create a translation for a food item', async () => {
            const translationData = {
                languageCode: 'es',
                translatedText: 'Comida de Prueba'
            };

            const result = await translationService.createForFoodItem(
                testFoodItemId,
                translationData
            );

            expect(result).toBeDefined();
            expect(result.language!.code).toBe('es');
            expect(result.translatedText).toBe('Comida de Prueba');
            expect(result.foodItemId).toBe(testFoodItemId);
        });

        it('should reject translation for non-existent food item', async () => {
            const translationData = {
                languageCode: 'es',
                translatedText: 'Test Translation'
            };

            await expect(
                translationService.createForFoodItem(-1, translationData)
            ).rejects.toThrow(ApiError);
        });
    });

    describe('findByLanguage', () => {
        it('should find translations by language code for category', async () => {
            await prisma.translation.create({
                data: {
                    translatedText: 'Test Translation',
                    categoryId: testCategoryId,
                    languageId: testLanguageId
                },
                include: { language: true }
            });

            const translations = await translationService.findByLanguage('es', {
                categoryId: testCategoryId
            });

            expect(Array.isArray(translations)).toBe(true);
            translations.forEach(translation => {
                expect(translation.language!.code).toBe('es');
                expect(translation.categoryId).toBe(testCategoryId);
            });
        });

        it('should find translations by language code for food item', async () => {
            await prisma.translation.create({
                data: {
                    translatedText: 'Test Translation',
                    foodItemId: testFoodItemId,
                    languageId: testLanguageId
                },
                include: { language: true }
            });

            const translations = await translationService.findByLanguage('es', {
                foodItemId: testFoodItemId
            });

            expect(Array.isArray(translations)).toBe(true);
            translations.forEach(translation => {
                expect(translation.language!.code).toBe('es');
                expect(translation.foodItemId).toBe(testFoodItemId);
            });
        });
    });

    describe('update', () => {
        let testTranslationId: number;

        beforeEach(async () => {
            const translation = await prisma.translation.create({
                data: {
                    translatedText: 'Original Text',
                    categoryId: testCategoryId,
                    languageId: testLanguageId
                },
                include: { language: true }
            });
            testTranslationId = translation.id;
        });

        it('should update a translation', async () => {
            const updated = await translationService.update(testTranslationId, {
                translatedText: 'Updated Text'
            });

            expect(updated.id).toBe(testTranslationId);
            expect(updated.translatedText).toBe('Updated Text');
        });
    });

    describe('delete', () => {
        it('should delete a translation', async () => {
            const translation = await prisma.translation.create({
                data: {
                    translatedText: 'To Delete',
                    categoryId: testCategoryId,
                    languageId: testLanguageId
                },
                include: { language: true }
            });

            await expect(translationService.delete(translation.id))
                .resolves
                .not
                .toThrow();

            await expect(translationService.findById(translation.id))
                .rejects
                .toThrow(ApiError);
        });
    });
});