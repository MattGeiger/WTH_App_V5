# Project Overview

## Introduction

The Food Pantry Management System is a web application designed to support non-profit food pantries through automated inventory management and AI-powered multilingual accessibility. The system **enhances staff performance** while improving service delivery to diverse communities.

## Core Goals

1. **Automated Inventory Management**
   - Zero-configuration database setup
   - Automated item and category tracking
   - Smart inventory status flags (e.g., *must go*, *low supply*)
   - Flexible item limits system (global, category, per-household/per-person)
   - Real-time synchronization across UI components
   - Reduced manual data entry
   - Input validation and constraints (3–36 character limits, no duplicates, etc.)
   - Sortable data tables for efficient management

2. **Multilingual Support**
   - Instant AI translations (OpenAI-powered)
   - Support for 60+ languages
   - Zero-configuration initialization
   - Race-condition prevention for language updates
   - Manual translation refinement and custom translations
   - Automatic updates when languages are toggled active/inactive
   - Sortable translation tables

3. **Dietary Tracking**
   - Automated restriction flags (e.g., halal, kosher, vegetarian, vegan, gluten-free)
   - Clear allergen labeling
   - Quick filtering tools
   - Standardized attributes for dietary needs
   - Sortable dietary information

## Technical Architecture

### Backend Architecture

1. **Database Layer**
   - SQLite for local deployment
   - Prisma ORM for type-safe queries
   - Automated migrations
   - Core models:
     * Categories
     * Food Items
     * Translations
     * Languages
     * Settings

2. **API Layer**
   - Express.js REST API
   - TypeScript integration
   - Modular routing for each entity
   - Standardized responses (via `ApiResponse`)
   - Centralized error handling (`ApiError`, errorHandler middleware)
   - Input validation and logging
   - Real-time feedback and synchronization hooks

3. **Service Layer**
   - Business logic abstraction (CategoryService, FoodItemService, LanguageService, TranslationService)
   - OpenAI integration for translation
   - CRUD operations with data validation
   - Duplicate detection and case-insensitive checks
   - Title case and word repetition prevention

### Frontend Architecture

- **Enhanced Form Design**
  - Modern input field styling with accessibility features
  - Consistent focus and hover states
  - High contrast support
  - Helper text integration and BEM-compliant class naming

- **Modern Form Styling**
  - Consistent input designs
  - Interactive states for user feedback
  - Real-time validation (character length, duplicates, repeated words)
  - Automatic trimming, title-casing, and formatting

