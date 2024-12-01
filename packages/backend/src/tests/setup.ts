import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Create a new Prisma client instance for tests
const prisma = new PrismaClient();

// Before all tests
beforeAll(async () => {
  // Clean up database before tests
  await prisma.translation.deleteMany({});
  await prisma.category.deleteMany({});
});

// After all tests
afterAll(async () => {
  // Clean up and disconnect
  await prisma.translation.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.$disconnect();
});