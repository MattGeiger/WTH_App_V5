# Changelog
All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.19] - 2024-12-28
### Changed
- Enhanced Food Item form component architecture
  - Refactored flag group creation for better modularity
  - Improved accessibility with proper label associations
  - Enhanced DOM hierarchy and element creation
  - Added proper input name attributes
  - Fixed class name consistency issues
  - Split complex functions into smaller, focused ones
  - Improved test coverage and reliability
  - Added error handling for form element generation
  - Enhanced form initialization process
  - Added documentation for form component structure

## [0.5.18] - 2024-12-27
### Added
- Comprehensive test suite for Food Items module
  - Added component-level test organization
  - Implemented test utilities and factories
  - Added custom assertions and helpers
  - Created performance testing tools
  - Added coverage reporting system
- Test coverage reporting system
  - Added automated report generation
  - Created detailed coverage templates
  - Implemented component-level metrics
  - Added quality assessment tools
- Test documentation
  - Added comprehensive test suite documentation
  - Created best practices guide
  - Added coverage report documentation
  - Included usage guidelines and examples

## [0.5.17] - 2024-12-27
### Changed
- Refactored Food Item Management into modular architecture
  - Split foodItems.js into smaller, focused modules
  - Created dedicated handlers for form submission and validation
  - Separated UI components for forms, tables, and stats
  - Added centralized error handling utility
  - Improved code maintainability and testability
  - Reduced module coupling
  - Enhanced separation of concerns

## [0.5.16] - 2024-12-26
### Added
- UI System Documentation:
  - Created /docs directory for system documentation
  - Added design-notes.md with detailed component specifications
  - Added elements.html as interactive UI catalog
  - Added sample-layout.html demonstrating layout patterns
  - Documented:
    - Form element styling and behavior
    - Button system specifications
    - Message styling variations
    - Spacing and layout guidelines
    - Typography standards
    - Input field patterns
    - Responsive design rules
    - Grid system usage
    - Table styling
    - CSS variable system

## [0.5.15] - 2024-12-26
### Changed
- Enhanced Food Item Management flag controls
  - Improved checkbox grid layout matching Language Management design
  - Added visual distinction between status and dietary flags
  - Enhanced hover effects and accessibility features
  - Implemented consistent grid layout and spacing
  - Maintained responsive design and high contrast support

## [0.5.14] - 2024-12-25
### Changed
- Enhanced input field styling across the application
  - Modernized form input visual design
  - Improved focus and hover states
  - Added helper text support
  - Enhanced accessibility with high contrast support
  - Updated form class naming convention to BEM methodology

## [0.5.13] - 2024-12-25
### Changed
- Enhanced form input styling with modern UI elements
  - Added consistent styling for all input types
  - Improved focus states and transitions
  - Added helper text and required field indicators
  - Enhanced accessibility features
  - Added high contrast mode support

## [0.5.13] - 2024-12-25
### Changed
- Standardized button styling across UI sections using primary and secondary button patterns
- Applied consistent button dimensions and spacing
- Updated Global Settings "Save" button to match primary button style

## [0.5.12] - 2024-12-25
### Fixed
- Standardized section dimensions across the UI for consistent appearance
- Enhanced responsive design with better breakpoints for various screen sizes
- Improved mobile layout and spacing for better usability on small devices

## [0.5.11] - 2024-12-25
### Added
- Custom translation support:
  - New API routes for managing custom translations
  - Backend methods for creating and retrieving custom translations
  - Database schema updates to include `originalText` for custom translations
  - Frontend support for adding and managing custom translations via UI
  - Automatic application of custom translations to all active languages
  - "Custom Translation" table view in Translation Management section
- Enhanced Translation Management UI:
  - "Add Translation" button for custom translations
  - Updated labels for clarity (e.g., "Custom Translation:")
  - Improved empty state messaging for tables
- New error handling for custom translations:
  - Consistent error messages for missing or invalid parameters
  - Detailed logging of API request errors
- Improved form structure for Food Item Management:
  - Removed duplicate form elements from the HTML template
  - Dynamic form creation handled entirely in JavaScript
  - Stacked input fields in logical order (Item Name, Category, Item Limit)
  - Dropdowns for item limits, including "No Limit" as default
- Backend validation for translation requests:
  - Added support for "customInput" type in translation routes
  - Validation of input parameters for consistency and security

### Changed
- Updated database constraints:
  - Unique constraint added for custom translations (`languageId` + `originalText`)
  - Schema migration for `originalText` field
- Refactored translation service:
  - Centralized logic for handling translation types
  - Improved OpenAI integration for dynamic prompts
