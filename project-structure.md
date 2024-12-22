# Project Structure

```
.
├── packages/
│   ├── backend/                    # Main backend application directory
│   │   ├── prisma/                # Database configuration and migrations
│   │   │   ├── migrations/        # Database migration history
│   │   │   └── schema.prisma      # Prisma schema defining data models
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
│   │   │   │   └── languageConfig.ts    # Language initialization
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
│   │   │   │   ├── LanguageService.ts   # Language initialization
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
│   │   ├── .env.example          # Environment template
│   │   ├── jest.config.js        # Test configuration
│   │   ├── package.json          # Backend dependencies
│   │   └── tsconfig.json         # TypeScript configuration
│   │
│   └── frontend/                  # React frontend (planned)
│       └── package.json          # Frontend dependencies
│
├── CHANGELOG.md                   # Project history
├── LICENSE                       # MIT license
├── README.md                     # Project documentation
└── package.json                  # Root package file
```

## Key Components

### Backend Structure

- `prisma/`: Database setup
  - Zero-configuration migrations
  - Automated model generation
  - Data relationships

- `public/`: Test interface
  - Modular JavaScript
  - Component styling
  - Real-time updates

- `src/`: Application core
  - TypeScript services
  - API endpoints
  - Business logic

### Frontend Structure

- React implementation planned
- Component architecture
- TypeScript integration

## Core Files

### Configuration

- `schema.prisma`: Database models
- `languageConfig.ts`: Language setup
- `tsconfig.json`: TypeScript setup
- `jest.config.js`: Test configuration

### Services

- `CategoryService.ts`: Category management
- `FoodItemService.ts`: Inventory control
- `LanguageService.ts`: Language initialization
- `TranslationService.ts`: AI translations

### API Routes

- `categoryRoutes.ts`: Category API
- `foodItemRoutes.ts`: Inventory API
- `languageRoutes.ts`: Language management
- `settingsRoutes.ts`: Global settings

### Utilities

- `ApiError.ts`: Error classes
- `ApiResponse.ts`: Response format
- `errorHandler.ts`: Error management

### Components

- `categories.js`: Category interface
- `foodItems.js`: Inventory interface
- `translations.js`: Language interface
- `settings.js`: System settings