- **Button System**
  - Primary: Filled pill-style (#1a73e8)
  - Secondary: Outlined pill-style
  - Consistent height (40px) and padding
  - Responsive behavior on mobile

1. **Current Implementation**
   - Responsive breakpoints (desktop, tablet, mobile)
   - Consistent section dimensions
   - Mobile-first design
   - Modular JavaScript code
   - Event communication across components
   - Real-time UI updates
   - Error messages for invalid inputs
   - Auto-formatting for better data consistency
   - Client-side sorting with type-specific logic (dates, numbers, text)
   - Visual sort indicators (asc/desc) for tables
   - Memory-efficient event handling (cleaning up listeners)

2. **Planned React Implementation**
   - TypeScript + React
   - State management (e.g., Redux or React Context)
   - Enhanced UI/UX with modular components
   - Validation patterns and error boundaries

## Technical Decisions

1. **Database: SQLite**
   - Simple local deployment
   - Zero configuration
   - PostgreSQL upgrade path
   - Case-insensitive searches
   - Unique constraints

2. **ORM: Prisma**
   - Type safety for queries
   - Auto-generated TypeScript types
   - Migration tools for schema changes
   - Query building with validation support

3. **Languages**
   - Automated initialization and AI translations
   - Manual refinement or custom translations
   - Translation caching
   - Automatic toggles for active/inactive states

4. **Item Limits**
   - Global upper limit settings
   - Category thresholds
   - Household vs. per-person
   - Default fallbacks for easy configuration

5. **Input Validation**
   - Character limits (3–36)
   - Case-insensitive uniqueness checks
   - Title case normalization
   - Word repetition prevention
   - No consecutive spaces or special character abuse

6. **Data Presentation**
   - Client-side sorting with typed sort logic
   - Memory-efficient event handling
   - Visual indicators for sort direction
   - Index-based active state management
   - Cleanup for performance and resource usage

## Security Measures

1. **Input Validation**
   - Enforced length constraints
   - Character restrictions
   - Case normalization
   - Duplicate checks
   - Real-time validation in UI
   - Cross-reference checks (e.g., unique name across items/categories)

2. **Error Handling**
   - Custom error classes (`ApiError`)
   - Standardized JSON responses
   - Configurable error detail levels
   - User-friendly messages in the UI
   - Validation feedback for quick fixes

3. **API Security**
   - CORS setup for external access
   - Planned rate limiting
   - Input cleaning and strict schema validations
   - Request logging for audit trails

## Testing Strategy

1. **Unit Tests**
   - Jest framework for services, utilities, validations
   - Detailed coverage for input validation and duplicates
   - Sorting and UI interactions tested in isolation

2. **Integration Tests**
   - API endpoints and route coverage
   - Database operations validated via Prisma
   - Translation integration with OpenAI
   - Input constraints and error scenarios

3. **Frontend Tests**
   - Component-level checks (planned React migration)
   - User interactions in modular JavaScript
   - Browser compatibility
   - Form validation and error handling
   - Sorting behavior tests

## Development Process

1. **Version Control**
   - Feature branches and standard commits
   - Semantic versioning
   - Comprehensive changelogs for each release

2. **Documentation**
   - Code comments and wiki usage guides
   - API references with endpoints
   - Validation rule documentation
   - Detailed UI interaction docs

3. **Quality Control**
   - Code review with PR workflows
   - Automated tests for each commit
   - UI testing for major flows
   - Translation checks with mock data
   - Validation rules for all user inputs

## Roadmap

1. **Short Term**
   - React frontend integration
   - Comprehensive test coverage
   - Basic authentication system
   - Enhanced caching and performance
   - Better sorting features

2. **Medium Term**
   - **Automated shopping lists** (generating pick-lists for staff)
   - Improved analytics and advanced reporting
   - Translation refinements and user roles

3. **Long Term**
   - **Client-facing ordering system** (online pre-orders for clients)
   - Database scaling and multi-pantry deployments
   - Offline mode for on-site reliability
   - Additional analytics for resource management
   - Potential mobile app integration

## Performance

1. **Database**
   - Index optimization for queries
   - Query efficiency improvements
   - Connection pooling (if upgraded to Postgres)
   - Validation speed checks

2. **API**
   - Response caching
   - Pagination for large data sets
   - Efficient loading
   - Fast validations

3. **Frontend**
   - Code splitting for smaller bundles
   - Asset optimization
   - Lazy loading for certain UI components
   - Real-time validation for minimal requests
   - Efficient sorting algorithms
   - Proper event listener cleanup
   - DOM manipulation optimizations

## Deployment

1. **Development**
   - SQLite local environment
   - .env-based config
   - Dev server with hot reload
   - Performance monitoring during dev

2. **Production**
   - Database migration strategy
   - Environment-based config (OpenAI keys, DB paths)
   - Monitoring and logging
   - Regular backups
   - Load testing prior to release

## Maintenance

1. **Database**
   - Scheduled backups
   - Migration management
   - Data cleanup tasks
   - Constraint checks for consistent data

2. **Code**
   - Regular dependency updates
   - Security patches for vulnerabilities
   - Performance monitoring with real-time logs
   - Validation updates as new requirements emerge
   - Event handler cleanup to prevent memory leaks

3. **Translations**
   - Ongoing quality checks
   - Manual review for crucial text
   - Rolling updates in multiple languages
   - Verification of sorting accuracy for translated text

## Success Metrics

1. **Technical**
   - API response time
   - Error rates
   - Translation accuracy
   - Test coverage
   - Validation speed
   - Input quality
   - Sort performance
   - Memory usage
   - Event handler efficiency

2. **Service Impact**
   - **Staff hours saved** (improved staff performance)
   - Language accessibility
   - Client satisfaction
   - System reliability
   - Community reach
   - Data accuracy
   - Information findability