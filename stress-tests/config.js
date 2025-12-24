// Stress Test Configuration
// Modify these values based on your environment

export const CONFIG = {
  // API Backend
  API_BASE_URL: __ENV.API_URL || 'https://api.stockerapp.com',

  // Next.js Frontend
  FRONTEND_URL: __ENV.FRONTEND_URL || 'https://app.stockerapp.com',

  // Test Credentials (use test tenant)
  TEST_EMAIL: __ENV.TEST_EMAIL || 'test@example.com',
  TEST_PASSWORD: __ENV.TEST_PASSWORD || 'TestPassword123!',

  // Tenant Info
  TENANT_CODE: __ENV.TENANT_CODE || 'test-tenant',
};

// Test Scenarios - 1000 User Simulation
export const LOAD_STAGES = {
  // Gradual ramp-up to 1000 users
  smoke: [
    { duration: '1m', target: 10 },   // Warm up
    { duration: '1m', target: 10 },   // Stay at 10
  ],

  load: [
    { duration: '2m', target: 100 },  // Ramp up to 100
    { duration: '5m', target: 100 },  // Stay at 100
    { duration: '2m', target: 0 },    // Ramp down
  ],

  stress: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '3m', target: 500 },  // Push to 500
    { duration: '5m', target: 1000 }, // Push to 1000 users
    { duration: '5m', target: 1000 }, // Stay at 1000
    { duration: '3m', target: 0 },    // Ramp down
  ],

  spike: [
    { duration: '1m', target: 100 },  // Normal load
    { duration: '30s', target: 1000 }, // Sudden spike to 1000
    { duration: '2m', target: 1000 }, // Stay at spike
    { duration: '30s', target: 100 }, // Drop back
    { duration: '2m', target: 0 },    // Recovery
  ],

  soak: [
    { duration: '5m', target: 500 },  // Ramp up
    { duration: '30m', target: 500 }, // Stay at 500 for 30 min
    { duration: '5m', target: 0 },    // Ramp down
  ],
};

// Thresholds - Performance Requirements
export const THRESHOLDS = {
  // HTTP Request Duration
  http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95% < 2s, 99% < 5s

  // HTTP Request Failed Rate
  http_req_failed: ['rate<0.05'], // Less than 5% failure rate

  // Custom metrics
  'http_req_duration{type:api}': ['p(95)<1000'],      // API calls < 1s
  'http_req_duration{type:page}': ['p(95)<3000'],     // Page loads < 3s
  'http_req_duration{type:static}': ['p(95)<500'],    // Static assets < 500ms
};
