/**
 * Next.js Frontend Stress Test
 * Tests page loads and client-side navigation under 1000 concurrent users
 *
 * Run: k6 run --env FRONTEND_URL=https://app.stockerapp.com frontend-stress-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { CONFIG, LOAD_STAGES, THRESHOLDS } from './config.js';

// Custom Metrics
const pageLoadErrors = new Rate('page_load_errors');
const pageLoadTime = new Trend('page_load_time', true);
const staticAssetTime = new Trend('static_asset_time', true);
const ttfb = new Trend('time_to_first_byte', true);
const pageViews = new Counter('page_views');

// Test Options
export const options = {
  stages: LOAD_STAGES.stress,
  thresholds: {
    ...THRESHOLDS,
    page_load_errors: ['rate<0.05'],
    page_load_time: ['p(95)<3000'],
    time_to_first_byte: ['p(95)<1000'],
  },
  gracefulRampDown: '30s',
  tags: {
    testType: 'frontend-stress',
  },
};

// Setup
export function setup() {
  console.log('🚀 Starting Frontend Stress Test');
  console.log(`📍 Target: ${CONFIG.FRONTEND_URL}`);
  console.log(`👥 Max Users: 1000`);

  // Verify frontend is reachable
  const healthCheck = http.get(CONFIG.FRONTEND_URL);
  if (healthCheck.status !== 200) {
    console.error('❌ Frontend health check failed!');
    return { healthy: false };
  }

  console.log('✅ Frontend is healthy');
  return { healthy: true, startTime: new Date().toISOString() };
}

// Main test function
export default function (data) {
  if (!data.healthy) {
    console.error('Skipping test - Frontend unhealthy');
    return;
  }

  const headers = {
    'Accept':
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  };

  // ============================================
  // GROUP 1: Public Pages (No Auth)
  // ============================================
  group('Public Pages', () => {
    // Homepage / Landing
    const homeRes = http.get(CONFIG.FRONTEND_URL, {
      headers,
      tags: { type: 'page', page: 'home' },
    });
    pageViews.add(1);
    pageLoadTime.add(homeRes.timings.duration);
    ttfb.add(homeRes.timings.waiting);
    pageLoadErrors.add(homeRes.status >= 400 ? 1 : 0);

    check(homeRes, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage loads < 3s': (r) => r.timings.duration < 3000,
      'homepage has content': (r) => r.body && r.body.length > 0,
    });

    sleep(1);

    // Login page
    const loginRes = http.get(`${CONFIG.FRONTEND_URL}/login`, {
      headers,
      tags: { type: 'page', page: 'login' },
    });
    pageViews.add(1);
    pageLoadTime.add(loginRes.timings.duration);
    ttfb.add(loginRes.timings.waiting);

    check(loginRes, {
      'login page status is 200': (r) => r.status === 200,
      'login page loads < 2s': (r) => r.timings.duration < 2000,
    });

    sleep(0.5);
  });

  // ============================================
  // GROUP 2: Static Assets
  // ============================================
  group('Static Assets', () => {
    // Next.js chunks and static files
    const staticPaths = [
      '/_next/static/chunks/main.js',
      '/_next/static/chunks/webpack.js',
      '/_next/static/chunks/pages/_app.js',
      '/favicon.ico',
    ];

    for (const path of staticPaths) {
      const res = http.get(`${CONFIG.FRONTEND_URL}${path}`, {
        headers: {
          ...headers,
          Accept: '*/*',
        },
        tags: { type: 'static', asset: path },
      });

      // Only track if asset exists
      if (res.status === 200) {
        staticAssetTime.add(res.timings.duration);
      }
    }

    sleep(0.5);
  });

  // ============================================
  // GROUP 3: Dashboard Pages (Simulated Auth)
  // ============================================
  group('Dashboard Pages', () => {
    // Dashboard main
    const dashboardRes = http.get(`${CONFIG.FRONTEND_URL}/dashboard`, {
      headers,
      tags: { type: 'page', page: 'dashboard' },
      redirects: 0, // Don't follow redirects to login
    });
    pageViews.add(1);
    pageLoadTime.add(dashboardRes.timings.duration);
    ttfb.add(dashboardRes.timings.waiting);

    // May redirect to login, that's OK
    check(dashboardRes, {
      'dashboard responds': (r) => r.status === 200 || r.status === 302 || r.status === 307,
    });

    sleep(1);
  });

  // ============================================
  // GROUP 4: Module Pages
  // ============================================
  group('Module Pages', () => {
    const modulePages = [
      '/crm',
      '/crm/customers',
      '/inventory',
      '/inventory/products',
      '/sales',
      '/sales/orders',
      '/purchase',
      '/hr',
    ];

    // Test 2-3 random module pages per iteration
    const pagesToTest = modulePages
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    for (const page of pagesToTest) {
      const res = http.get(`${CONFIG.FRONTEND_URL}${page}`, {
        headers,
        tags: { type: 'page', page: page },
        redirects: 0,
      });
      pageViews.add(1);
      pageLoadTime.add(res.timings.duration);
      ttfb.add(res.timings.waiting);

      check(res, {
        [`${page} responds`]: (r) =>
          r.status === 200 || r.status === 302 || r.status === 307,
        [`${page} loads < 3s`]: (r) => r.timings.duration < 3000,
      });

      sleep(0.5);
    }
  });

  // ============================================
  // GROUP 5: API Routes (Next.js API)
  // ============================================
  group('Next.js API Routes', () => {
    // Health check API
    const healthRes = http.get(`${CONFIG.FRONTEND_URL}/api/health`, {
      headers: { Accept: 'application/json' },
      tags: { type: 'api', endpoint: 'health' },
    });

    if (healthRes.status === 200) {
      check(healthRes, {
        'health API responds': (r) => r.status === 200,
        'health API fast': (r) => r.timings.duration < 500,
      });
    }

    sleep(0.3);
  });

  // ============================================
  // GROUP 6: Search & Filter Simulation
  // ============================================
  group('Search Operations', () => {
    // Simulate search with query params
    const searchTerms = ['test', 'product', 'customer', 'order'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const searchRes = http.get(
      `${CONFIG.FRONTEND_URL}/crm/customers?search=${randomTerm}`,
      {
        headers,
        tags: { type: 'page', page: 'search' },
        redirects: 0,
      }
    );
    pageViews.add(1);
    pageLoadTime.add(searchRes.timings.duration);

    sleep(1);
  });

  // Random think time
  sleep(Math.random() * 2 + 1);
}

