# Categories Test Suite

## Overview
Comprehensive test suite for the Categories module, providing coverage for all components, handlers, and utilities.

## Structure
```
__tests__/
├── handlers/           # Form and data handler tests
├── ui/                # UI component tests
├── utils/             # Test utilities and helpers
├── integration/       # Integration tests
├── jest.config.js     # Jest configuration
├── setup.js          # Test setup and global config
└── README.md         # This file
```

## Running Tests

### All Tests
```bash
npm run test:categories
```

### Watch Mode
```bash
npm run test:categories:watch
```

### Coverage Reports
```bash
npm run test:categories:coverage
npm run test:categories:report
npm run test:categories:full
```

## Test Utilities

### Factory Methods
```javascript
import { createMockCategory, createMockManager } from './utils/testFactories';

const category = createMockCategory({
    name: 'Test Category',
    itemLimit: 5
});

const manager = createMockManager({
    settingsManager: mockSettingsManager
});
```

### Custom Assertions
```javascript
import { 
    expectFormValidationState,
    expectTableStructure 
} from './utils/assertions';

expectFormValidationState(form, { 
    isValid: true, 
    errorMessage: null 
});

expectTableStructure(tableBody);
```

### Test Helpers
```javascript
import { 
    waitForDomUpdate,
    simulateUserInput 
} from './utils/testHelpers';

await waitForDomUpdate();
simulateUserInput(nameInput, 'Test Category');
```

## Writing Tests

### Component Tests
```javascript
describe('UI Component', () => {
    let mockManager;
    
    beforeEach(() => {
        mockManager = createMockManager();
    });

    it('should render correctly', () => {
        // Test implementation
    });
});
```

### Integration Tests
```javascript
describe('Category Integration', () => {
    it('should handle complete lifecycle', async () => {
        // Create, update, delete flow
    });
});
```

## Coverage Requirements
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

## Best Practices

### DOM Testing
- Use waitForDomUpdate() after state changes
- Clean up DOM in afterEach
- Use test factories for consistent data
- Verify DOM structure thoroughly

### Mocking
- Mock external dependencies
- Use factory methods for complex mocks
- Clean up mocks in afterEach
- Verify mock calls

### Performance Testing
```javascript
import { measureDomPerformance } from './utils/testHelpers';

it('should perform efficiently', async () => {
    const reflows = await measureDomPerformance(async () => {
        // Test code
    });
    expect(reflows).toBeLessThan(5);
});
```

## Debug Mode
```bash
DEBUG=true npm run test:categories
```

## Contributing
1. Follow test organization structure
2. Use provided utilities
3. Maintain coverage requirements
4. Add documentation for new utilities
5. Update coverage reports