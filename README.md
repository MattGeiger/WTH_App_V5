# SQL-React-App

A web application providing food pantry inventory management through a React-based UI with a SQL database backend. The system includes automated translations through OpenAI integration to support multiple languages.

## Project Structure

```
.
├── .gitignore
├── CHANGELOG.md
├── LICENSE
├── README.md
├── backup-db                      # Database backups
├── backup-openai                  # OpenAI integration backups
│   ├── OpenAIService.ts
│   └── __tests__
│       └── OpenAIService.test.ts
├── data
│   └── food-pantry.db            # SQLite database
├── package.json
└── packages/
    ├── backend/                  # Backend application
    │   ├── .env                 # Environment configuration
    │   ├── .env.example        # Environment template
    │   ├── jest.config.js      # Test configuration
    │   ├── package.json        # Backend dependencies
    │   ├── prisma/             # Database schema and migrations
    │   ├── public/             # Static files
    │   ├── src/               # Source code
    │   │   ├── routes/       # API endpoints
    │   │   ├── services/     # Business logic
    │   │   ├── middleware/   # Express middleware
    │   │   ├── utils/       # Utility functions
    │   │   └── tests/       # Test suites
    │   └── tsconfig.json     # TypeScript configuration
    ├── frontend/              # React application (planned)
    │   └── package.json
    └── shared/               # Shared code and types
        └── package.json
```

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

## Technical Stack

### Backend (Implemented)
- SQLite database
- Prisma ORM
- Node.js/Express
- TypeScript
- Jest testing framework
- Standardized error handling

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
   npm test
   ```

3. Access API:
   - API: http://localhost:3000
   - Test UI: http://localhost:3000/index.html

### Available Scripts

- `npm run dev` - Start development server
- `npm test` - Run test suite
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
🔄 Step 7: Translation system testing
⬜ Step 8: React setup
⬜ Step 9: React UI development
⬜ Step 10: System integration
⬜ Step 11: Documentation

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

## Contributing

This project is in active development. Contribution guidelines will be established as the project matures.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.