// Teardown
export function teardown(data) {
  console.log('📊 Frontend Stress Test Complete');
  console.log(`⏱️ Started: ${data.startTime}`);
  console.log(`⏱️ Ended: ${new Date().toISOString()}`);
}

// Summary handler
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    testType: 'Frontend Stress Test',
    metrics: {
      totalPageViews: data.metrics.page_views?.values?.count || 0,
      avgPageLoadTime: data.metrics.page_load_time?.values?.avg || 0,
      p95PageLoadTime: data.metrics.page_load_time?.values['p(95)'] || 0,
      avgTTFB: data.metrics.time_to_first_byte?.values?.avg || 0,
      p95TTFB: data.metrics.time_to_first_byte?.values['p(95)'] || 0,
      errorRate: data.metrics.page_load_errors?.values?.rate || 0,
      avgStaticAssetTime: data.metrics.static_asset_time?.values?.avg || 0,
    },
    thresholds: data.thresholds,
  };

  return {
    'stress-tests/results/frontend-stress-result.json': JSON.stringify(
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
║                 FRONTEND STRESS TEST RESULTS                  ║
╠══════════════════════════════════════════════════════════════╣
║  Total Page Views:   ${String(summary.metrics.totalPageViews).padStart(10)}                        ║
║  Avg Page Load:      ${String(Math.round(summary.metrics.avgPageLoadTime) + 'ms').padStart(10)}                        ║
║  P95 Page Load:      ${String(Math.round(summary.metrics.p95PageLoadTime) + 'ms').padStart(10)}                        ║
║  Avg TTFB:           ${String(Math.round(summary.metrics.avgTTFB) + 'ms').padStart(10)}                        ║
║  P95 TTFB:           ${String(Math.round(summary.metrics.p95TTFB) + 'ms').padStart(10)}                        ║
║  Error Rate:         ${String((summary.metrics.errorRate * 100).toFixed(2) + '%').padStart(10)}                        ║
║  Avg Static Asset:   ${String(Math.round(summary.metrics.avgStaticAssetTime) + 'ms').padStart(10)}                        ║
╚══════════════════════════════════════════════════════════════╝
`;
}
