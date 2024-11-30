# SQL-React-App

A web application providing food pantry inventory management through a React-based UI with a SQL database backend. The system includes automated translations through OpenAI integration to support multiple languages.

## Project Overview

This application is designed to:
- Manage food pantry inventory items and categories
- Support multiple languages through automated translations
- Track dietary restrictions and food attributes
- Handle product images
- Offer a responsive, user-friendly interface

### Key Features (Planned)

- **Database Management**: 
  - SQL backend using Prisma ORM
  - Support for categories and food items
  - Dietary attribute tracking
  - Custom fields for flexibility
- **Translation System**: OpenAI integration for automated translations
- **User Interface**: React-based frontend for inventory management
- **Image Management**: Storage and retrieval of product images

## Technical Stack

- **Backend**: 
  - SQLite database
  - Prisma ORM for data management
  - Node.js/Express for API endpoints
- **Frontend**: 
  - React
  - Modern JavaScript
- **External Services**:
  - OpenAI API for translations

## Project Structure

```
sql-react-app/
├── packages/
│   ├── backend/              # Backend application
│   │   ├── prisma/          # Database schema and migrations
│   │   └── src/             # Backend source code
│   ├── frontend/            # React application (planned)
│   └── shared/              # Shared code and types
├── assets/
│   └── images/              # Product image storage
├── docs/                    # Documentation
└── scripts/                 # Build and maintenance scripts
```

## Development Status

✅ Step 1: Repository initialization and documentation setup  
✅ Step 2: Project environment and dependency setup  
⬜ Step 3: Backend development with Prisma ORM  
⬜ Step 4: Basic interface for backend testing  
⬜ Step 5: OpenAI translation integration  
⬜ Step 6: Translation system testing  
⬜ Step 7: React environment setup  
⬜ Step 8: React UI development  
⬜ Step 9: Full system integration  
⬜ Step 10: Documentation completion  

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

## Contributing

This project is currently in active initial development. Contribution guidelines will be established as the project matures.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.