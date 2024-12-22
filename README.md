# Food Pantry Management System 

A web application designed for non-profit food pantries. Features automated inventory management, AI-powered translations, and multilingual accessibility.

## System Overview

- Automated inventory management for food pantries
- Zero-configuration multilingual support (60+ languages)
- AI-powered instant translations
- Dietary and allergen tracking
- Flexible item limits (per household/person)
- Category-based limit management

### Key Features

#### Core Functionality
- **Automated Management**
  - Inventory tracking and monitoring
  - Category and item organization
  - Status flags (must go, low supply)
  - Real-time updates across components

- **Language Support**
  - AI-powered translation system
  - Automatic language initialization
  - Manual translation refinement
  - Race condition protection
  - Instant updates across UI

- **Dietary System**
  - Automated dietary flags
  - Allergen tracking
  - Preference filtering
  - Standardized attributes

#### Technical Implementation
- **Backend**
  - SQLite with Prisma ORM
  - Express.js REST API
  - TypeScript services
  - OpenAI integration
  - Automated testing

- **Frontend**
  - Modular JavaScript architecture
  - Event-driven state management
  - Real-time synchronization
  - Component-based design
  - Comprehensive test coverage

## Getting Started

### Requirements
- Node.js v14+
- npm/yarn
- SQLite 3
- Git
- OpenAI API key

### Installation

1. Clone and enter directory:
```bash
git clone https://github.com/MattGeiger/food-pantry-app.git
cd food-pantry-app
```

2. Install dependencies:
```bash
npm install
cd packages/backend
npm install
```

3. Set up environment:
```bash
cp .env.example .env
# Add your OpenAI API key to .env
```

4. Initialize database:
```bash
npx prisma generate
npx prisma migrate reset --force
```

### Development

Start server:
```bash
npm run dev
```

Run tests:
```bash
npm test                 # All tests
npm run test:unit       # Unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

Access application:
- API: http://localhost:3000
- UI: http://localhost:3000/index.html

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
POST   /api/languages/bulk
GET    /api/languages/active
```

### Translations
```
GET    /api/translations
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

## Development Status

✅ Complete
- Repository setup
- Development environment
- Backend implementation
- Test UI development
- OpenAI integration
- Language initialization
- Translation system
- Testing framework

🔄 In Progress
- Documentation updates
- Performance optimization
- Error handling improvements

📅 Planned
- React frontend
- User authentication
- Analytics dashboard
- Mobile interface

## Project Structure

```
packages/
├── backend/           # Main application
│   ├── prisma/       # Database layer
│   ├── public/       # Test UI
│   └── src/          # Backend source
└── frontend/         # React app (planned)
```

## Contributing

This project accepts contributions. See CHANGELOG.md for current development focus.

## License

MIT License - see LICENSE file for details.

## Support

For issues: [GitHub Issues](https://github.com/MattGeiger/food-pantry-app/issues)  
Documentation: [Project Wiki](https://github.com/MattGeiger/food-pantry-app/wiki)