- Improved Translation Management filtering:
  - Fixed issues with "Custom" radio button interaction
  - Added dynamic table rendering for active custom translations
- Enhanced feedback for translation actions:
  - Real-time updates to Translation Management table after actions
  - Clear success and error messages for users

### Fixed
- UI error for Translation Management:
  - Resolved issue where "Custom" radio button triggered invalid type error
  - Fixed API request errors for `type=customInput`
- API error handling:
  - Properly logs and reports invalid translation types
  - Improved error responses for invalid or missing query parameters
- Food Item Management:
  - Fixed missing input controls for dietary tags and status flags
  - Resolved layout issues caused by inconsistent form generation
- JavaScript cleanup:
  - Removed unused or duplicate code in `translations.js` and `foodItems.js`
  - Improved event listener handling and memory cleanup

### Known Issues
- Translation Management table does not currently display individual statuses for translations (e.g., pending, completed) – planned for future release.
- Performance optimization for bulk translation processing is still in progress.
- Custom translations cannot currently be edited or deleted via the UI.

## [0.5.10] - 2024-12-23
### Added
- Table sorting functionality
  - Ascending/descending toggles for all data tables
  - Visual sort indicators with directional arrows
  - Type-specific sorting (dates, numbers, text)
  - Memory-efficient event handling
  - Cross-browser compatible implementation
- Enhanced table interactivity
  - Hover effects for sortable columns
  - Active state styling for current sort
  - Proper cleanup of event listeners

### Changed
- Improved table header styling
- Enhanced user interaction feedback

## [0.5.9] - 2024-12-22
### Added
- Input validation and constraints
  - Character max limit (36 characters)
  - Character min limit (3 characters)
  - Case-insensitive duplicate prevention
  - Input trimming and normalization
  - Special character/number restrictions
  - Title case normalization
  - Word repetition prevention
  - Real-time validation feedback
### Fixed
- SQLite case-sensitivity handling
- Database constraint enforcement
- Validation error messages
- Cross-entity duplicate detection

## [0.5.8] - 2024-12-21
### Fixed
- Language initialization race condition resolved
  - Added static initialization promise
  - Implemented proper promise handling
  - Resolved database constraint violations
  - Eliminated page refresh requirement
- Fresh database initialization now works correctly

## [0.5.7] - 2024-12-21
### Added
- Language Management filter dropdown (All/Active/Inactive)
- Enhanced language configuration robustness
  - Default language initialization
  - Automatic database population
  - Full OpenAI model language support
### Fixed
- Language Management unpopulation issue with fresh database
- Language table readability with filtering options

## [0.5.6] - 2024-12-21
### Added
- Category limit feature
  - Added itemLimit field to Category model
  - Implemented UI controls for setting category limits
  - Added validation against global upper limit
  - Real-time updates between Category and Food Item sections
- Event-based communication between managers
  - Automatic dropdown updates for Food Items
  - Cross-component synchronization

### Fixed
- Food Item category dropdown now updates automatically
- Improved initial database state handling
- Added proper validation for limit values

## [0.5.5] - 2024-12-21
### Added
- **LimitType** field to **FoodItem** model  
- Test suite for FoodItem limitType functionality  
- **Test mode** for FoodItemService  
- Additional test coverage for OpenAIService  
- Improved documentation for modular JavaScript structure

### Fixed
- Food item update functionality  
- Translation generation during testing  
- TypeScript validation in FoodItemService  
- Documentation formatting inconsistencies  
- **Food Items table display** and CRUD in Test UI (Edit/Delete now functional)

## [0.5.3] - 2024-12-18
### Added
- Local development environment setup
- Working database configuration for local SQLite
- Test data initialization process
- Updated documentation for local setup

### Changed
- Messages now display within their respective sections instead of global header
- Fixed category dropdown in Food Item Management
- Improved language filter to show all available languages

### Fixed
- Package dependency issues for local development
- Database path configuration for cross-platform compatibility
- Git tracking of sensitive information

## [0.5.2] - 2024-12-11
### Fixed
- Translation type classification in UI (categories vs. food items)
- Original text display in translation management
- Language filter dropdown initialization
- Translation filtering by type

### Added
- Automatic language filter updates when language settings change
- Event-based synchronization between language and translation managers

### Changed
- Improved translation type handling in backend service
- Enhanced translation filtering logic

## [0.5.1] - 2024-12-06
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

## [0.5.0] - 2024-12-06
### Added
- OpenAI-powered translation system using gpt-4o-mini model
- Cost-effective automated translations
- Multiple language support
- Seamless UI integration

### Fixed
- Translation loading error after food item deletion

### Changed
- Translation system from manual to automated

## [0.4.0] - 2024-12-03
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