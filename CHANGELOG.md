# Changelog
All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Planned
- React-based user interface
- Production deployment configuration
- Full system integration testing

## [v0.5.1] - 2024-12-06
### Added
- Language model for managing supported languages
- Comprehensive language management system
- Improved translation validation and error handling
- Complete test coverage for language management
- Non-null assertions for type safety
- Paginated response utility

### Changed
- Updated translation schema to support language relationships
- Enhanced error handling with standardized responses
- Improved test setup with proper database cleanup
- Updated API documentation for language endpoints

### Fixed
- Language uniqueness constraint handling
- Translation relationship type safety
- Category validation for empty names
- Response status code consistency

## [v0.5.0] - 2024-12-06
### Added
- OpenAI-powered translation system using gpt-4o-mini model
- Cost-effective automated translations
- Multiple language support
- Seamless UI integration

### Fixed
- Translation loading error after food item deletion

### Changed
- Translation system from manual to automated

## [v0.4.0] - 2024-12-03
### Added
- Test UI for validating backend functionality
- Category management interface
- Food item management with dietary and status flags
- Translation management interface
- Basic CSS styling for usability
- Complete CRUD operations for all entities
- Form validation and error handling
- Status and dietary attribute display

### Fixed
- Food items visibility when out of stock
- JSON parsing in food item edit functionality

### Known Issues
- Translation loading error after food item deletion

## [0.1.1] - 2024-12-02
### Added
- Complete backend implementation:
  - Category, FoodItem, and Translation services with CRUD operations
  - RESTful API endpoints with validation
  - Comprehensive test coverage (56 tests)
  - Structured error handling
  - Request logging middleware

### Changed
- Enhanced project structure:
  - Separate route handlers
  - Service layer abstraction
  - Utility classes for errors and responses
- Improved type safety with TypeScript
- Updated documentation with API endpoints

## [0.1.0] - 2024-11-29
### Added
- Initial project setup:
  - Prisma ORM integration
  - Database schema for:
    - Categories and food items
    - Multi-language translations
    - Dietary attributes
    - Custom fields
  - Development environment configuration
  - SQLite database initialization
- Documentation setup:
  - README structure
  - Development roadmap
  - MIT License

### Changed
- Repository reset for fresh implementation
- Updated technical stack documentation