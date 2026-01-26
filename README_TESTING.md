# Testing Guide

This project uses comprehensive unit testing to ensure code quality and prevent regressions.

## Test Setup

### Web App (Vitest)
- **Framework**: Vitest
- **Location**: `web-app/src/**/*.test.ts`
- **Run tests**: `npm test` (from `web-app/` directory)
- **Watch mode**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`
- **UI mode**: `npm run test:ui`

### Backend (Jest)
- **Framework**: Jest
- **Location**: `todo-backend/src/**/*.spec.ts`
- **Run tests**: `npm test` (from `todo-backend/` directory)
- **Watch mode**: `npm run test:watch`
- **Coverage**: `npm run test:cov`

### Mobile App (Jest + React Native)
- **Framework**: Jest with jest-expo
- **Location**: `mobile-app/src/**/*.test.ts`
- **Run tests**: `npm test` (from `mobile-app/` directory)
- **Watch mode**: `npm run test:watch`
- **Coverage**: `npm run test:coverage`

## Running Tests

### Run all tests
```bash
# From project root
cd web-app && npm test
cd ../todo-backend && npm test
cd ../mobile-app && npm test
```

### Run specific test file
```bash
# Web app
cd web-app
npm test reminderHelpers.test.ts

# Backend
cd todo-backend
npm test tasks.service.spec.ts
```

### Run tests in watch mode
```bash
# Web app
cd web-app
npm run test:watch

# Backend
cd todo-backend
npm run test:watch
```

## Test Coverage

### Current Coverage
- **reminderHelpers.ts** (web-app): Comprehensive coverage of all conversion functions
- **reminderHelpers.ts** (mobile-app): Comprehensive coverage of all helper functions
- **storage.ts** (mobile-app): Tests for reminder alarm and time storage
- **TasksService** (backend): Tests for reminder creation and updates

### Adding New Tests

When adding a new feature, always create corresponding tests:

1. **For utility functions** (web-app):
   - Create `*.test.ts` file next to the source file
   - Test all edge cases and error conditions
   - Aim for 100% coverage of the function

2. **For services** (backend):
   - Add tests to existing `*.spec.ts` files
   - Test all CRUD operations
   - Test validation and error cases

3. **Example test structure**:
```typescript
describe('FeatureName', () => {
  describe('functionName', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## CI/CD Integration

Tests run automatically on:
- Every push to `main` and `develop` branches
- Every pull request targeting `main` or `develop`
- Before deployment (tests must pass)

### CI Pipeline
1. **Backend**: Runs Jest tests with coverage
2. **Web App**: Runs Vitest tests  
3. **Mobile App**: Runs Jest tests with coverage
4. **Test Summary**: Ensures all tests passed (blocks merge if any fail)

### Test Requirements
- ✅ **All tests must pass before merging** (enforced by CI)
- ✅ **New features must include tests**
- ✅ **Coverage should not decrease**
- ✅ **No `continue-on-error` flags** - tests are required

### Setting Up Branch Protection

To enforce that tests must pass before merging:

1. Go to **Repository Settings** → **Branches**
2. Add a branch protection rule for `main` (and `develop` if used)
3. Enable **"Require status checks to pass before merging"**
4. Select all CI jobs as required:
   - `Backend CI / backend`
   - `Web App CI / web`
   - `Mobile App CI / mobile`
   - `Test Summary / test-summary`

See [`.github/BRANCH_PROTECTION_SETUP.md`](.github/BRANCH_PROTECTION_SETUP.md) for detailed instructions.

## Best Practices

1. **Test First**: Write tests before or alongside implementation
2. **Isolate Tests**: Each test should be independent
3. **Clear Names**: Use descriptive test names
4. **Cover Edge Cases**: Test boundary conditions and errors
5. **Mock Dependencies**: Use mocks for external services
6. **Keep Tests Fast**: Avoid slow operations in unit tests

## Troubleshooting

### Tests failing locally
1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Clear test cache: `npm test -- --clearCache`
3. Check Node.js version (should be 20+)

### Coverage not updating
1. Run with coverage flag: `npm run test:coverage`
2. Check coverage directory exists
3. Ensure all test files are being discovered

## Future Improvements

- [ ] Add E2E tests with Playwright/Cypress
- [ ] Add integration tests for API endpoints
- [ ] Set up test coverage reporting in CI
- [ ] Add visual regression tests for UI components
