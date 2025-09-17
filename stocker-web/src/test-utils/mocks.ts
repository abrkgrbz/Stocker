// Centralized mocks for all tests
import { vi } from 'vitest';

// Mock localStorage with actual storage
const localStorageData: Record<string, string> = {};

export const localStorageMock = {
  getItem: vi.fn((key: string) => localStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageData[key];
  }),
  clear: vi.fn(() => {
    for (const key in localStorageData) {
      delete localStorageData[key];
    }
  }),
};

// Mock sessionStorage with actual storage
const sessionStorageData: Record<string, string> = {};

export const sessionStorageMock = {
  getItem: vi.fn((key: string) => sessionStorageData[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    sessionStorageData[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete sessionStorageData[key];
  }),
  clear: vi.fn(() => {
    for (const key in sessionStorageData) {
      delete sessionStorageData[key];
    }
  }),
};

// Mock fetch
export const fetchMock = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: new Headers(),
  })
);

// Mock window.matchMedia
export const matchMediaMock = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock IntersectionObserver
export class IntersectionObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

// Mock ResizeObserver
export class ResizeObserverMock {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

// Mock react-router-dom
export const mockNavigate = vi.fn();
export const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
};

// Mock auth service responses
export const mockAuthResponses = {
  login: {
    token: 'test-token',
    refreshToken: 'test-refresh-token',
    user: {
      id: 'user-1',
      email: 'test@example.com',
      userName: 'testuser',
      tenantId: 'tenant-1',
      roles: ['User'],
    },
  },
  validate: {
    isValid: true,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      userName: 'testuser',
      tenantId: 'tenant-1',
      roles: ['User'],
    },
  },
};

// Mock tenant service responses
export const mockTenantResponses = {
  validate: {
    isValid: true,
    tenant: {
      id: 'tenant-1',
      name: 'Test Tenant',
      subdomain: 'test',
      isActive: true,
    },
  },
  settings: {
    theme: 'light',
    primaryColor: '#1890ff',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'Europe/Istanbul',
    language: 'tr',
    features: [
      { name: 'dashboard', enabled: true },
      { name: 'reports', enabled: false },
    ],
  },
};

// Mock API error responses
export const mockApiError = (message = 'API Error', status = 500) => ({
  ok: false,
  status,
  statusText: message,
  json: () => Promise.reject(new Error(message)),
  text: () => Promise.resolve(message),
});

// Mock canvas for chart tests
export const canvasMock = {
  getContext: vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Array(4),
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })),
  toDataURL: vi.fn(),
};

// Mock date functions
export const mockDate = new Date('2024-01-01T12:00:00Z');

// Apply all mocks
export const setupMocks = () => {
  // Storage mocks
  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
  
  // Fetch mock
  global.fetch = fetchMock;
  
  // Media query mock
  Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });
  
  // Observer mocks
  global.IntersectionObserver = IntersectionObserverMock as any;
  global.ResizeObserver = ResizeObserverMock as any;
  
  // Canvas mock
  HTMLCanvasElement.prototype.getContext = canvasMock.getContext as any;
  HTMLCanvasElement.prototype.toDataURL = canvasMock.toDataURL;
  
  // Don't use fake timers - they interfere with async tests
  // vi.useFakeTimers();
  // vi.setSystemTime(mockDate);
};

// Reset all mocks
export const resetMocks = () => {
  // Clear localStorage data and mock calls
  for (const key in localStorageData) {
    delete localStorageData[key];
  }
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Clear sessionStorage data and mock calls
  for (const key in sessionStorageData) {
    delete sessionStorageData[key];
  }
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  fetchMock.mockClear();
  matchMediaMock.mockClear();
  mockNavigate.mockClear();
  
  // Don't clear timers if not using fake timers
  // vi.clearAllTimers();
};