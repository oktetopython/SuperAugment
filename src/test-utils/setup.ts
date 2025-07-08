/**
 * Jest Test Setup
 * 
 * Global test configuration and setup utilities
 */

import { jest } from '@jest/globals';

// Mock console methods to reduce noise in tests
const originalConsole = global.console;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Mock console methods to avoid noise in test output
  global.console = {
    ...originalConsole,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
});

afterEach(() => {
  // Restore console after each test
  global.console = originalConsole;
});

// Global test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env['NODE_ENV'] = 'test';
