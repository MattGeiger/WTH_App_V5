# SQL-React-App

A web application providing food pantry inventory management through a React-based UI with a SQL database backend. The system includes automated translations through OpenAI integration to support multiple languages.

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
  - Dietary attribute tracking (kosher, halal, vegetarian, etc.)
  - Custom fields for flexible item attributes
  - Translation management for multilingual support
  - Robust error handling and validation

- **API Endpoints**:
  - Categories API
    - List categories with translations
    - Create, update, delete operations
    - Validation and error handling
  - Food Items API
    - Paginated listing with filters
    - Detailed item information
    - Dietary restrictions management
    - Custom field support
  - Translations API
    - Language-specific translations
    - Support for both categories and items
    - Validation for supported languages

#### Planned
- **Translation System**: OpenAI integration for automated translations
- **User Interface**: React-based frontend for inventory management
- **Image Management**: Storage and retrieval of product images

## Technical Stack

### Backend (Implemented)
- SQLite database
- Prisma ORM for data management
- Node.js/Express for API endpoints
- TypeScript for type safety
- Jest for testing
- Comprehensive error handling

### Frontend (Planned)
- React
- Modern JavaScript/TypeScript
- Component-based architecture

### External Services (Implemented)
- OpenAI API (gpt-4o-mini) for cost-effective translations

## Project Structure
```
sql-react-app/
├── packages/
│   ├── backend/                    # Backend application
│   │   ├── prisma/                # Database schema and migrations
│   │   ├── src/
│   │   │   ├── routes/           # API endpoints
│   │   │   ├── services/         # Business logic
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── utils/           # Utility functions
│   │   │   └── tests/           # Test suites
│   │   └── package.json
│   ├── frontend/                  # React application (planned)
│   └── shared/                    # Shared code and types
├── assets/
│   └── images/                    # Product image storage
├── docs/                          # Documentation
└── scripts/                       # Build and maintenance scripts
```

## Development Status

✅ Repository Setup
✅ Development Environment
✅ Backend Implementation
✅ Test UI Development
✅ OpenAI Integration
🔄 Step 6: Translation system testing
⬜ Step 7: React environment setup  
⬜ Step 8: React UI development  
⬜ Step 9: Full system integration  
⬜ Step 10: Documentation completion

## Latest Milestone (v0.5.0)
Completed OpenAI integration with:
- Automated translations using gpt-4o-mini
- Multi-language support
- Cost-effective processing
- Seamless UI integration

## Next Steps
Integration with OpenAI API for automated translations.

## API Documentation

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:id` - Get category details
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Food Items
- `GET /api/food-items` - List items (supports pagination)
- `GET /api/food-items/:id` - Get item details
- `POST /api/food-items` - Create new item
- `PUT /api/food-items/:id` - Update item
- `DELETE /api/food-items/:id` - Delete item

### Translations
- `POST /api/translations/category/:categoryId` - Add category translation
- `POST /api/translations/food-item/:foodItemId` - Add item translation
- `GET /api/translations/language/:language` - Get translations by language
- `PUT /api/translations/:id` - Update translation
- `DELETE /api/translations/:id` - Delete translation

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- SQLite

### Initial Setup
1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd packages/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and update configuration
5. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```

### Development
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Run tests:
   ```bash
   npm test
   ```

## Contributing

This project is currently in active initial development. Contribution guidelines will be established as the project matures.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.