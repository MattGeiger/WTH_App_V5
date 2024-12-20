import { prisma } from './dbHelpers';

export const createTestCategory = async (name = 'Test Category') => {
  return prisma.category.create({
    data: { name }
  });
};

export const createTestFoodItem = async (categoryId: number, data = {}) => {
  return prisma.foodItem.create({
    data: {
      name: 'Test Food Item',
      categoryId,
      inStock: true,
      itemLimit: 0,
      limitType: 'perHousehold',
      ...data
    }
  });
};

export const createTestLanguage = async (data = {}) => {
  return prisma.language.create({
    data: {
      code: 'en',
      name: 'English',
      active: true,
      ...data
    }
  });
};

export const createTestTranslation = async (data: {
  categoryId?: number;
  foodItemId?: number;
  languageId: number;
}) => {
  return prisma.translation.create({
    data: {
      translatedText: 'Test Translation',
      ...data
    }
  });
};