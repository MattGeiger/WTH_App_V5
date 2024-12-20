import { cleanDatabase, disconnectDatabase } from './utils/dbHelpers';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Before all tests
beforeAll(async () => {
  await cleanDatabase();
});

// After all tests
afterAll(async () => {
  await disconnectDatabase();
});