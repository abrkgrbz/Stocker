import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import { setupMocks, resetMocks } from './mocks';

// Don't mock TenantContext for its own tests
// Individual test files can mock it if needed

// Setup all mocks before tests
beforeAll(() => {
  setupMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  resetMocks();
  vi.clearAllMocks();
});

// Mock console methods to reduce noise
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  debug: vi.fn(),
};

// Mock scrollTo
window.scrollTo = vi.fn();

// Mock crypto for tests
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 0);
  return 0;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance.now
global.performance.now = vi.fn(() => Date.now());

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.VITE_API_URL = 'http://localhost:3000/api';
process.env.VITE_ENVIRONMENT = 'test';