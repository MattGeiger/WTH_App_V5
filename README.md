# SQL-React-App

A web application providing food pantry inventory management through a SQL database backend with automated translations via OpenAI integration.

## Project Overview

This application is designed to:
- Manage food pantry inventory items and categories
- Support multiple languages through automated translations
- Track dietary restrictions and food attributes
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
  - Settings API for system configuration
  - Standardized response formatting

## Technical Stack

### Backend (Implemented)
- SQLite database
- Prisma ORM
- Node.js/Express
- TypeScript
- Jest testing framework
- Standardized error handling

### Frontend (In Development)
- Test UI for backend validation
- Modular JavaScript architecture
- Comprehensive test coverage

### Frontend (Planned)
- React
- TypeScript
- Component architecture

## Development Status

✅ Repository Setup
✅ Development Environment
✅ Backend Implementation
⚡ Test UI Development (In Progress)
✅ OpenAI Integration
✅ Language Management System
✅ Translation System
✅ Backend Testing Setup
⬜ React Setup
⬜ React UI Development
⬜ System Integration
⬜ Documentation

## Current Branch Goals (clean-up)
- Remove legacy code
- Fix identified bugs
- Complete automated testing for backend
- Finalize Test UI implementation

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- SQLite 3
- Git

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/MattGeiger/WTH_App_V5.git
   cd WTH_App_V5
   ```

2. Install dependencies:
   ```bash
   npm install
   cd packages/backend
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. Initialize database:
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

This project is in active development. Please refer to Current Branch Goals for ongoing work.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.