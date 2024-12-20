import { PrismaClient } from '@prisma/client';
import { FoodItemService } from '../services/FoodItemService';

describe('FoodItem LimitType Tests', () => {
    let prisma: PrismaClient;
    let foodItemService: FoodItemService;
    let testCategoryId: number;

    beforeAll(async () => {
        prisma = new PrismaClient();
        foodItemService = new FoodItemService(true); // Enable test mode
        // Clear any existing data
        await prisma.translation.deleteMany();
        await prisma.foodItem.deleteMany();
        await prisma.category.deleteMany();
        
        const category = await prisma.category.create({
            data: { name: 'Test Category' }
        });
        testCategoryId = category.id;
    });

    afterEach(async () => {
        await prisma.translation.deleteMany();
        await prisma.foodItem.deleteMany();
    });

    afterAll(async () => {
        await prisma.$transaction([
            prisma.translation.deleteMany(),
            prisma.foodItem.deleteMany(),
            prisma.category.deleteMany()
        ]);
        await prisma.$disconnect();
    });

    it('creates food item with perPerson limitType', async () => {
        const foodItem = await foodItemService.create({
            name: 'Test Item',
            categoryId: testCategoryId,
            itemLimit: 2,
            limitType: 'perPerson'
        });

        expect(foodItem.limitType).toBe('perPerson');
    });

    it('defaults to perHousehold when limitType not specified', async () => {
        const foodItem = await foodItemService.create({
            name: 'Test Item 2',
            categoryId: testCategoryId
        });
        
        expect(foodItem.limitType).toBe('perHousehold');
    });

    it('updates limitType successfully', async () => {
        const foodItem = await foodItemService.create({
            name: 'Test Item 3',
            categoryId: testCategoryId,
            limitType: 'perHousehold'
        });
        
        const updated = await foodItemService.update(foodItem.id, {
            limitType: 'perPerson'
        });
        
        expect(updated.limitType).toBe('perPerson');
    });
});