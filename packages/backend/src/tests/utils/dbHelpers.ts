import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cleanDatabase = async () => {
  await prisma.translation.deleteMany({});
  await prisma.customField.deleteMany({});
  await prisma.foodItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.language.deleteMany({});
  await prisma.settings.deleteMany({});
};

export const disconnectDatabase = async () => {
  await cleanDatabase();
  await prisma.$disconnect();
};

export { prisma };