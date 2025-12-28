# Testing Guide

This document explains how to run tests for the SafeMed application.

## Test Setup

The project includes two types of tests:
1. **Unit Tests** - Using Jest and React Testing Library
2. **E2E Tests** - Using Playwright

## Running Tests

### Unit Tests (Jest)

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

Run tests with coverage:
```bash
npm test -- --coverage
```

### E2E Tests (Playwright)

Run all E2E tests:
```bash
npm run test:e2e
```

Run tests in headed mode (see browser):
```bash
npx playwright test --headed
```

Run tests for a specific browser:
```bash
npx playwright test --project=chromium
```

View test report:
```bash
npx playwright show-report
```

## Test Structure

### Unit Tests
- Location: `src/**/__tests__/**/*.test.tsx` or `src/**/__tests__/**/*.test.ts`
- Examples:
  - `src/components/__tests__/LoadingSpinner.test.tsx`
  - `src/lib/__tests__/utils.test.ts`

### E2E Tests
- Location: `e2e/**/*.spec.ts`
- Examples:
  - `e2e/example.spec.ts` - Basic navigation tests

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/auth/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*dashboard/)
})
```

## Test Coverage Goals

- Unit tests: Minimum 70% coverage
- E2E tests: Cover critical user flows
  - Authentication flow
  - Medication scanning
  - Dashboard navigation
  - Settings management

## Mocking

### Supabase
Supabase client is mocked in `jest.setup.js`. Update mocks as needed for your tests.

### Next.js Router
Next.js router hooks are mocked in `jest.setup.js` for unit tests.

## Continuous Integration

Tests should run automatically in CI/CD pipelines. Make sure to:
1. Set up environment variables in CI
2. Install Playwright browsers: `npx playwright install --with-deps chromium`
3. Run tests: `npm test && npm run test:e2e`

