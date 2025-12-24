/**
 * Full Stack Stress Test - 1000 Concurrent Users
 * Simulates realistic user behavior across both Frontend and API
 *
 * Run: k6 run full-stack-stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { CONFIG, LOAD_STAGES } from './config.js';

// ============================================
// CUSTOM METRICS
// ============================================
const metrics = {
  // Error rates
  apiErrors: new Rate('api_errors'),
  pageErrors: new Rate('page_errors'),
  loginErrors: new Rate('login_errors'),

  // Response times
  apiResponseTime: new Trend('api_response_time', true),
  pageLoadTime: new Trend('page_load_time', true),
  loginTime: new Trend('login_time', true),

  // Counters
  totalRequests: new Counter('total_requests'),
  successfulLogins: new Counter('successful_logins'),
  failedLogins: new Counter('failed_logins'),

  // Current state
  activeUsers: new Gauge('active_users'),
};

// ============================================
// TEST OPTIONS
// ============================================
export const options = {
  scenarios: {
    // Scenario 1: Normal users browsing
    browsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 300 },  // Ramp to 300 browsers
        { duration: '5m', target: 500 },  // Push to 500
        { duration: '5m', target: 500 },  // Maintain
        { duration: '3m', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '30s',
      exec: 'browserUser',
    },

    // Scenario 2: API-heavy users (mobile apps, integrations)
    apiUsers: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },  // Ramp to 200 API users
        { duration: '5m', target: 400 },  // Push to 400
        { duration: '5m', target: 400 },  // Maintain
        { duration: '3m', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '30s',
      exec: 'apiUser',
    },

    // Scenario 3: Spike test
    spikeTest: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 0 },     // Wait
        { duration: '30s', target: 100 },  // Sudden spike
        { duration: '1m', target: 100 },   // Hold spike
        { duration: '30s', target: 0 },    // Drop
      ],
      startTime: '7m', // Start after main ramp
      gracefulRampDown: '10s',
      exec: 'spikeUser',
    },
  },

  thresholds: {
    // API thresholds
    api_response_time: ['p(95)<2000', 'p(99)<5000'],
    api_errors: ['rate<0.05'],

    // Page thresholds
    page_load_time: ['p(95)<3000', 'p(99)<6000'],
    page_errors: ['rate<0.05'],

    // Login thresholds
    login_time: ['p(95)<3000'],
    login_errors: ['rate<0.10'],

    // Overall
    http_req_failed: ['rate<0.05'],
  },
};

// ============================================
// SETUP
// ============================================
export function setup() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('     🚀 FULL STACK STRESS TEST - 1000 CONCURRENT USERS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📍 API:      ${CONFIG.API_BASE_URL}`);
  console.log(`📍 Frontend: ${CONFIG.FRONTEND_URL}`);
  console.log('═══════════════════════════════════════════════════════════');

  // Health checks
  const apiHealth = http.get(`${CONFIG.API_BASE_URL}/health`);
  const frontendHealth = http.get(CONFIG.FRONTEND_URL);

  const apiOk = apiHealth.status === 200;
  const frontendOk = frontendHealth.status === 200;

  console.log(`API Health:      ${apiOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Frontend Health: ${frontendOk ? '✅ OK' : '❌ FAILED'}`);

  if (!apiOk || !frontendOk) {
    console.error('⚠️ One or more services unhealthy, proceeding with caution');
  }

  return {
    apiHealthy: apiOk,
    frontendHealthy: frontendOk,
    startTime: new Date().toISOString(),
  };
}

// ============================================
// SCENARIO: Browser User (Frontend + API)
// ============================================
export function browserUser(data) {
  const sessionId = `browser_${__VU}_${__ITER}`;
  metrics.activeUsers.add(1);

  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Code': CONFIG.TENANT_CODE,
    'X-Session-ID': sessionId,
  };

  let authToken = null;

  // 1. Load login page
  group('Load Login Page', () => {
    const res = http.get(`${CONFIG.FRONTEND_URL}/login`, {
      tags: { type: 'page' },
    });
    metrics.pageLoadTime.add(res.timings.duration);
    metrics.pageErrors.add(res.status >= 400 ? 1 : 0);
    metrics.totalRequests.add(1);
    sleep(1);
  });

  // 2. Login via API
  group('Login', () => {
    const loginRes = http.post(
      `${CONFIG.API_BASE_URL}/api/auth/login`,
      JSON.stringify({
        email: CONFIG.TEST_EMAIL,
        password: CONFIG.TEST_PASSWORD,
      }),
      { headers, tags: { type: 'api', action: 'login' } }
    );

    metrics.loginTime.add(loginRes.timings.duration);
    metrics.totalRequests.add(1);

    if (loginRes.status === 200) {
      try {
        const body = JSON.parse(loginRes.body);
        authToken = body.accessToken || body.token;
        metrics.successfulLogins.add(1);
      } catch {
        metrics.failedLogins.add(1);
        metrics.loginErrors.add(1);
      }
    } else {
      metrics.failedLogins.add(1);
      metrics.loginErrors.add(1);
    }
    sleep(0.5);
  });

  if (!authToken) {
    metrics.activeUsers.add(-1);
    return;
  }

  const authHeaders = { ...headers, Authorization: `Bearer ${authToken}` };

  // 3. Load Dashboard
  group('Dashboard', () => {
    // Page load
    const pageRes = http.get(`${CONFIG.FRONTEND_URL}/dashboard`, {
      tags: { type: 'page' },
    });
    metrics.pageLoadTime.add(pageRes.timings.duration);
    metrics.totalRequests.add(1);

    // API calls dashboard makes
    http.batch([
      ['GET', `${CONFIG.API_BASE_URL}/api/auth/me`, null, { headers: authHeaders }],
      ['GET', `${CONFIG.API_BASE_URL}/api/tenant/modules`, null, { headers: authHeaders }],
    ]).forEach((r) => {
      metrics.apiResponseTime.add(r.timings.duration);
      metrics.apiErrors.add(r.status >= 400 ? 1 : 0);
      metrics.totalRequests.add(1);
    });

    sleep(2);
  });

  // 4. Navigate to CRM
  group('CRM Module', () => {
    const pageRes = http.get(`${CONFIG.FRONTEND_URL}/crm/customers`, {
      tags: { type: 'page' },
    });
    metrics.pageLoadTime.add(pageRes.timings.duration);
    metrics.totalRequests.add(1);

    // CRM API calls
    const customersRes = http.get(
      `${CONFIG.API_BASE_URL}/api/crm/customers/paged?pageNumber=1&pageSize=20`,
      { headers: authHeaders, tags: { type: 'api' } }
    );
    metrics.apiResponseTime.add(customersRes.timings.duration);
    metrics.apiErrors.add(customersRes.status >= 400 ? 1 : 0);
    metrics.totalRequests.add(1);

    sleep(3);
  });

  // 5. Navigate to Inventory
  group('Inventory Module', () => {
    const pageRes = http.get(`${CONFIG.FRONTEND_URL}/inventory/products`, {
      tags: { type: 'page' },
    });
    metrics.pageLoadTime.add(pageRes.timings.duration);
    metrics.totalRequests.add(1);

    const productsRes = http.get(
      `${CONFIG.API_BASE_URL}/api/inventory/products?pageNumber=1&pageSize=20`,
      { headers: authHeaders, tags: { type: 'api' } }
    );
    metrics.apiResponseTime.add(productsRes.timings.duration);
    metrics.apiErrors.add(productsRes.status >= 400 ? 1 : 0);
    metrics.totalRequests.add(1);

    sleep(2);
  });

  // Think time
  sleep(Math.random() * 3 + 2);
  metrics.activeUsers.add(-1);
}

// ============================================
// SCENARIO: API User (Pure API calls)
// ============================================
export function apiUser(data) {
  metrics.activeUsers.add(1);

  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Code': CONFIG.TENANT_CODE,
  };

  // Login
  const loginRes = http.post(
    `${CONFIG.API_BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: CONFIG.TEST_EMAIL,
      password: CONFIG.TEST_PASSWORD,
    }),
    { headers, tags: { type: 'api' } }
  );

  metrics.loginTime.add(loginRes.timings.duration);
  metrics.totalRequests.add(1);

  if (loginRes.status !== 200) {
    metrics.loginErrors.add(1);
    metrics.activeUsers.add(-1);
    return;
  }

  let authToken;
  try {
    authToken = JSON.parse(loginRes.body).accessToken;
  } catch {
    metrics.activeUsers.add(-1);
    return;
  }

  const authHeaders = { ...headers, Authorization: `Bearer ${authToken}` };

  // Rapid API calls (simulating mobile app or integration)
  group('Rapid API Calls', () => {
    const endpoints = [
      '/api/auth/me',
      '/api/tenant/modules',
      '/api/crm/customers/paged?pageNumber=1&pageSize=10',
      '/api/inventory/products?pageNumber=1&pageSize=10',
      '/api/sales/orders?pageNumber=1&pageSize=10',
      '/api/purchase/suppliers',
    ];

    for (let i = 0; i < 3; i++) {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const res = http.get(`${CONFIG.API_BASE_URL}${endpoint}`, {
        headers: authHeaders,
        tags: { type: 'api' },
      });

      metrics.apiResponseTime.add(res.timings.duration);
      metrics.apiErrors.add(res.status >= 400 ? 1 : 0);
      metrics.totalRequests.add(1);

      sleep(0.2);
    }
  });

  sleep(1);
  metrics.activeUsers.add(-1);
}

// ============================================
// SCENARIO: Spike User (Sudden load)
// ============================================
export function spikeUser(data) {
  metrics.activeUsers.add(1);

  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Code': CONFIG.TENANT_CODE,
  };

  // Quick burst of requests
  const responses = http.batch([
    ['GET', `${CONFIG.FRONTEND_URL}`, null, {}],
    ['GET', `${CONFIG.FRONTEND_URL}/login`, null, {}],
    ['GET', `${CONFIG.API_BASE_URL}/health`, null, {}],
  ]);

  responses.forEach((r) => {
    metrics.totalRequests.add(1);
    if (r.timings) {
      metrics.pageLoadTime.add(r.timings.duration);
    }
  });

  sleep(0.5);
  metrics.activeUsers.add(-1);
}

// ============================================
// TEARDOWN
// ============================================
export function teardown(data) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Started:  ${data.startTime}`);
  console.log(`Ended:    ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════');
}

// ============================================
// SUMMARY HANDLER
// ============================================
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    testType: 'Full Stack Stress Test - 1000 Users',
    duration: data.state.testRunDurationMs,
    metrics: {
      // Requests
      totalRequests: data.metrics.total_requests?.values?.count || 0,
      httpReqFailed: data.metrics.http_req_failed?.values?.rate || 0,

      // API Performance
      apiAvgResponseTime: data.metrics.api_response_time?.values?.avg || 0,
      apiP95ResponseTime: data.metrics.api_response_time?.values['p(95)'] || 0,
      apiP99ResponseTime: data.metrics.api_response_time?.values['p(99)'] || 0,
      apiErrorRate: data.metrics.api_errors?.values?.rate || 0,

      // Page Performance
      pageAvgLoadTime: data.metrics.page_load_time?.values?.avg || 0,
      pageP95LoadTime: data.metrics.page_load_time?.values['p(95)'] || 0,
      pageErrorRate: data.metrics.page_errors?.values?.rate || 0,

      // Login Performance
      loginAvgTime: data.metrics.login_time?.values?.avg || 0,
      loginP95Time: data.metrics.login_time?.values['p(95)'] || 0,
      successfulLogins: data.metrics.successful_logins?.values?.count || 0,
      failedLogins: data.metrics.failed_logins?.values?.count || 0,
    },
    thresholds: Object.fromEntries(
      Object.entries(data.thresholds || {}).map(([k, v]) => [k, v.ok])
    ),
  };

  const report = generateReport(summary);

  return {
    'stress-tests/results/full-stack-result.json': JSON.stringify(summary, null, 2),
    'stress-tests/results/full-stack-report.txt': report,
    stdout: report,
  };
}

function generateReport(s) {
  const passedThresholds = Object.values(s.thresholds).filter(Boolean).length;
  const totalThresholds = Object.keys(s.thresholds).length;
  const status = passedThresholds === totalThresholds ? '✅ PASSED' : '❌ FAILED';

  return `
╔══════════════════════════════════════════════════════════════════════════════╗
║           FULL STACK STRESS TEST REPORT - 1000 CONCURRENT USERS              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Status: ${status.padEnd(68)}║
║  Duration: ${(s.duration / 1000 / 60).toFixed(1)} minutes                                                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                              REQUEST SUMMARY                                  ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Total Requests:        ${String(s.metrics.totalRequests).padStart(10)}                                        ║
║  Failed Request Rate:   ${String((s.metrics.httpReqFailed * 100).toFixed(2) + '%').padStart(10)}                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                             API PERFORMANCE                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Average Response:      ${String(Math.round(s.metrics.apiAvgResponseTime) + 'ms').padStart(10)}                                        ║
║  P95 Response:          ${String(Math.round(s.metrics.apiP95ResponseTime) + 'ms').padStart(10)}                                        ║
║  P99 Response:          ${String(Math.round(s.metrics.apiP99ResponseTime) + 'ms').padStart(10)}                                        ║
║  Error Rate:            ${String((s.metrics.apiErrorRate * 100).toFixed(2) + '%').padStart(10)}                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                            PAGE PERFORMANCE                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Average Load Time:     ${String(Math.round(s.metrics.pageAvgLoadTime) + 'ms').padStart(10)}                                        ║
║  P95 Load Time:         ${String(Math.round(s.metrics.pageP95LoadTime) + 'ms').padStart(10)}                                        ║
║  Error Rate:            ${String((s.metrics.pageErrorRate * 100).toFixed(2) + '%').padStart(10)}                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                           LOGIN PERFORMANCE                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Average Login Time:    ${String(Math.round(s.metrics.loginAvgTime) + 'ms').padStart(10)}                                        ║
║  P95 Login Time:        ${String(Math.round(s.metrics.loginP95Time) + 'ms').padStart(10)}                                        ║
║  Successful Logins:     ${String(s.metrics.successfulLogins).padStart(10)}                                        ║
║  Failed Logins:         ${String(s.metrics.failedLogins).padStart(10)}                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                              THRESHOLDS                                       ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Passed: ${passedThresholds}/${totalThresholds}                                                               ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
}
