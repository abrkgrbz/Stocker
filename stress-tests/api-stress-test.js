/**
 * API Backend Stress Test
 * Tests .NET API under 1000 concurrent users
 *
 * Run: k6 run --env API_URL=https://api.stockerapp.com api-stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { CONFIG, LOAD_STAGES, THRESHOLDS } from './config.js';

// Custom Metrics
const apiErrors = new Rate('api_errors');
const apiDuration = new Trend('api_duration', true);
const loginSuccess = new Rate('login_success');
const requestCount = new Counter('total_requests');

// Test Options
export const options = {
  stages: LOAD_STAGES.stress, // Use 'smoke', 'load', 'stress', 'spike', or 'soak'
  thresholds: {
    ...THRESHOLDS,
    api_errors: ['rate<0.05'],
    login_success: ['rate>0.95'],
  },
  // Graceful stop
  gracefulRampDown: '30s',
  // Tags for filtering
  tags: {
    testType: 'api-stress',
  },
};

// Setup - runs once before test
export function setup() {
  console.log('🚀 Starting API Stress Test');
  console.log(`📍 Target: ${CONFIG.API_BASE_URL}`);
  console.log(`👥 Max Users: 1000`);

  // Verify API is reachable
  const healthCheck = http.get(`${CONFIG.API_BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.error('❌ API health check failed!');
    return { healthy: false };
  }

  console.log('✅ API is healthy');
  return { healthy: true, startTime: new Date().toISOString() };
}

// Main test function - runs for each virtual user
export default function (data) {
  if (!data.healthy) {
    console.error('Skipping test - API unhealthy');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Code': CONFIG.TENANT_CODE,
  };

  let authToken = null;

  // ============================================
  // GROUP 1: Authentication Flow
  // ============================================
  group('Authentication', () => {
    // Login
    const loginPayload = JSON.stringify({
      email: CONFIG.TEST_EMAIL,
      password: CONFIG.TEST_PASSWORD,
    });

    const loginRes = http.post(
      `${CONFIG.API_BASE_URL}/api/auth/login`,
      loginPayload,
      {
        headers,
        tags: { type: 'api', endpoint: 'login' },
      }
    );

    requestCount.add(1);
    apiDuration.add(loginRes.timings.duration);

    const loginOk = check(loginRes, {
      'login status is 200': (r) => r.status === 200,
      'login has token': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.accessToken || body.token;
        } catch {
          return false;
        }
      },
    });

    loginSuccess.add(loginOk ? 1 : 0);
    apiErrors.add(loginRes.status >= 400 ? 1 : 0);

    if (loginOk) {
      try {
        const body = JSON.parse(loginRes.body);
        authToken = body.accessToken || body.token;
      } catch (e) {
        // Token extraction failed
      }
    }

    sleep(0.5);
  });

  // Skip remaining tests if login failed
  if (!authToken) {
    sleep(1);
    return;
  }

  const authHeaders = {
    ...headers,
    Authorization: `Bearer ${authToken}`,
  };

  // ============================================
  // GROUP 2: Dashboard APIs (High frequency)
  // ============================================
  group('Dashboard APIs', () => {
    // Get user modules
    const modulesRes = http.get(`${CONFIG.API_BASE_URL}/api/tenant/modules`, {
      headers: authHeaders,
      tags: { type: 'api', endpoint: 'modules' },
    });
    requestCount.add(1);
    apiDuration.add(modulesRes.timings.duration);
    apiErrors.add(modulesRes.status >= 400 ? 1 : 0);

    check(modulesRes, {
      'modules status is 200': (r) => r.status === 200,
    });

    sleep(0.3);

    // Get current user
    const meRes = http.get(`${CONFIG.API_BASE_URL}/api/auth/me`, {
      headers: authHeaders,
      tags: { type: 'api', endpoint: 'me' },
    });
    requestCount.add(1);
    apiDuration.add(meRes.timings.duration);
    apiErrors.add(meRes.status >= 400 ? 1 : 0);

    sleep(0.3);
  });

  // ============================================
  // GROUP 3: CRM Module APIs
  // ============================================
  group('CRM APIs', () => {
    // Get customers list
    const customersRes = http.get(
      `${CONFIG.API_BASE_URL}/api/crm/customers/paged?pageNumber=1&pageSize=20`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'customers' },
      }
    );
    requestCount.add(1);
    apiDuration.add(customersRes.timings.duration);
    apiErrors.add(customersRes.status >= 400 ? 1 : 0);

    check(customersRes, {
      'customers status is 200 or 404': (r) =>
        r.status === 200 || r.status === 404,
      'customers response time < 2s': (r) => r.timings.duration < 2000,
    });

    sleep(0.5);

    // Get contacts
    const contactsRes = http.get(`${CONFIG.API_BASE_URL}/api/crm/contacts`, {
      headers: authHeaders,
      tags: { type: 'api', endpoint: 'contacts' },
    });
    requestCount.add(1);
    apiDuration.add(contactsRes.timings.duration);

    sleep(0.3);
  });

  // ============================================
  // GROUP 4: Inventory Module APIs
  // ============================================
  group('Inventory APIs', () => {
    // Get products
    const productsRes = http.get(
      `${CONFIG.API_BASE_URL}/api/inventory/products?pageNumber=1&pageSize=20`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'products' },
      }
    );
    requestCount.add(1);
    apiDuration.add(productsRes.timings.duration);
    apiErrors.add(productsRes.status >= 400 ? 1 : 0);

    check(productsRes, {
      'products status OK': (r) => r.status === 200 || r.status === 404,
    });

    sleep(0.5);

    // Get stock levels
    const stockRes = http.get(
      `${CONFIG.API_BASE_URL}/api/inventory/stock-levels`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'stock' },
      }
    );
    requestCount.add(1);
    apiDuration.add(stockRes.timings.duration);

    sleep(0.3);
  });

  // ============================================
  // GROUP 5: Sales Module APIs
  // ============================================
  group('Sales APIs', () => {
    // Get orders
    const ordersRes = http.get(
      `${CONFIG.API_BASE_URL}/api/sales/orders?pageNumber=1&pageSize=10`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'orders' },
      }
    );
    requestCount.add(1);
    apiDuration.add(ordersRes.timings.duration);

    sleep(0.5);

    // Get invoices
    const invoicesRes = http.get(
      `${CONFIG.API_BASE_URL}/api/sales/invoices?pageNumber=1&pageSize=10`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'invoices' },
      }
    );
    requestCount.add(1);
    apiDuration.add(invoicesRes.timings.duration);

    sleep(0.3);
  });

  // ============================================
  // GROUP 6: Purchase Module APIs
  // ============================================
  group('Purchase APIs', () => {
    // Get suppliers
    const suppliersRes = http.get(
      `${CONFIG.API_BASE_URL}/api/purchase/suppliers`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'suppliers' },
      }
    );
    requestCount.add(1);
    apiDuration.add(suppliersRes.timings.duration);

    sleep(0.5);

    // Get purchase orders
    const poRes = http.get(
      `${CONFIG.API_BASE_URL}/api/purchase/orders?pageNumber=1&pageSize=10`,
      {
        headers: authHeaders,
        tags: { type: 'api', endpoint: 'purchase-orders' },
      }
    );
    requestCount.add(1);
    apiDuration.add(poRes.timings.duration);

    sleep(0.3);
  });

  // Random think time between iterations
  sleep(Math.random() * 2 + 1);
}

// Teardown - runs once after test
export function teardown(data) {
  console.log('📊 API Stress Test Complete');
  console.log(`⏱️ Started: ${data.startTime}`);
  console.log(`⏱️ Ended: ${new Date().toISOString()}`);
}

// Summary handler for custom reporting
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    testType: 'API Stress Test',
    metrics: {
      totalRequests: data.metrics.total_requests?.values?.count || 0,
      avgResponseTime: data.metrics.api_duration?.values?.avg || 0,
      p95ResponseTime: data.metrics.api_duration?.values['p(95)'] || 0,
      p99ResponseTime: data.metrics.api_duration?.values['p(99)'] || 0,
      errorRate: data.metrics.api_errors?.values?.rate || 0,
      loginSuccessRate: data.metrics.login_success?.values?.rate || 0,
    },
    thresholds: data.thresholds,
  };

  return {
    'stress-tests/results/api-stress-result.json': JSON.stringify(
      summary,
      null,
      2
    ),
    stdout: generateTextSummary(summary),
  };
}

function generateTextSummary(summary) {
  return `
╔══════════════════════════════════════════════════════════════╗
║                    API STRESS TEST RESULTS                    ║
╠══════════════════════════════════════════════════════════════╣
║  Total Requests:     ${String(summary.metrics.totalRequests).padStart(10)}                        ║
║  Avg Response Time:  ${String(Math.round(summary.metrics.avgResponseTime) + 'ms').padStart(10)}                        ║
║  P95 Response Time:  ${String(Math.round(summary.metrics.p95ResponseTime) + 'ms').padStart(10)}                        ║
║  P99 Response Time:  ${String(Math.round(summary.metrics.p99ResponseTime) + 'ms').padStart(10)}                        ║
║  Error Rate:         ${String((summary.metrics.errorRate * 100).toFixed(2) + '%').padStart(10)}                        ║
║  Login Success:      ${String((summary.metrics.loginSuccessRate * 100).toFixed(2) + '%').padStart(10)}                        ║
╚══════════════════════════════════════════════════════════════╝
`;
}
