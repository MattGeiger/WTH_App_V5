import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { ApiResponse } from './utils/ApiResponse';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json(ApiResponse.success({
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }));
});

// Error handling middleware (must be after all other middleware and routes)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});