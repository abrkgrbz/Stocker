/**
 * Mock Authentication Service
 * For development and testing purposes
 * Replace with real API calls in production
 */

interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

// Mock users database
const mockUsers = [
  {
    id: '1',
    email: 'admin@stocker.com',
    password: 'Admin123!',
    name: 'Super Admin',
    role: 'super_admin' as const
  },
  {
    id: '2',
    email: 'user@stocker.com',
    password: 'User123!',
    name: 'Admin User',
    role: 'admin' as const
  }
];

// Mock token generation
const generateMockToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

export const mockAuthService = {
  /**
   * Mock login
   */
  login: async (email: string, password: string): Promise<{
    success: boolean;
    data?: {
      accessToken: string;
      user: MockUser;
    };
    message?: string;
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Return success response
    return {
      success: true,
      data: {
        accessToken: generateMockToken(user.id),
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    };
  },

  /**
   * Mock logout
   */
  logout: async (): Promise<{ success: boolean }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));
    return { success: true };
  },

  /**
   * Mock token refresh
   */
  refresh: async (token: string): Promise<{
    success: boolean;
    data?: {
      accessToken: string;
    };
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Extract user ID from token
    const userId = token.split('_')[2];

    if (!userId) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        accessToken: generateMockToken(userId)
      }
    };
  },

  /**
   * Mock get current user
   */
  me: async (token: string): Promise<{
    success: boolean;
    data?: MockUser;
  }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Extract user ID from token
    const userId = token.split('_')[2];
    const user = mockUsers.find(u => u.id === userId);

    if (!user) {
      return { success: false };
    }

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
};

/**
 * Mock API interceptor
 * Use this to intercept API calls and return mock data
 */
export const enableMockAuth = (isDevelopment: boolean = true) => {
  if (!isDevelopment) return;

  // Override fetch for auth endpoints
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();

    // Intercept auth endpoints
    if (url.includes('/api/master/auth/login')) {
      const body = JSON.parse(init?.body as string || '{}');
      const result = await mockAuthService.login(body.email, body.password);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.includes('/api/master/auth/logout')) {
      const result = await mockAuthService.logout();
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.includes('/api/master/auth/me')) {
      const token = init?.headers?.['Authorization']?.replace('Bearer ', '') || '';
      const result = await mockAuthService.me(token);
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Pass through to real fetch for other endpoints
    return originalFetch(input, init);
  };
};

// Export mock credentials for easy testing
export const mockCredentials = {
  superAdmin: {
    email: 'admin@stocker.com',
    password: 'Admin123!'
  },
  admin: {
    email: 'user@stocker.com',
    password: 'User123!'
  }
};