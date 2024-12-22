# Project Structure

```
.
├── packages/
│   ├── backend/                    # Main backend application directory
│   │   ├── prisma/                # Database configuration and migrations
│   │   │   ├── migrations/        # Database version control
│   │   │   │   ├── 20241130003245_init/                    # Initial schema
│   │   │   │   ├── 20241207052011_add_language_model.../   # Language support
│   │   │   │   ├── 20241209004222_add_settings_model/      # Settings features
│   │   │   │   ├── 20241220064500_add_limit_type/          # Item limits
│   │   │   │   ├── 20241221195000_add_category_limit/      # Category limits
│   │   │   │   └── 20241222002000_add_unique_name.../      # Name constraints
│   │   │   └── schema.prisma      # Database schema definition
│   │   │
│   │   ├── public/                # Frontend test interface
│   │   │   ├── css/              # Stylesheet organization
│   │   │   │   ├── components/    # Component-specific styles
│   │   │   │   └── layout/        # Structural styles
│   │   │   ├── js/               # Frontend JavaScript modules
│   │   │   │   ├── categories.js      # Category management
│   │   │   │   ├── foodItems.js       # Food item operations
│   │   │   │   ├── languages.js       # Language handling
│   │   │   │   ├── main.js            # Application entry point
│   │   │   │   ├── settings.js        # Settings management
│   │   │   │   ├── translations.js    # Translation logic
│   │   │   │   └── utils.js           # Shared utilities
│   │   │   └── index.html        # Main test UI page
│   │   │
│   │   ├── src/                   # Backend source code
│   │   │   ├── config/           # Application configuration
│   │   │   │   └── languageConfig.ts    # Language settings
│   │   │   │
│   │   │   ├── middleware/       # Express middleware
│   │   │   │   ├── errorHandler.ts      # Error processing
│   │   │   │   └── requestLogger.ts     # Request logging
│   │   │   │
│   │   │   ├── routes/           # API endpoints
│   │   │   │   ├── categoryRoutes.ts    # Category API
│   │   │   │   ├── foodItemRoutes.ts    # Food item API
│   │   │   │   ├── languageRoutes.ts    # Language API
│   │   │   │   ├── settingsRoutes.ts    # Settings API
│   │   │   │   └── translationRoutes.ts # Translation API
│   │   │   │
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── openai/           # AI translation
│   │   │   │   ├── CategoryService.ts   # Category logic
│   │   │   │   ├── FoodItemService.ts   # Food item logic
│   │   │   │   ├── LanguageService.ts   # Language logic
│   │   │   │   └── TranslationService.ts # Translation logic
│   │   │   │
│   │   │   ├── tests/            # Test suites
│   │   │   │   ├── utils/            # Test helpers
│   │   │   │   └── setup.ts          # Test configuration
│   │   │   │
│   │   │   └── utils/            # Shared utilities
│   │   │       ├── ApiError.ts         # Error handling
│   │   │       ├── ApiResponse.ts      # Response formatting
│   │   │       └── validationUtils.ts  # Input validation
│   │   │
│   │   ├── .env.example          # Environment variables template
│   │   ├── jest.config.js        # Test configuration
│   │   ├── package.json          # Backend dependencies
│   │   └── tsconfig.json         # TypeScript configuration
│   │
│   └── frontend/                  # React frontend (planned)
│       └── package.json          # Frontend dependencies
│
├── CHANGELOG.md                   # Version history
├── LICENSE                       # MIT license
├── README.md                     # Project documentation
└── package.json                  # Root package configuration
```

## Key Components

### Database Layer (`prisma/`)
- Schema definition and migrations
- Automated model generation
- Data relationships and constraints

### Test Interface (`public/`)
- JavaScript modules for CRUD operations
- Component-specific styling
- Real-time UI updates

### Backend Core (`src/`)
- TypeScript services for business logic
- RESTful API endpoints
- Error handling and validation
- AI-powered translations
- Comprehensive test coverage

### Frontend (Planned)
- React-based UI
- TypeScript integration
- Component architecture

## Configuration Files
- Environment setup (.env.example)
- Package dependencies (package.json)
- TypeScript configuration (tsconfig.json)
- Test setup (jest.config.js)

## Documentation
- Project overview (README.md)
- Version tracking (CHANGELOG.md)
- Licensing (LICENSE)

## Development Setup
- Monorepo structure with workspaces
- Separate backend and frontend packages
- Shared configuration and utilities