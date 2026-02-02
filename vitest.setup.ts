import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Mock ResizeObserver (required by cmdk)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView (required by cmdk)
Element.prototype.scrollIntoView = function() {};

// Cleanup after each test
afterEach(() => {
  cleanup();
});
