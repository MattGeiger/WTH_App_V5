# Project Structure

```
# Project Structure

📂 packages/
 📂 backend/
   📂 prisma/                      # Database configuration & migrations
     📂 migrations/                # SQL migration files for database schema changes
     📑 schema.prisma             # Prisma schema defining database models
     
   📂 public/                     # Frontend static assets
     📂 css/                      # Stylesheets
       📂 components/             # Component-specific styles
       📂 layout/                # Layout-related styles
     📂 js/                      # Frontend JavaScript
       📂 utils/                # Utility functions
       📑 categories.js         # Category management
       📑 foodItems.js         # Food item management 
       📑 languages.js         # Language management
       📑 main.js             # Main entry point
       📑 settings.js         # Settings management
       📑 translations.js     # Translation management
       📑 utils.js           # Shared utilities
     📑 index.html           # Main HTML page
     
   📂 src/                       # Backend source code
     📂 config/                 # Configuration files
     📂 middleware/             # Express middleware
     📂 routes/                # API route handlers
     📂 services/              # Business logic services
       📂 openai/             # OpenAI integration
     📂 tests/                # Test files
       📂 utils/             # Test utilities
     📂 utils/               # Utility functions
     📑 index.ts            # Application entry point
     
   📑 .env.example          # Environment variables template
   📑 jest-setup.js        # Jest test setup
   📑 jest.config.js       # Jest configuration
   📑 package.json         # Backend dependencies
   📑 tsconfig.json        # TypeScript configuration
   
 📂 frontend/               # React frontend (in development)
   📑 package.json         # Frontend dependencies

📑 .gitignore               # Git ignore rules
📑 LICENSE                  # MIT license
📑 package.json             # Root package.json for workspace
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