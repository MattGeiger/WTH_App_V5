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
- **Database Management**  
  - SQL backend using Prisma ORM  
  - Category and food item CRUD operations  
  - Language management system  
  - Translation relationships  
  - Dietary attribute tracking  
  - Custom fields for flexibility  
  - Comprehensive error handling

- **API Endpoints**  
  - Categories API with validation  
  - Food Items API (now returning an array instead of paginated by default)  
  - Languages API for localization  
  - Translations API with relationships  
  - Settings API for global configuration  
  - Standardized response formatting

#### Planned
- **React Frontend**  
  - Rewrite the test UI in React  
  - Incorporate TypeScript throughout  
  - Full system integration tests  
  - Production deployment configuration

## Technical Stack

### Backend
- SQLite database
- Prisma ORM
- Node.js / Express
- TypeScript
- Jest testing framework
- Standardized error handling

### Frontend (Current)
- Test UI using plain HTML + modular JavaScript
- Uses `fetch`-based utilities (`apiGet`, `apiPost`, etc.)
- Focused on verifying backend routes and data flow

### Frontend (Future Plans)
- React with TypeScript
- Component-based UI
- Enhanced styling and user experience

## Development Status

- **Repository Setup**: Complete  
- **Development Environment**: Complete  
- **Backend Implementation**: Ongoing  
- **Test UI Development**: Ongoing  
- **OpenAI Integration**: Complete  
- **Language Management System**: Complete  
- **Translation System**: Complete  
- **Backend Testing Setup**: Mostly complete  
- **React Setup**: Planned  
- **React UI Development**: Planned  
- **System Integration**: Planned  
- **Documentation**: Ongoing  

## Getting Started

### Prerequisites

- **Node.js** v14+  
- **npm** or **yarn**  
- **SQLite 3**  
- **Git**

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MattGeiger/WTH_App_V5.git
   cd WTH_App_V5

	2.	Install dependencies:

npm install
cd packages/backend
npm install


	3.	Configure environment:

cp .env.example .env
# Edit .env with your settings


	4.	Initialize database:

npx prisma generate
npx prisma migrate dev



Development
	1.	Start the backend server:

npm run dev


	2.	Run tests:

npm test               # Run all tests
npm run test:unit      # Run a specific test suite
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report


	3.	Access the API:
	•	API: http://localhost:3000
	•	Test UI: http://localhost:3000/index.html

API Documentation

Categories

GET    /api/categories
POST   /api/categories
GET    /api/categories/:id
PUT    /api/categories/:id
DELETE /api/categories/:id

Food Items

GET    /api/food-items
POST   /api/food-items
GET    /api/food-items/:id
PUT    /api/food-items/:id
DELETE /api/food-items/:id

Languages

GET    /api/languages
POST   /api/languages
PUT    /api/languages/:id
DELETE /api/languages/:id

Translations

GET    /api/translations
GET    /api/translations/language/:languageCode
POST   /api/translations/category/:categoryId
POST   /api/translations/food-item/:foodItemId
PUT    /api/translations/:id
DELETE /api/translations/:id

Settings

GET    /api/settings
POST   /api/settings

Contributing

This project is in active development. Refer to the Current Branch Goals in the CHANGELOG for ongoing work.

License

This project is licensed under the MIT License - see the LICENSE file for details.