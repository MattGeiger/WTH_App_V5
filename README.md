# SQL-React-App

A web application providing food pantry inventory management through a React-based UI with a SQL database backend. The system includes automated translations through OpenAI integration to support multiple languages.

## Project Structure

```
.
├── CHANGELOG.md
├── LICENSE
├── README.md
├── package-lock.json
├── package.json
├── packages
│   ├── backend
│   │   ├── jest.config.js
│   │   ├── package.json
│   │   ├── prisma
│   │   │   ├── migrations
│   │   │   │   ├── 20241130003245_init
│   │   │   │   ├── 20241207052011_add_language_model_and_make_language_id_optional
│   │   │   │   ├── 20241209004222_add_settings_model
│   │   │   │   └── migration_lock.toml
│   │   │   └── schema.prisma
│   │   ├── public
│   │   │   ├── css
│   │   │   │   └── styles.css
│   │   │   ├── index.html
│   │   │   ├── js
│   │   │   │   ├── categories.js
│   │   │   │   ├── foodItems.js
│   │   │   │   ├── languages.js
│   │   │   │   ├── main.js
│   │   │   │   ├── settings.js
│   │   │   │   ├── translations.js
│   │   │   │   └── utils.js
│   │   ├── src
│   │   │   ├── config
│   │   │   │   └── languageConfig.ts
│   │   │   ├── index.ts
│   │   │   ├── middleware
│   │   │   │   ├── errorHandler.ts
│   │   │   │   └── requestLogger.ts
│   │   │   ├── routes
│   │   │   │   ├── categoryRoutes.ts
│   │   │   │   ├── foodItemRoutes.ts
│   │   │   │   ├── languageRoutes.ts
│   │   │   │   ├── settingsRoutes.ts
│   │   │   │   └── translationRoutes.ts
│   │   │   ├── services
│   │   │   │   ├── CategoryService.ts
│   │   │   │   ├── FoodItemService.ts
│   │   │   │   ├── LanguageService.ts
│   │   │   │   ├── TranslationService.ts
│   │   │   │   └── openai
│   │   │   │       ├── OpenAIService.ts
│   │   │   │       └── __tests__
│   │   │   ├── tests
│   │   │   │   ├── frontend
│   │   │   │   │   ├── categories.test.js
│   │   │   │   │   ├── foodItems.test.js
│   │   │   │   │   ├── languages.test.js
│   │   │   │   │   ├── settings.test.js
│   │   │   │   │   ├── setup.js
│   │   │   │   │   └── translations.test.js
│   │   │   │   ├── CategoryService.test.ts
│   │   │   │   ├── FoodItemService.test.ts
│   │   │   │   ├── TranslationService.test.ts
│   │   │   │   ├── categoryRoutes.test.ts
│   │   │   │   ├── foodItemRoutes.test.ts
│   │   │   │   ├── languageRoutes.test.ts
│   │   │   │   ├── limitType.test.ts
│   │   │   │   ├── settings.test.ts
│   │   │   │   ├── settingsRoutes.test.ts
│   │   │   │   └── setup.ts
│   │   │   └── utils
│   │   │       ├── ApiError.ts
│   │   │       └── ApiResponse.ts
│   │   └── tsconfig.json
│   ├── frontend
│   │   └── package.json
│   └── shared
│       └── package.json

## Project Overview

This application is designed to:
- Manage food pantry inventory items and categories
- Support multiple languages through automated translations
- Track dietary restrictions and food attributes
- Handle product images
- Offer a responsive, user-friendly interface

### Key Features

#### Implemented
- **Database Management**:
  - SQL backend using Prisma ORM
  - Category and food item CRUD operations
  - Language management system
  - Translation relationships
  - Dietary attribute tracking
  - Custom fields for flexibility
  - Comprehensive error handling

- **API Endpoints**:
  - Categories API with validation
  - Food Items API with pagination
  - Languages API for localization
  - Translations API with relationships
  - Standardized response formatting

- **Frontend JavaScript**:
  - Modular architecture
  - Event-based communication
  - Comprehensive test coverage
  - TypeScript integration
  - Standardized error handling
  - Unit and integration tests

## Technical Stack

### Backend (Implemented)
- SQLite database
- Prisma ORM
- Node.js/Express
- TypeScript
- Jest testing framework
- Standardized error handling
- Modular JavaScript architecture
- Test isolation features

### Testing
- Jest test suites for all major components
- Frontend JavaScript unit tests
- Backend service integration tests
- Test mode for avoiding side effects
- Comprehensive TypeScript type checking

### Frontend (Planned)
- React
- TypeScript
- Component architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite 3
- Git

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sql-react-app.git
   cd sql-react-app
   ```

2. Install root dependencies:
   ```bash
   npm install
   ```

3. Set up backend:
   ```bash
   cd packages/backend
   npm install
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. Initialize database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### Development

1. Start backend server:
   ```bash
   npm run dev
   ```

2. Run tests:
   ```bash
   npm test               # Run all tests
   npm run test:unit     # Run specific test suite
   npm run test:watch    # Run tests in watch mode
   npm run test:coverage # Generate coverage report
   ```

3. Access API:
   - API: http://localhost:3000
   - Test UI: http://localhost:3000/index.html

### Available Scripts

- `npm run dev` - Start development server
- `npm test` - Run test suite
- `npm run test:unit` - Run specific tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run migrate` - Run database migrations

## Development Status

✅ Repository Setup
✅ Development Environment
✅ Backend Implementation
✅ Test UI Development
✅ OpenAI Integration
✅ Language Management System
✅ Translation system testing
✅ Modular JavaScript Implementation
✅ Frontend Unit Testing Setup
⬜ React setup
⬜ React UI development
⬜ System integration
⬜ Documentation

## API Documentation

### Categories
```
GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Food Items
```
GET    /api/food-items
POST   /api/food-items
GET    /api/food-items/:id
PUT    /api/food-items/:id
DELETE /api/food-items/:id
```

### Languages
```
GET    /api/languages
POST   /api/languages
PUT    /api/languages/:id
DELETE /api/languages/:id
```

### Translations
```
GET    /api/translations/language/:languageCode
POST   /api/translations/category/:categoryId
POST   /api/translations/food-item/:foodItemId
PUT    /api/translations/:id
DELETE /api/translations/:id
```

### Settings
```
GET    /api/settings
POST   /api/settings
```

## Contributing

This project is in active development. Contribution guidelines will be established as the project matures.

## Testing

### Backend Tests
- Unit tests for all services
- Integration tests for routes
- End-to-end test coverage
- Test mode for isolation

### Frontend Tests
- Unit tests for JavaScript modules
- Integration tests for UI components
- Event handling coverage
- Mock service responses

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:unit

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.