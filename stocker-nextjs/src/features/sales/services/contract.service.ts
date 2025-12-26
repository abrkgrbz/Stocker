// =====================================
// CUSTOMER CONTRACT SERVICE
// Feature-Based Architecture
// =====================================

import { ApiService } from '@/lib/api/api-service';
import type {
  CustomerContractDto,
  CustomerContractListDto,
  CustomerContractQueryParams,
  CreateCustomerContractCommand,
  UpdateCustomerContractCommand,
  TerminateContractCommand,
  UpdateCreditLimitCommand,
  ConfigureSLACommand,
  AddPriceAgreementCommand,
  AddPaymentTermCommand,
  AddCommitmentCommand,
  PagedResult,
} from '../types';

const BASE_URL = '/sales/customercontracts';

export const contractService = {
  /**
   * Get all customer contracts with pagination and filtering
   */
  async getCustomerContracts(params?: CustomerContractQueryParams): Promise<PagedResult<CustomerContractListDto>> {
    return ApiService.get<PagedResult<CustomerContractListDto>>(BASE_URL, { params });
  },

  /**
   * Get a single customer contract by ID
   */
  async getCustomerContract(id: string): Promise<CustomerContractDto> {
    return ApiService.get<CustomerContractDto>(`${BASE_URL}/${id}`);
  },

  /**
   * Get customer contract by number
   */
  async getCustomerContractByNumber(contractNumber: string): Promise<CustomerContractDto> {
    return ApiService.get<CustomerContractDto>(`${BASE_URL}/by-number/${contractNumber}`);
  },

  /**
   * Get contracts by customer
   */
  async getCustomerContractsByCustomer(customerId: string): Promise<CustomerContractListDto[]> {
    return ApiService.get<CustomerContractListDto[]>(`${BASE_URL}/by-customer/${customerId}`);
  },

  /**
   * Get active contracts by customer
   */
  async getActiveContractsByCustomer(customerId: string): Promise<CustomerContractListDto[]> {
    return ApiService.get<CustomerContractListDto[]>(`${BASE_URL}/by-customer/${customerId}/active`);
  },

  /**
   * Create a new customer contract
   */
  async createCustomerContract(data: CreateCustomerContractCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(BASE_URL, data);
  },

  /**
   * Update a customer contract
   */
  async updateCustomerContract(id: string, data: UpdateCustomerContractCommand): Promise<CustomerContractDto> {
    return ApiService.put<CustomerContractDto>(`${BASE_URL}/${id}`, data);
  },

  /**
   * Delete a customer contract
   */
  async deleteCustomerContract(id: string): Promise<void> {
    return ApiService.delete<void>(`${BASE_URL}/${id}`);
  },

  /**
   * Activate a contract
   */
  async activateContract(id: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/activate`);
  },

  /**
   * Suspend a contract
   */
  async suspendContract(id: string, reason: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/suspend`, { reason });
  },

  /**
   * Terminate a contract
   */
  async terminateContract(id: string, data: TerminateContractCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/terminate`, data);
  },

  /**
   * Renew a contract
   */
  async renewContract(id: string, extensionMonths?: number): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/renew`, { extensionMonths });
  },

  /**
   * Block a contract
   */
  async blockContract(id: string, reason: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/block`, { reason });
  },

  /**
   * Unblock a contract
   */
  async unblockContract(id: string, notes?: string): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/unblock`, { notes });
  },

  /**
   * Update credit limit
   */
  async updateCreditLimit(id: string, data: UpdateCreditLimitCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/credit-limit`, data);
  },

  /**
   * Configure SLA
   */
  async configureSLA(id: string, data: ConfigureSLACommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/sla`, data);
  },

  /**
   * Add price agreement
   */
  async addPriceAgreement(id: string, data: AddPriceAgreementCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/price-agreements`, data);
  },

  /**
   * Add payment term
   */
  async addPaymentTerm(id: string, data: AddPaymentTermCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/payment-terms`, data);
  },

  /**
   * Add commitment
   */
  async addCommitment(id: string, data: AddCommitmentCommand): Promise<CustomerContractDto> {
    return ApiService.post<CustomerContractDto>(`${BASE_URL}/${id}/commitments`, data);
  },
};
