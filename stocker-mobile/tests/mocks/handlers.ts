import { http, HttpResponse } from 'msw';
import { mockCustomers, mockProducts, mockUser, mockTenant } from './data';

const API_URL = 'https://api.stoocker.app/api';

export const handlers = [
  // ============================================
  // Auth Handlers
  // ============================================

  http.post(`${API_URL}/public/check-email`, async ({ request }) => {
    const body = await request.json() as { email: string };
    return HttpResponse.json({
      exists: body.email === 'test@test.com',
      tenants: body.email === 'test@test.com' ? [mockTenant] : [],
    });
  }),

  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; tenantCode: string };

    if (body.email === 'test@test.com' && body.password === 'password123') {
      return HttpResponse.json({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
        tenant: mockTenant,
        expiresIn: 3600,
      });
    }

    return HttpResponse.json(
      { message: 'Geçersiz kullanıcı adı veya şifre' },
      { status: 401 }
    );
  }),

  http.post(`${API_URL}/auth/refresh`, async () => {
    return HttpResponse.json({
      accessToken: 'mock-new-access-token',
      refreshToken: 'mock-new-refresh-token',
      expiresIn: 3600,
    });
  }),

  http.post(`${API_URL}/auth/logout`, async () => {
    return HttpResponse.json({ success: true });
  }),

  // ============================================
  // CRM - Customers Handlers
  // ============================================

  http.get(`${API_URL}/crm/customers/paged`, async ({ request }) => {
    const url = new URL(request.url);
    const pageNumber = parseInt(url.searchParams.get('pageNumber') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const searchTerm = url.searchParams.get('searchTerm') || '';

    let filteredCustomers = mockCustomers;

    if (searchTerm) {
      filteredCustomers = mockCustomers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const start = (pageNumber - 1) * pageSize;
    const items = filteredCustomers.slice(start, start + pageSize);

    return HttpResponse.json({
      items,
      pageNumber,
      pageSize,
      totalCount: filteredCustomers.length,
      totalPages: Math.ceil(filteredCustomers.length / pageSize),
    });
  }),

  http.get(`${API_URL}/crm/customers/:id`, async ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);

    if (!customer) {
      return HttpResponse.json(
        { message: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(customer);
  }),

  http.post(`${API_URL}/crm/customers`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    const newCustomer = {
      id: `cust-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  http.put(`${API_URL}/crm/customers/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, any>;
    const existingCustomer = mockCustomers.find(c => c.id === params.id);

    if (!existingCustomer) {
      return HttpResponse.json(
        { message: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    const updatedCustomer = {
      ...existingCustomer,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updatedCustomer);
  }),

  http.delete(`${API_URL}/crm/customers/:id`, async ({ params }) => {
    const customer = mockCustomers.find(c => c.id === params.id);

    if (!customer) {
      return HttpResponse.json(
        { message: 'Müşteri bulunamadı' },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_URL}/crm/customers/search`, async ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    const results = mockCustomers.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10);

    return HttpResponse.json(results);
  }),

  // ============================================
  // Inventory - Products Handlers
  // ============================================

  http.get(`${API_URL}/inventory/products`, async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search') || '';

    let filteredProducts = mockProducts;

    if (search) {
      filteredProducts = mockProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
      );
    }

    const start = (page - 1) * pageSize;
    const items = filteredProducts.slice(start, start + pageSize);

    return HttpResponse.json({
      items,
      page,
      pageSize,
      totalCount: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / pageSize),
    });
  }),

  http.get(`${API_URL}/inventory/products/:id`, async ({ params }) => {
    const product = mockProducts.find(p => p.id === params.id);

    if (!product) {
      return HttpResponse.json(
        { message: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(product);
  }),

  http.get(`${API_URL}/inventory/products/barcode/:barcode`, async ({ params }) => {
    const product = mockProducts.find(p => p.barcode === params.barcode);

    if (!product) {
      return HttpResponse.json(
        { message: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(product);
  }),

  http.post(`${API_URL}/inventory/products`, async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    const newProduct = {
      id: `prod-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newProduct, { status: 201 });
  }),

  http.put(`${API_URL}/inventory/products/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, any>;
    const existingProduct = mockProducts.find(p => p.id === params.id);

    if (!existingProduct) {
      return HttpResponse.json(
        { message: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    const updatedProduct = {
      ...existingProduct,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(updatedProduct);
  }),

  http.delete(`${API_URL}/inventory/products/:id`, async ({ params }) => {
    const product = mockProducts.find(p => p.id === params.id);

    if (!product) {
      return HttpResponse.json(
        { message: 'Ürün bulunamadı' },
        { status: 404 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_URL}/inventory/products/low-stock`, async () => {
    const lowStockProducts = mockProducts.filter(p =>
      p.stockQuantity !== undefined &&
      p.minStockLevel !== undefined &&
      p.stockQuantity <= p.minStockLevel
    );
    return HttpResponse.json(lowStockProducts);
  }),

  // ============================================
  // Inventory - KPIs
  // ============================================

  http.get(`${API_URL}/inventory/kpis`, async () => {
    return HttpResponse.json({
      totalProducts: mockProducts.length,
      totalValue: mockProducts.reduce((sum, p) => sum + (p.price || 0) * (p.stockQuantity || 0), 0),
      lowStockCount: mockProducts.filter(p =>
        p.stockQuantity !== undefined &&
        p.minStockLevel !== undefined &&
        p.stockQuantity <= p.minStockLevel
      ).length,
      outOfStockCount: mockProducts.filter(p => (p.stockQuantity || 0) === 0).length,
      averageStockLevel: mockProducts.reduce((sum, p) => sum + (p.stockQuantity || 0), 0) / mockProducts.length,
    });
  }),

  // ============================================
  // Error simulation handlers (for testing)
  // ============================================

  http.get(`${API_URL}/test/error-500`, async () => {
    return HttpResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }),

  http.get(`${API_URL}/test/error-network`, async () => {
    return HttpResponse.error();
  }),

  http.get(`${API_URL}/test/timeout`, async () => {
    await new Promise(resolve => setTimeout(resolve, 60000));
    return HttpResponse.json({ success: true });
  }),
];

// Handler utilities for tests
export const createErrorHandler = (path: string, status: number, message: string) => {
  return http.get(`${API_URL}${path}`, () => {
    return HttpResponse.json({ message }, { status });
  });
};

export const createSuccessHandler = <T>(path: string, data: T) => {
  return http.get(`${API_URL}${path}`, () => {
    return HttpResponse.json(data);
  });
};
