# Project Structure

```
.
├── packages/
│   ├── backend/                    # Main backend application directory
│   │   ├── prisma/                # Database configuration and migrations
│   │   │   ├── migrations/        # Database migration history
│   │   │   └── schema.prisma      # Prisma schema defining data models and relationships
│   │   │
│   │   ├── public/                # Static assets and test UI
│   │   │   ├── css/              # Stylesheets for test UI
│   │   │   │   ├── components/    # Component-specific styles
│   │   │   │   └── layout/        # Layout and structural styles
│   │   │   ├── js/               # Frontend JavaScript modules
│   │   │   └── index.html        # Test UI entry point
│   │   │
│   │   ├── src/                   # Backend source code
│   │   │   ├── config/           # Application configuration
│   │   │   │   └── languageConfig.ts    # Language support configuration
│   │   │   │
│   │   │   ├── middleware/       # Express middleware
│   │   │   │   ├── errorHandler.ts      # Global error handling
│   │   │   │   └── requestLogger.ts     # Request logging
│   │   │   │
│   │   │   ├── routes/           # API route handlers
│   │   │   │   ├── categoryRoutes.ts    # Category endpoints
│   │   │   │   ├── foodItemRoutes.ts    # Food item endpoints
│   │   │   │   ├── languageRoutes.ts    # Language management
│   │   │   │   ├── settingsRoutes.ts    # Global settings
│   │   │   │   └── translationRoutes.ts # Translation endpoints
│   │   │   │
│   │   │   ├── services/         # Business logic layer
│   │   │   │   ├── openai/       # OpenAI integration
│   │   │   │   ├── CategoryService.ts   # Category operations
│   │   │   │   ├── FoodItemService.ts   # Food item operations
│   │   │   │   ├── LanguageService.ts   # Language management
│   │   │   │   └── TranslationService.ts # Translation operations
│   │   │   │
│   │   │   ├── tests/            # Test suites
│   │   │   │   ├── utils/        # Test utilities
│   │   │   │   └── setup.ts      # Test environment setup
│   │   │   │
│   │   │   └── utils/            # Utility functions
│   │   │       ├── ApiError.ts         # Error handling
│   │   │       ├── ApiResponse.ts      # Response formatting
│   │   │       └── errorHandler.ts     # Error processing
│   │   │
│   │   ├── .env.example          # Environment variables template
│   │   ├── jest.config.js        # Jest testing configuration
│   │   ├── package.json          # Backend dependencies
│   │   └── tsconfig.json         # TypeScript configuration
│   │
│   └── frontend/                  # React frontend (planned)
│       └── package.json          # Frontend dependencies
│
├── CHANGELOG.md                   # Project history and changes
├── LICENSE                       # MIT license
├── README.md                     # Project documentation
└── package.json                  # Root package file for workspaces
```

## Key Directories

### Backend Structure

- `prisma/`: Database layer with Prisma ORM setup and migrations
- `public/`: Test UI implementation with modular JavaScript
- `src/`: Core backend application code with TypeScript
- `tests/`: Comprehensive test suites for all components

### Frontend Structure

- Currently placeholder for planned React implementation
- Will follow similar modular organization to backend

## File Purposes

### Configuration Files

- `schema.prisma`: Defines database models for categories, food items, translations
- `languageConfig.ts`: Supported languages and language-specific settings
- `tsconfig.json`: TypeScript compiler configuration
- `jest.config.js`: Test runner setup

### Core Services

- `CategoryService.ts`: Category CRUD operations
- `FoodItemService.ts`: Food item management with dietary flags
- `TranslationService.ts`: Multi-language support
- `OpenAIService.ts`: AI-powered translation integration

### API Routes

- `categoryRoutes.ts`: Category endpoints
- `foodItemRoutes.ts`: Food item endpoints
- `translationRoutes.ts`: Translation management
- `settingsRoutes.ts`: Global settings configuration

### Utilities

- `ApiError.ts`: Custom error classes
- `ApiResponse.ts`: Standardized response formatting
- `errorHandler.ts`: Global error processing

### Test UI Components

- `categories.js`: Category management interface
- `foodItems.js`: Food item management
- `translations.js`: Translation interface
- `settings.js`: Global settings management