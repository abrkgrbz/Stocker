import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useCustomers, useCustomer, useCreateCustomer } from '@/lib/api/hooks/useCRM';
import { mockCustomers, generateMockCustomer } from '../../../mocks/data';

// Mock axios
jest.mock('@/lib/axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import api from '@/lib/axios';

// Helper to create wrapper with fresh QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCRM hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useCustomers', () => {
    it('should fetch customers successfully', async () => {
      const mockResponse = {
        items: mockCustomers,
        pageNumber: 1,
        pageSize: 20,
        totalCount: mockCustomers.length,
        totalPages: 1,
      };

      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useCustomers(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify data
      expect(result.current.data).toBeDefined();
      expect(result.current.data?.items).toHaveLength(mockCustomers.length);
      expect(result.current.data?.items[0].name).toBe(mockCustomers[0].name);
    });

    it('should handle search parameter', async () => {
      const filteredCustomers = mockCustomers.filter((c) =>
        c.name.toLowerCase().includes('acme')
      );

      const mockResponse = {
        items: filteredCustomers,
        pageNumber: 1,
        pageSize: 20,
        totalCount: filteredCustomers.length,
        totalPages: 1,
      };

      (api.get as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useCustomers({ search: 'Acme' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.items.length).toBe(1);
      expect(result.current.data?.items[0].name).toBe('Acme Şirketi');
    });

    it('should handle API errors', async () => {
      (api.get as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

      const { result } = renderHook(() => useCustomers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe('useCustomer', () => {
    it('should fetch single customer by id', async () => {
      const customer = mockCustomers[0];
      (api.get as jest.Mock).mockResolvedValueOnce({ data: customer });

      const { result } = renderHook(() => useCustomer(customer.id), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.id).toBe(customer.id);
      expect(result.current.data?.name).toBe(customer.name);
    });

    it('should handle not found error', async () => {
      (api.get as jest.Mock).mockRejectedValueOnce({
        response: { status: 404, data: { message: 'Not found' } },
      });

      const { result } = renderHook(() => useCustomer('non-existent-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useCustomer(''), {
        wrapper: createWrapper(),
      });

      // Should not be loading or have data
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useCreateCustomer', () => {
    it('should create customer successfully', async () => {
      const newCustomer = generateMockCustomer({
        name: 'New Test Customer',
        email: 'new@customer.com',
      });

      (api.post as jest.Mock).mockResolvedValueOnce({
        data: { ...newCustomer, id: 'new-customer-id' },
      });

      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(),
      });

      // Trigger mutation
      result.current.mutate({
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        type: 'Individual',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('New Test Customer');
      expect(result.current.data?.id).toBe('new-customer-id');
    });

    it('should handle creation error', async () => {
      (api.post as jest.Mock).mockRejectedValueOnce({
        response: { status: 400, data: { message: 'Validation error' } },
      });

      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        name: '',
        email: 'invalid',
        type: 'Individual',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
