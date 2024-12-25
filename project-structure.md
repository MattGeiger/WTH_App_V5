# Project Structure

📂 packages/
├── 📂 backend/
│   ├── 📂 prisma/                      # Database configuration & migrations
│   │   ├── 📂 migrations/              # SQL migration files for database schema changes
│   │   │   ├── 📂 20241130003245_init/
│   │   │   │   └── migration.sql       # Initial schema setup
│   │   │   ├── 📂 20241207052011_add_language_model_and_make_language_id_optional/
│   │   │   │   └── migration.sql       # Add language model
│   │   │   ├── 📂 20241209004222_add_settings_model/
│   │   │   │   └── migration.sql       # Add settings model
│   │   │   ├── 📂 20241220064500_add_limit_type/
│   │   │   │   └── migration.sql       # Add limitType column
│   │   │   ├── 📂 20241221195000_add_category_limit/
│   │   │   │   └── migration.sql       # Add category limit column
│   │   │   ├── 📂 20241222002000_add_unique_name_constraints/
│   │   │   │   └── migration.sql       # Add unique constraints to names
│   │   │   ├── 📂 20241225021031_add_original_text_to_translations/
│   │   │   │   └── migration.sql       # Add originalText column for custom translations
│   │   │   └── migration_lock.toml     # Migration lock file
│   │   └── schema.prisma               # Prisma schema defining database models
│   ├── 📂 public/                      # Frontend static assets
│   │   ├── 📂 css/
│   │   │   ├── 📂 components/          # Component-specific styles
│   │   │   │   ├── forms.css           # Form styling
│   │   │   │   ├── languages.css       # Language table styles
│   │   │   │   ├── messages.css        # System messages styles
│   │   │   │   └── tables.css          # Table styles
│   │   │   ├── 📂 layout/              # Layout-specific styles
│   │   │   │   └── sections.css        # Section layout styles
│   │   │   └── styles.css              # General styles
│   │   ├── index.html                  # Main HTML page
│   │   └── 📂 js/
│   │       ├── categories.js           # Category management JavaScript
│   │       ├── foodItems.js            # Food item management JavaScript
│   │       ├── languages.js            # Language management JavaScript
│   │       ├── main.js                 # Main JavaScript entry point
│   │       ├── settings.js             # Settings management JavaScript
│   │       ├── translations.js         # Translation management JavaScript
│   │       ├── 📂 utils/               # Shared utility functions
│   │       │   └── sortableTable.js    # Sorting functionality for tables
│   │       └── utils.js                # General utility functions
│   ├── 📂 src/                         # Backend source code
│   │   ├── 📂 config/                  # Configuration files
│   │   │   └── languageConfig.ts       # Language configuration
│   │   ├── index.ts                    # Application entry point
│   │   ├── 📂 middleware/              # Express middleware
│   │   │   ├── errorHandler.ts         # Global error handler
│   │   │   └── requestLogger.ts        # Request logging middleware
│   │   ├── 📂 routes/                  # API route handlers
│   │   │   ├── categoryRoutes.ts       # Routes for category management
│   │   │   ├── foodItemRoutes.ts       # Routes for food item management
│   │   │   ├── languageRoutes.ts       # Routes for language management
│   │   │   ├── settingsRoutes.ts       # Routes for settings management
│   │   │   └── translationRoutes.ts    # Routes for translation management
│   │   ├── 📂 services/                # Business logic services
│   │   │   ├── CategoryService.ts      # Category management logic
│   │   │   ├── FoodItemService.ts      # Food item management logic
│   │   │   ├── LanguageService.ts      # Language management logic
│   │   │   ├── TranslationService.ts   # Translation management logic
│   │   │   └── 📂 openai/              # OpenAI integration
│   │   │       ├── OpenAIService.ts    # OpenAI service for translations
│   │   │       └── 📂 tests/       # Tests for OpenAI service
│   │   │           └── OpenAIService.test.ts
│   │   ├── 📂 tests/                   # Backend tests
│   │   │   ├── CategoryService.test.ts # Tests for CategoryService
│   │   │   ├── FoodItemService.test.ts # Tests for FoodItemService
│   │   │   ├── TranslationService.test.ts # Tests for TranslationService
│   │   │   ├── categoryRoutes.test.ts  # Tests for category routes
│   │   │   ├── foodItemRoutes.test.ts  # Tests for food item routes
│   │   │   ├── languageRoutes.test.ts  # Tests for language routes
│   │   │   ├── limitType.test.ts       # Tests for limitType feature
│   │   │   ├── settings.test.ts        # Tests for settings management
│   │   │   ├── settingsRoutes.test.ts  # Tests for settings routes
│   │   │   ├── setup.ts                # Test setup
│   │   │   ├── translationRoutes.test.ts # Tests for translation routes
│   │   │   └── 📂 utils/               # Test utilities
│   │   │       ├── dbHelpers.ts        # Helpers for database testing
│   │   │       ├── testFactories.ts    # Test data factories
│   │   │       └── testHelpers.ts      # General test helpers
│   │   └── 📂 utils/                   # Shared utility functions
│   │       ├── ApiError.ts             # API error handling
│   │       ├── ApiResponse.ts          # Standardized API responses
│   │       ├── errorConstants.ts       # Common error constants
│   │       ├── errorHandler.ts         # Error handler utility
│   │       └── validationUtils.ts      # Input validation utilities
│   ├── jest-setup.js                   # Jest test setup file
│   ├── jest.config.js                  # Jest configuration
│   ├── package.json                    # Backend dependencies
│   └── tsconfig.json                   # TypeScript configuration
├── 📂 frontend/                        # React frontend (in development)
│   └── package.json                    # Frontend dependencies
├── CHANGELOG.md                         # Project changelog
├── LICENSE                              # MIT license
├── README.md                            # Project readme
├── codebase.md                          # Codebase documentation
├── project-overview.md                  # Project overview
├── project-structure.md                 # Project structure (this file)
├── project-tree.txt                     # Raw project tree
└── repomix.config.json                  # Repomix configuration
```

## Key Components

### Database Layer (`prisma/`)
- SQLite database with Prisma ORM
- Automated migrations and type generation
- Models: Categories, FoodItems, Translations, Languages, Settings
- Case-insensitive search and unique constraints

### API Layer (`src/routes/`)
- REST endpoints for CRUD operations 
- Input validation and error handling
- Standardized response format
- Real-time data synchronization

### Service Layer (`src/services/`)
- Business logic separation
- OpenAI translation integration
- Data validation and normalization
- Race condition prevention

### Test Interface (`public/`)
- Modular JavaScript architecture 
- Real-time UI updates
- Input constraints and validation
- Responsive styling

### Testing Framework (`src/tests/`)
- Unit tests for services
- Integration tests for routes
- End-to-end testing
- Test utilities and factories

### Utilities (`src/utils/`)
- Error handling and custom errors
- API response standardization
- Input validation 
- Type guards and interfaces

### Security Features
- Input sanitization and validation
- Error detail control
- CORS configuration
- Request logging