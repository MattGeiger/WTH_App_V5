# Food Items Test Suite

## Overview
Comprehensive test suite for the Food Items module, providing coverage for all components, handlers, and utilities.

## Structure
```
__tests__/
├── handlers/           # Form and data handler tests
├── ui/                # UI component tests
├── utils/             # Test utilities and helpers
├── jest.config.js     # Jest configuration
├── setup.js           # Test setup and global config
└── README.md          # This file
```

## Running Tests

### All Tests
```bash
npm run test:fooditems
```

### Watch Mode
```bash
npm run test:fooditems:watch
```

### Coverage Report
```bash
npm run test:fooditems:coverage
```

## Test Utilities

### Factory Methods
```javascript
import { createMockFoodItem, createMockManager } from './utils/testFactories';

// Create mock food item
const item = createMockFoodItem({
    name: 'Test Item',
    categoryId: 1
});

// Create mock manager
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

// Verify form state
expectFormValidationState(form, { 
    isValid: true, 
    errorMessage: null 
});

// Check table structure
expectTableStructure(tableBody);
```

### Test Helpers
```javascript
import { 
    waitForDomUpdate,
    simulateUserInput 
} from './utils/testHelpers';

// Wait for DOM updates
await waitForDomUpdate();

// Simulate user input
simulateUserInput(nameInput, 'Test Item');
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

### Handler Tests
```javascript
describe('Form Handler', () => {
    beforeEach(() => {
        // Setup code
    });

    it('should handle submit', async () => {
        // Test implementation
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
- Use `waitForDomUpdate()` after state changes
- Clean up DOM in `afterEach`
- Use test factories for consistent data
- Verify DOM structure thoroughly

### Mock Usage
- Mock external dependencies
- Use factory methods for complex mocks
- Clean up mocks in `afterEach`
- Verify mock calls when relevant

### Assertions
- Use custom assertions for readability
- Verify complete component state
- Check error conditions
- Test edge cases

## Performance Testing
```javascript
import { measureDomPerformance } from './utils/testHelpers';

it('should perform efficiently', async () => {
    const reflows = await measureDomPerformance(async () => {
        // Test code here
    });
    expect(reflows).toBeLessThan(5);
});
```

## Debug Mode
Set `DEBUG=true` environment variable for detailed logging:
```bash
DEBUG=true npm run test:fooditems
```

## Contributing
1. Follow test organization structure
2. Use provided utilities and helpers
3. Maintain coverage requirements
4. Add documentation for new utilities
5. Follow naming conventions