import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/ApiResponse';
import categoryRoutes from './routes/categoryRoutes';
import foodItemRoutes from './routes/foodItemRoutes';
import translationRoutes from './routes/translationRoutes';

// Load environment variables
dotenv.config();

// Create and configure express app
export const createApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // Routes
  app.use('/api/categories', categoryRoutes);
  app.use('/api/food-items', foodItemRoutes);
  app.use('/api/translations', translationRoutes);

  // Basic health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json(ApiResponse.success({
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  });

  // Error handling middleware (must be after all other middleware and routes)
  app.use(errorHandler);

  return app;
};

// Only start the server if this file is run directly
if (require.main === module) {
  const app = createApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}