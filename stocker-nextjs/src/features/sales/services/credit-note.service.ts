// =====================================
// CREDIT NOTE SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  CreditNoteDto,
  CreditNoteListDto,
  CreditNoteStatisticsDto,
  CreditNoteQueryParams,
  CreateCreditNoteCommand,
  CreateCreditNoteFromReturnCommand,
  UpdateCreditNoteCommand,
  ApplyCreditNoteCommand,
  AddCreditNoteItemCommand,
  UpdateCreditNoteItemCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/credit-notes';

export const creditNoteService = {
  /**
   * Get all credit notes with pagination and filtering
   */
  async getCreditNotes(params?: CreditNoteQueryParams): Promise<PagedResult<CreditNoteListDto>> {
    return ApiService.get<PagedResult<CreditNoteListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single credit note by ID
   */
  async getCreditNote(id: string): Promise<CreditNoteDto> {
    return ApiService.get<CreditNoteDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get credit notes by customer
   */
  async getCreditNotesByCustomer(customerId: string): Promise<CreditNoteListDto[]> {
    return ApiService.get<CreditNoteListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },

  /**
   * Get credit note statistics
   */
  async getCreditNoteStatistics(): Promise<CreditNoteStatisticsDto> {
    return ApiService.get<CreditNoteStatisticsDto>(`${BASE_URL}/statistics`);
  },

  /**
   * Create a new credit note
   */
  async createCreditNote(data: CreateCreditNoteCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(BASE_URL, data);
  },

  /**
   * Create credit note from sales return
   */
  async createCreditNoteFromReturn(data: CreateCreditNoteFromReturnCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`${BASE_URL}/from-return`, data);
  },

  /**
   * Update a credit note
   */
  async updateCreditNote(id: string, data: UpdateCreditNoteCommand): Promise<CreditNoteDto> {
    return ApiService.put<CreditNoteDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a credit note
   */
  async deleteCreditNote(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Approve a credit note
   */
  async approveCreditNote(id: string, notes?: string): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`${BASE_URL}/${id}/approve`, { notes });
  },

  /**
   * Apply a credit note to an invoice
   */
  async applyCreditNote(id: string, data: ApplyCreditNoteCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`${BASE_URL}/${id}/apply`, data);
  },

  /**
   * Void a credit note
   */
  async voidCreditNote(id: string, reason: string): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`${BASE_URL}/${id}/void`, { reason });
  },

  /**
   * Add item to credit note
   */
  async addCreditNoteItem(id: string, data: AddCreditNoteItemCommand): Promise<CreditNoteDto> {
    return ApiService.post<CreditNoteDto>(`${BASE_URL}/${id}/items`, data);
  },

  /**
   * Update credit note item
   */
  async updateCreditNoteItem(id: string, itemId: string, data: UpdateCreditNoteItemCommand): Promise<CreditNoteDto> {
    return ApiService.put<CreditNoteDto>(`${BASE_URL}/${id}/items/${itemId}`, data);
  },

  /**
   * Remove item from credit note
   */
  async removeCreditNoteItem(id: string, itemId: string): Promise<CreditNoteDto> {
    return ApiService.delete<CreditNoteDto>(`${BASE_URL}/${id}/items/${itemId}`);
  },
};
