// =====================================
// PRICE LIST HOOKS
// TanStack Query v5 - Feature-Based Architecture
// =====================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { priceListService } from '../services/pricelist.service';
import { salesKeys } from './keys';
import { queryOptions } from '@/lib/api/query-options';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import type {
  PriceListDto,
  PriceListListDto,
  CreatePriceListDto,
  AddPriceListItemDto,
  PriceListQueryParams,
  PagedResult,
} from '../types';

// =====================================
// QUERY HOOKS
// =====================================

/**
 * Hook to fetch paginated price lists
 */
export function usePriceLists(params?: PriceListQueryParams) {
  return useQuery<PagedResult<PriceListListDto>>({
    queryKey: salesKeys.priceLists.list(params),
    queryFn: () => priceListService.getPriceLists(params),
    ...queryOptions.list(),
  });
}

/**
 * Hook to fetch a single price list by ID
 */
export function usePriceList(id: string) {
  return useQuery<PriceListDto>({
    queryKey: salesKeys.priceLists.detail(id),
    queryFn: () => priceListService.getPriceList(id),
    ...queryOptions.detail({ enabled: !!id }),
  });
}

/**
 * Hook to fetch price list by code
 */
export function usePriceListByCode(code: string) {
  return useQuery<PriceListDto>({
    queryKey: salesKeys.priceLists.byCode(code),
    queryFn: () => priceListService.getPriceListByCode(code),
    ...queryOptions.detail({ enabled: !!code }),
  });
}

/**
 * Hook to fetch active price lists
 */
export function useActivePriceLists() {
  return useQuery<PriceListListDto[]>({
    queryKey: salesKeys.priceLists.active(),
    queryFn: () => priceListService.getActivePriceLists(),
    ...queryOptions.list(),
  });
}

// =====================================
// MUTATION HOOKS
// =====================================

/**
 * Hook to create a new price list
 */
export function useCreatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePriceListDto) => priceListService.createPriceList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      showSuccess('Fiyat listesi başarıyla oluşturuldu');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi oluşturulamadı');
    },
  });
}

/**
 * Hook to add an item to a price list
 */
export function useAddPriceListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddPriceListItemDto }) =>
      priceListService.addItem(id, data),
    onSuccess: (updatedPriceList) => {
      queryClient.setQueryData(salesKeys.priceLists.detail(updatedPriceList.id), updatedPriceList);
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      showSuccess('Fiyat listesine kalem eklendi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesine kalem eklenemedi');
    },
  });
}

/**
 * Hook to remove an item from a price list
 */
export function useRemovePriceListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      priceListService.removeItem(id, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      showSuccess('Kalem fiyat listesinden çıkarıldı');
    },
    onError: (error) => {
      showApiError(error, 'Kalem fiyat listesinden çıkarılamadı');
    },
  });
}

/**
 * Hook to update an item's price in a price list
 */
export function useUpdatePriceListItemPrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, itemId, unitPrice }: { id: string; itemId: string; unitPrice: number }) =>
      priceListService.updateItemPrice(id, itemId, unitPrice),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      showSuccess('Kalem fiyatı güncellendi');
    },
    onError: (error) => {
      showApiError(error, 'Kalem fiyatı güncellenemedi');
    },
  });
}

/**
 * Hook to assign a customer to a price list
 */
export function useAssignCustomerToPriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { customerId: string; customerName: string } }) =>
      priceListService.assignCustomer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      showSuccess('Müşteri fiyat listesine atandı');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri fiyat listesine atanamadı');
    },
  });
}

/**
 * Hook to remove a customer from a price list
 */
export function useRemoveCustomerFromPriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, customerId }: { id: string; customerId: string }) =>
      priceListService.removeCustomer(id, customerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      showSuccess('Müşteri fiyat listesinden çıkarıldı');
    },
    onError: (error) => {
      showApiError(error, 'Müşteri fiyat listesinden çıkarılamadı');
    },
  });
}

// =====================================
// WORKFLOW HOOKS
// =====================================

/**
 * Hook to activate a price list
 */
export function useActivatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => priceListService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.active() });
      showSuccess('Fiyat listesi aktifleştirildi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi aktifleştirilemedi');
    },
  });
}

/**
 * Hook to deactivate a price list
 */
export function useDeactivatePriceList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => priceListService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.lists() });
      queryClient.invalidateQueries({ queryKey: salesKeys.priceLists.active() });
      showSuccess('Fiyat listesi deaktif edildi');
    },
    onError: (error) => {
      showApiError(error, 'Fiyat listesi deaktif edilemedi');
    },
  });
}
