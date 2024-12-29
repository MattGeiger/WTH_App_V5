# Project Structure

.
├── CHANGELOG.md
├── Initial_prompt_v02.txt
├── LICENSE
├── README.md
├── codebase.md
├── packages
│   ├── backend
│   │   ├── jest-setup.js
│   │   ├── jest.config.js
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   │   ├── 20241130003245_init
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20241207052011_add_language_model_and_make_language_id_optional
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20241209004222_add_settings_model
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20241220064500_add_limit_type
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20241221195000_add_category_limit
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20241222002000_add_unique_name_constraints
│   │   │   │   │   └── migration.sql
│   │   │   │   ├── 20241225021031_add_original_text_to_translations
│   │   │   │   │   └── migration.sql
│   │   │   │   └── migration_lock.toml
│   │   │   └── schema.prisma
│   │   ├── project-tree.txt
│   │   ├── public
│   │   │   ├── css
│   │   │   │   ├── components
│   │   │   │   │   ├── forms.css
│   │   │   │   │   ├── languages.css
│   │   │   │   │   ├── messages.css
│   │   │   │   │   └── tables.css
│   │   │   │   ├── layout
│   │   │   │   │   └── sections.css
│   │   │   │   └── styles.css
│   │   │   ├── index.html
│   │   │   ├── js
│   │   │   │   ├── categories.js
│   │   │   │   ├── foodItems
│   │   │   │   │   ├── FoodItemManager.js
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── FoodItemManager.test.js
│   │   │   │   │   │   ├── README.md
│   │   │   │   │   │   ├── babel.config.js
│   │   │   │   │   │   ├── coverage
│   │   │   │   │   │   │   ├── clover.xml
│   │   │   │   │   │   │   ├── lcov-report
│   │   │   │   │   │   │   │   ├── base.css
│   │   │   │   │   │   │   │   ├── block-navigation.js
│   │   │   │   │   │   │   │   ├── favicon.png
│   │   │   │   │   │   │   │   ├── index.html
│   │   │   │   │   │   │   │   ├── prettify.css
│   │   │   │   │   │   │   │   ├── prettify.js
│   │   │   │   │   │   │   │   ├── sort-arrow-sprite.png
│   │   │   │   │   │   │   │   └── sorter.js
│   │   │   │   │   │   │   └── lcov.info
│   │   │   │   │   │   ├── coverage-template.md
│   │   │   │   │   │   ├── handlers
│   │   │   │   │   │   │   ├── formData.test.js
│   │   │   │   │   │   │   ├── submit.test.js
│   │   │   │   │   │   │   └── validation.test.js
│   │   │   │   │   │   ├── jest.config.js
│   │   │   │   │   │   ├── setup.js
│   │   │   │   │   │   ├── ui
│   │   │   │   │   │   │   ├── forms.test.js
│   │   │   │   │   │   │   ├── stats.test.js
│   │   │   │   │   │   │   └── table.test.js
│   │   │   │   │   │   └── utils
│   │   │   │   │   │       ├── assertions.js
│   │   │   │   │   │       ├── generateCoverage.js
│   │   │   │   │   │       ├── testFactories.js
│   │   │   │   │   │       └── testHelpers.js
│   │   │   │   │   ├── handlers
│   │   │   │   │   │   ├── formData.js
│   │   │   │   │   │   ├── submit.js
│   │   │   │   │   │   └── validation.js
│   │   │   │   │   ├── index.js
│   │   │   │   │   ├── ui
│   │   │   │   │   │   ├── forms.js
│   │   │   │   │   │   ├── stats.js
│   │   │   │   │   │   └── table.js
│   │   │   │   │   └── utils
│   │   │   │   │       └── errorHandler.js
│   │   │   │   ├── foodItems.js
│   │   │   │   ├── languages.js
│   │   │   │   ├── main.js
│   │   │   │   ├── settings.js
│   │   │   │   ├── translations.js
│   │   │   │   ├── utils
│   │   │   │   │   └── sortableTable.js
│   │   │   │   └── utils.js
│   │   │   ├── sample-claude.html
│   │   │   ├── sample-layout-part1.html
│   │   │   ├── sample-layout.html
│   │   │   ├── sample-layoutv2.html
│   │   │   └── sample.html
│   │   └── src
│   │       ├── config
│   │       │   └── languageConfig.ts
│   │       ├── index.ts
│   │       ├── middleware
│   │       │   ├── errorHandler.ts
│   │       │   └── requestLogger.ts
│   │       ├── routes
│   │       │   ├── categoryRoutes.ts
│   │       │   ├── foodItemRoutes.ts
│   │       │   ├── languageRoutes.ts
│   │       │   ├── settingsRoutes.ts
│   │       │   └── translationRoutes.ts
│   │       ├── services
│   │       │   ├── CategoryService.ts
│   │       │   ├── FoodItemService.ts
│   │       │   ├── LanguageService.ts
│   │       │   ├── TranslationService.ts
│   │       │   └── openai
│   │       │       ├── OpenAIService.ts
│   │       │       └── __tests__
│   │       │           └── OpenAIService.test.ts
│   │       ├── tests
│   │       │   ├── CategoryService.test.ts
│   │       │   ├── FoodItemService.test.ts
│   │       │   ├── TranslationService.test.ts
│   │       │   ├── categoryRoutes.test.ts
│   │       │   ├── foodItemRoutes.test.ts
│   │       │   ├── languageRoutes.test.ts
│   │       │   ├── limitType.test.ts
│   │       │   ├── settings.test.ts
│   │       │   ├── settingsRoutes.test.ts
│   │       │   ├── setup.ts
│   │       │   ├── translationRoutes.test.ts
│   │       │   └── utils
│   │       │       ├── dbHelpers.ts
│   │       │       ├── testFactories.ts
│   │       │       └── testHelpers.ts
│   │       └── utils
│   │           ├── ApiError.ts
│   │           ├── ApiResponse.ts
│   │           ├── errorConstants.ts
│   │           ├── errorHandler.ts
│   │           └── validationUtils.ts
│   ├── data
│   │   └── food-pantry.db
│   └── repomix-output.xml
├── project-overview.md
├── project-structure.md
├── project-tree.txt
└── repomix-output.xml

## Key Components

### Database Layer
- **Prisma** with SQLite  
- `schema.prisma` defining models (Category, FoodItem, etc.)
- Migration scripts in `migrations/`  

### API Layer
- **Express.js** routes under `src/routes`  
- RESTful endpoints for Categories, Food Items, Translations, etc.  
- Global error handling in `middleware/errorHandler.ts`  
- Logging via `requestLogger.ts`  

### Service Layer
- **Business logic** under `src/services/`  
- Separate classes for Category, FoodItem, Language, Translation  
- **OpenAI** integration in `OpenAIService.ts`  

### Test Interface
- **Public** folder providing UI components  
- Form logic for categories and food items in `js/foodItems/`  
- Sorting and utility scripts in `js/utils/`  
- Testing coverage reports in `foodItems/__tests__/coverage`  

### Utilities
- **Common helpers** in `src/utils`  
  - `ApiError`, `ApiResponse`, `validationUtils`  
- Shared test factories and DB helpers in `src/tests/utils/`  

### Security Features
- **Input validation** (length, duplicates, title case, repeated words)  
- **Error handling** with standardized responses  
- **CORS** enabled for API usage  
- Planned rate-limiting support