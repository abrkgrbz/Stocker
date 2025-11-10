import { ApiService } from '../api-service';
import type {
  // Statistics
  ActivityStatisticsDto,
  LeadStatisticsDto,
  DealStatisticsDto,
  ConversionRatesDto,
  PipelineStatisticsDto,
  CampaignRoiDto,
  CampaignStatisticsDto,
  // Opportunities
  OpportunityDto,
  OpportunityProductDto,
  PipelineReportDto,
  ForecastDto,
  CreateOpportunityCommand,
  UpdateOpportunityCommand,
  OpportunityFilters,
  // Documents
  DocumentDto,
  UploadDocumentResponse,
  UpdateDocumentRequest,
  DownloadUrlResponse,
  DocumentCategory,
  AccessLevel,
  // Customer Tags
  CustomerTagDto,
  AddCustomerTagCommand,
  // Campaign Members
  CampaignMemberDto,
  AddCampaignMemberCommand,
  BulkImportResultDto,
  BulkImportCampaignMembersCommand,
  // Segment Members
  CustomerSegmentMemberDto,
  AddSegmentMemberCommand,
  UpdateSegmentCriteriaCommand,
  // Commands
  CompleteActivityCommand,
  CancelActivityCommand,
  RescheduleActivityCommand,
  QualifyLeadCommand,
  DisqualifyLeadCommand,
  AssignLeadCommand,
  UpdateLeadScoreCommand,
  MoveDealStageCommand,
  CloseDealWonCommand,
  CloseDealLostCommand,
  MoveOpportunityStageCommand,
  WinOpportunityCommand,
  LoseOpportunityCommand,
  AddDealProductCommand,
  DealProductDto,
  ReorderPipelineStagesCommand,
  ScoringCriteria,
  ActivityFilters,
  Guid,
  DateTime,
} from './crm.types';

// =====================================
// TYPES - Based on Backend API
// =====================================

export interface Customer {
  id: number;
  companyName: string;
  contactPerson: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  customerType: 'Individual' | 'Corporate';
  status: 'Active' | 'Inactive' | 'Potential';
  creditLimit: number;
  taxId: string | null;
  paymentTerms: string | null;
  notes: string | null;
  totalPurchases: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  source: 'Website' | 'Referral' | 'SocialMedia' | 'Event' | 'Other';
  status: 'New' | 'Contacted' | 'Qualified' | 'Unqualified' | 'Converted';
  score: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string; // Guid from backend
  title: string;
  customerId: string; // Guid from backend
  customerName?: string;
  pipelineId: string; // Guid from backend
  pipelineName?: string;
  stageId: string; // Guid from backend
  stageName?: string;
  amount: number;
  probability: number;
  expectedCloseDate: string | null;
  actualCloseDate: string | null;
  status: 'Open' | 'Won' | 'Lost';
  priority?: 'Low' | 'Medium' | 'High';
  description: string | null;
  assignedToId?: number;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: number;
  title: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
  description: string | null;
  startTime: string;
  endTime: string | null;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  customerId: number | null;
  customerName?: string | null;
  leadId: number | null;
  leadName?: string | null;
  contactId?: number | null;
  contactName?: string | null;
  opportunityId?: number | null;
  opportunityName?: string | null;
  dealId: number | null;
  dealTitle?: string | null;
  ownerId: number;
  ownerName?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string | null;
  type: 'Sales' | 'Lead' | 'Deal' | 'Custom';
  isActive: boolean;
  isDefault: boolean;
  stages: PipelineStage[];
  opportunityCount: number;
  dealCount: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  description: string | null;
  order: number;
  probability: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
  itemCount: number;
  totalValue: number;
}

export interface CustomerSegment {
  id: string;
  tenantId: string;
  name: string;
  description: string | null;
  type: 'Static' | 'Dynamic';
  criteria: string | null;
  color: string;
  isActive: boolean;
  memberCount: number;
  createdBy: string;
  lastModifiedBy: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  type: 'Email' | 'SocialMedia' | 'Webinar' | 'Event' | 'Conference' | 'Advertisement' | 'Banner' | 'Telemarketing' | 'PublicRelations';
  status: 'Planned' | 'InProgress' | 'Completed' | 'Aborted' | 'OnHold';
  startDate: string;
  endDate: string;
  budgetedCost: number;
  actualCost: number;
  expectedRevenue: number;
  actualRevenue: number;
  targetAudience: string | null;
  targetLeads: number;
  actualLeads: number;
  convertedLeads: number;
  ownerId: string | null;
  ownerName: string | null;
  conversionRate: number;
  roi: number;
  memberCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CustomerFilters {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  customerType?: 'Individual' | 'Corporate';
  status?: 'Active' | 'Inactive' | 'Potential';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomerDto {
  companyName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  customerType: 'Individual' | 'Corporate';
  creditLimit?: number;
  taxId?: string;
  paymentTerms?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// =====================================
// CRM API SERVICE
// =====================================

export class CRMService {
  /**
   * Build CRM module API path
   * @param resource - Resource path (e.g., 'customers', 'leads')
   * @returns CRM API path (without /api prefix as it's in baseURL)
   *
   * CRM module uses: /api/crm/{resource}
   * Tenant context is handled by backend middleware via X-Tenant-Code header (not in URL)
   */
  private static getPath(resource: string): string {
    // CRM module route pattern
    return `/crm/${resource}`;
  }

  // =====================================
  // CUSTOMERS
  // =====================================

  /**
   * Get all customers with pagination and filters
   * Uses CRM module's GetCustomersPagedQuery
   */
  static async getCustomers(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Customer>> {
    // CRM module uses /paged endpoint for pagination
    const params = {
      pageNumber: filters?.pageNumber || 1,
      pageSize: filters?.pageSize || 10,
      searchTerm: filters?.search,
      sortBy: filters?.sortBy,
      sortDescending: filters?.sortOrder === 'desc',
      includeInactive: filters?.status === 'Inactive',
    };

    return ApiService.get<PaginatedResponse<Customer>>(
      this.getPath('customers/paged'),
      { params }
    );
  }

  /**
   * Get single customer by ID
   */
  static async getCustomer(id: string): Promise<Customer> {
    return ApiService.get<Customer>(this.getPath(`customers/${id}`));
  }

  /**
   * Format phone number to E.164 format expected by backend
   * Converts: 05532078250 → +905532078250
   */
  private static formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If starts with 0, replace with +90 (Turkey)
    if (cleaned.startsWith('0')) {
      return '+90' + cleaned.substring(1);
    }

    // If doesn't start with +, add it
    if (!cleaned.startsWith('+')) {
      return '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Create new customer using CRM module's CreateCustomerCommand
   */
  static async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    // CRM module expects: CreateCustomerCommand { CustomerData: CreateCustomerDto }
    // CreateCustomerDto matches our frontend DTO structure
    const command = {
      CustomerData: {
        CompanyName: data.companyName,
        Email: data.email,
        Phone: this.formatPhoneNumber(data.phone),
        Website: data.website || null,
        Industry: null, // Not collected in frontend yet
        Address: data.address || null,
        City: data.city || null,
        State: data.state || null,
        Country: data.country || null,
        PostalCode: data.postalCode || null,
        AnnualRevenue: null, // Not collected in frontend yet
        NumberOfEmployees: null, // Not collected in frontend yet
        Description: data.notes || null,
      }
    };

    console.log('📤 Sending CreateCustomerCommand to CRM module:', command);
    return ApiService.post<Customer>(this.getPath('customers'), command);
  }

  /**
   * Update existing customer using CRM module's UpdateCustomerCommand
   */
  static async updateCustomer(
    id: string,
    data: UpdateCustomerDto
  ): Promise<Customer> {
    // CRM module expects: UpdateCustomerCommand { CustomerId, CustomerData }
    const command = {
      CustomerId: id,
      CustomerData: {
        CompanyName: data.companyName,
        Email: data.email,
        Phone: data.phone ? this.formatPhoneNumber(data.phone) : undefined,
        Website: data.website,
        Industry: null,
        Address: data.address,
        City: data.city,
        State: data.state,
        Country: data.country,
        PostalCode: data.postalCode,
        AnnualRevenue: null,
        NumberOfEmployees: null,
        Description: data.notes,
      }
    };

    console.log('📤 Sending UpdateCustomerCommand to CRM module:', command);
    return ApiService.put<Customer>(
      this.getPath(`customers/${id}`),
      command
    );
  }

  /**
   * Delete customer using CRM module's DeleteCustomerCommand
   */
  static async deleteCustomer(id: string): Promise<void> {
    console.log('📤 Sending DeleteCustomerCommand to CRM module:', { customerId: id });
    return ApiService.delete<void>(this.getPath(`customers/${id}`));
  }

  // =====================================
  // LEADS
  // =====================================

  /**
   * Get all leads with pagination
   */
  static async getLeads(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Lead>> {
    return ApiService.get<PaginatedResponse<Lead>>(this.getPath('leads'), {
      params: filters,
    });
  }

  /**
   * Get single lead by ID
   */
  static async getLead(id: number): Promise<Lead> {
    return ApiService.get<Lead>(this.getPath(`leads/${id}`));
  }

  /**
   * Create new lead
   */
  static async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    return ApiService.post<Lead>(this.getPath('leads'), data);
  }

  /**
   * Update existing lead
   */
  static async updateLead(id: number, data: Partial<Lead>): Promise<Lead> {
    return ApiService.put<Lead>(this.getPath(`leads/${id}`), { id, ...data });
  }

  /**
   * Delete lead
   */
  static async deleteLead(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`leads/${id}`));
  }

  /**
   * Convert lead to customer
   */
  static async convertLeadToCustomer(leadId: number, customerData: CreateCustomerDto): Promise<Customer> {
    return ApiService.post<Customer>(this.getPath(`leads/${leadId}/convert`), customerData);
  }

  // =====================================
  // DEALS
  // =====================================

  /**
   * Get all deals with pagination
   */
  static async getDeals(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Deal>> {
    return ApiService.get<PaginatedResponse<Deal>>(this.getPath('deals'), {
      params: filters,
    });
  }

  /**
   * Get single deal by ID
   */
  static async getDeal(id: string): Promise<Deal> {
    return ApiService.get<Deal>(this.getPath(`deals/${id}`));
  }

  /**
   * Create new deal
   */
  static async createDeal(data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> {
    return ApiService.post<Deal>(this.getPath('deals'), data);
  }

  /**
   * Update existing deal
   */
  static async updateDeal(id: string, data: Partial<Deal>): Promise<Deal> {
    return ApiService.put<Deal>(this.getPath(`deals/${id}`), { id, ...data });
  }

  /**
   * Delete deal
   */
  static async deleteDeal(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`deals/${id}`));
  }

  // =====================================
  // ACTIVITIES
  // =====================================

  /**
   * Get all activities with pagination
   */
  static async getActivities(
    filters?: CustomerFilters
  ): Promise<PaginatedResponse<Activity>> {
    return ApiService.get<PaginatedResponse<Activity>>(
      this.getPath('activities'),
      { params: filters }
    );
  }

  /**
   * Get single activity by ID
   */
  static async getActivity(id: number): Promise<Activity> {
    return ApiService.get<Activity>(this.getPath(`activities/${id}`));
  }

  /**
   * Create new activity
   */
  static async createActivity(data: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    return ApiService.post<Activity>(this.getPath('activities'), data);
  }

  /**
   * Update existing activity
   */
  static async updateActivity(id: number, data: Partial<Activity>): Promise<Activity> {
    return ApiService.put<Activity>(this.getPath(`activities/${id}`), { id, ...data });
  }

  /**
   * Delete activity
   */
  static async deleteActivity(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`activities/${id}`));
  }

  /**
   * Mark activity as completed
   */
  static async completeActivity(id: number): Promise<Activity> {
    return ApiService.patch<Activity>(this.getPath(`activities/${id}/complete`), {});
  }

  // =====================================
  // PIPELINES
  // =====================================

  /**
   * Get all pipelines
   */
  static async getPipelines(): Promise<Pipeline[]> {
    return ApiService.get<Pipeline[]>(this.getPath('pipelines'));
  }

  /**
   * Get single pipeline by ID
   */
  static async getPipeline(id: string): Promise<Pipeline> {
    return ApiService.get<Pipeline>(this.getPath(`pipelines/${id}`));
  }

  /**
   * Create new pipeline
   */
  static async createPipeline(data: Omit<Pipeline, 'id' | 'opportunityCount' | 'dealCount' | 'totalValue' | 'createdAt' | 'updatedAt'>): Promise<Pipeline> {
    return ApiService.post<Pipeline>(this.getPath('pipelines'), data);
  }

  /**
   * Update existing pipeline
   */
  static async updatePipeline(id: string, data: Partial<Pipeline>): Promise<Pipeline> {
    return ApiService.put<Pipeline>(this.getPath(`pipelines/${id}`), { id, ...data });
  }

  /**
   * Delete pipeline
   */
  static async deletePipeline(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`pipelines/${id}`));
  }

  /**
   * Get pipeline stages
   */
  static async getPipelineStages(pipelineId: string): Promise<PipelineStage[]> {
    return ApiService.get<PipelineStage[]>(this.getPath(`pipelines/${pipelineId}/stages`));
  }

  /**
   * Add stage to pipeline
   */
  static async addPipelineStage(pipelineId: string, data: Omit<PipelineStage, 'id' | 'itemCount' | 'totalValue'>): Promise<PipelineStage> {
    return ApiService.post<PipelineStage>(this.getPath(`pipelines/${pipelineId}/stages`), { pipelineId, ...data });
  }

  /**
   * Update pipeline stage
   */
  static async updatePipelineStage(pipelineId: string, stageId: string, data: Partial<PipelineStage>): Promise<PipelineStage> {
    return ApiService.put<PipelineStage>(this.getPath(`pipelines/${pipelineId}/stages/${stageId}`), { pipelineId, stageId, ...data });
  }

  /**
   * Remove stage from pipeline
   */
  static async removePipelineStage(pipelineId: string, stageId: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`pipelines/${pipelineId}/stages/${stageId}`));
  }

  /**
   * Activate pipeline
   */
  static async activatePipeline(id: string): Promise<Pipeline> {
    return ApiService.post<Pipeline>(this.getPath(`pipelines/${id}/activate`), {});
  }

  /**
   * Deactivate pipeline
   */
  static async deactivatePipeline(id: string): Promise<Pipeline> {
    return ApiService.post<Pipeline>(this.getPath(`pipelines/${id}/deactivate`), {});
  }

  /**
   * Set pipeline as default
   */
  static async setDefaultPipeline(id: string): Promise<Pipeline> {
    return ApiService.post<Pipeline>(this.getPath(`pipelines/${id}/set-default`), {});
  }

  // =====================================
  // CUSTOMER SEGMENTS
  // =====================================

  /**
   * Get all customer segments
   */
  static async getCustomerSegments(): Promise<CustomerSegment[]> {
    return ApiService.get<CustomerSegment[]>(this.getPath('CustomerSegments'));
  }

  /**
   * Get single customer segment by ID
   */
  static async getCustomerSegment(id: string): Promise<CustomerSegment> {
    return ApiService.get<CustomerSegment>(this.getPath(`CustomerSegments/${id}`));
  }

  /**
   * Create new customer segment
   */
  static async createCustomerSegment(data: Omit<CustomerSegment, 'id' | 'tenantId' | 'memberCount' | 'createdBy' | 'lastModifiedBy' | 'createdAt' | 'updatedAt'>): Promise<CustomerSegment> {
    return ApiService.post<CustomerSegment>(this.getPath('CustomerSegments'), data);
  }

  /**
   * Update existing customer segment
   */
  static async updateCustomerSegment(id: string, data: Partial<CustomerSegment>): Promise<CustomerSegment> {
    return ApiService.put<CustomerSegment>(this.getPath(`CustomerSegments/${id}`), { id, ...data });
  }

  /**
   * Delete customer segment
   */
  static async deleteCustomerSegment(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`CustomerSegments/${id}`));
  }

  /**
   * Activate customer segment
   */
  static async activateCustomerSegment(id: string): Promise<CustomerSegment> {
    return ApiService.post<CustomerSegment>(this.getPath(`CustomerSegments/${id}/activate`), {});
  }

  /**
   * Deactivate customer segment
   */
  static async deactivateCustomerSegment(id: string): Promise<CustomerSegment> {
    return ApiService.post<CustomerSegment>(this.getPath(`CustomerSegments/${id}/deactivate`), {});
  }

  // =====================================
  // CAMPAIGNS
  // =====================================

  /**
   * Get all campaigns
   */
  static async getCampaigns(): Promise<Campaign[]> {
    return ApiService.get<Campaign[]>(this.getPath('campaigns'));
  }

  /**
   * Get single campaign by ID
   */
  static async getCampaign(id: string): Promise<Campaign> {
    return ApiService.get<Campaign>(this.getPath(`campaigns/${id}`));
  }

  /**
   * Create new campaign
   */
  static async createCampaign(data: Omit<Campaign, 'id' | 'actualCost' | 'actualRevenue' | 'actualLeads' | 'convertedLeads' | 'conversionRate' | 'roi' | 'memberCount' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    return ApiService.post<Campaign>(this.getPath('campaigns'), data);
  }

  /**
   * Update existing campaign
   */
  static async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    return ApiService.put<Campaign>(this.getPath(`campaigns/${id}`), { id, ...data });
  }

  /**
   * Delete campaign
   */
  static async deleteCampaign(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`campaigns/${id}`));
  }

  /**
   * Start campaign
   */
  static async startCampaign(id: string): Promise<Campaign> {
    return ApiService.post<Campaign>(this.getPath(`campaigns/${id}/start`), {});
  }

  /**
   * Complete campaign
   */
  static async completeCampaign(id: string): Promise<Campaign> {
    return ApiService.post<Campaign>(this.getPath(`campaigns/${id}/complete`), {});
  }

  /**
   * Pause campaign
   */
  static async pauseCampaign(id: string): Promise<Campaign> {
    return ApiService.post<Campaign>(this.getPath(`campaigns/${id}/pause`), {});
  }

  // =====================================
  // ACTIVITIES - Extended Methods
  // =====================================

  /**
   * Cancel an activity
   */
  static async cancelActivity(id: Guid, reason?: string): Promise<Activity> {
    const command: CancelActivityCommand = { id, cancellationReason: reason };
    return ApiService.post<Activity>(this.getPath(`activities/${id}/cancel`), command);
  }

  /**
   * Reschedule an activity
   */
  static async rescheduleActivity(
    id: Guid,
    newStartDate: DateTime,
    newEndDate?: DateTime,
    reason?: string
  ): Promise<Activity> {
    const command: RescheduleActivityCommand = { id, newStartDate, newEndDate, reason };
    return ApiService.post<Activity>(this.getPath(`activities/${id}/reschedule`), command);
  }

  /**
   * Get upcoming activities (next N days)
   */
  static async getUpcomingActivities(days: number = 7): Promise<Activity[]> {
    return ApiService.get<Activity[]>(
      this.getPath('activities/upcoming'),
      { params: { days } }
    );
  }

  /**
   * Get overdue activities
   */
  static async getOverdueActivities(): Promise<Activity[]> {
    return ApiService.get<Activity[]>(this.getPath('activities/overdue'));
  }

  /**
   * Get activities for calendar view (date range)
   */
  static async getCalendarActivities(
    fromDate: DateTime,
    toDate: DateTime
  ): Promise<Activity[]> {
    return ApiService.get<Activity[]>(
      this.getPath('activities/calendar'),
      { params: { fromDate, toDate } }
    );
  }

  /**
   * Get activity statistics
   */
  static async getActivityStatistics(
    fromDate?: DateTime,
    toDate?: DateTime
  ): Promise<ActivityStatisticsDto> {
    return ApiService.get<ActivityStatisticsDto>(
      this.getPath('activities/statistics'),
      { params: { fromDate, toDate } }
    );
  }

  // =====================================
  // LEADS - Extended Methods
  // =====================================

  /**
   * Qualify a lead
   */
  static async qualifyLead(id: Guid, notes?: string): Promise<Lead> {
    const command: QualifyLeadCommand = { id, qualificationNotes: notes };
    return ApiService.post<Lead>(this.getPath(`leads/${id}/qualify`), command);
  }

  /**
   * Disqualify a lead
   */
  static async disqualifyLead(id: Guid, reason: string): Promise<Lead> {
    const command: DisqualifyLeadCommand = { id, disqualificationReason: reason };
    return ApiService.post<Lead>(this.getPath(`leads/${id}/disqualify`), command);
  }

  /**
   * Assign lead to a user
   */
  static async assignLead(id: Guid, assignedToId: Guid): Promise<Lead> {
    const command: AssignLeadCommand = { id, assignedToId };
    return ApiService.post<Lead>(this.getPath(`leads/${id}/assign`), command);
  }

  /**
   * Update lead score
   */
  static async updateLeadScore(
    id: Guid,
    score: number,
    scoringCriteria?: ScoringCriteria
  ): Promise<Lead> {
    const command: UpdateLeadScoreCommand = { id, score, scoringCriteria };
    return ApiService.post<Lead>(this.getPath(`leads/${id}/score`), command);
  }

  /**
   * Get activities for a lead
   */
  static async getLeadActivities(id: Guid): Promise<Activity[]> {
    return ApiService.get<Activity[]>(this.getPath(`leads/${id}/activities`));
  }

  /**
   * Get lead statistics
   */
  static async getLeadStatistics(
    fromDate?: DateTime,
    toDate?: DateTime
  ): Promise<LeadStatisticsDto> {
    return ApiService.get<LeadStatisticsDto>(
      this.getPath('leads/statistics'),
      { params: { fromDate, toDate } }
    );
  }

  // =====================================
  // DEALS - Extended Methods
  // =====================================

  /**
   * Move deal to a different stage
   */
  static async moveDealStage(
    id: Guid,
    newStageId: Guid,
    notes?: string
  ): Promise<Deal> {
    const command: MoveDealStageCommand = { dealId: id, newStageId, notes };
    return ApiService.post<Deal>(this.getPath(`deals/${id}/move-stage`), command);
  }

  /**
   * Close deal as won
   */
  static async closeDealWon(
    id: Guid,
    actualAmount?: number,
    closedDate?: DateTime,
    notes?: string
  ): Promise<Deal> {
    const command: CloseDealWonCommand = {
      id,
      actualAmount,
      closedDate: closedDate || new Date().toISOString(),
      notes,
    };
    return ApiService.post<Deal>(this.getPath(`deals/${id}/close-won`), command);
  }

  /**
   * Close deal as lost
   */
  static async closeDealLost(
    id: Guid,
    lostReason: string,
    competitorName?: string,
    closedDate?: DateTime,
    notes?: string
  ): Promise<Deal> {
    const command: CloseDealLostCommand = {
      id,
      lostReason,
      competitorName,
      closedDate: closedDate || new Date().toISOString(),
      notes,
    };
    return ApiService.post<Deal>(this.getPath(`deals/${id}/close-lost`), command);
  }

  /**
   * Get activities for a deal
   */
  static async getDealActivities(id: Guid): Promise<Activity[]> {
    return ApiService.get<Activity[]>(this.getPath(`deals/${id}/activities`));
  }

  /**
   * Get products for a deal
   */
  static async getDealProducts(id: Guid): Promise<DealProductDto[]> {
    return ApiService.get<DealProductDto[]>(this.getPath(`deals/${id}/products`));
  }

  /**
   * Add product to a deal
   */
  static async addDealProduct(
    dealId: Guid,
    productId: Guid,
    quantity: number,
    unitPrice: number,
    discount?: number
  ): Promise<DealProductDto> {
    const command: AddDealProductCommand = { dealId, productId, quantity, unitPrice, discount };
    return ApiService.post<DealProductDto>(this.getPath(`deals/${dealId}/products`), command);
  }

  /**
   * Remove product from a deal
   */
  static async removeDealProduct(dealId: Guid, productId: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`deals/${dealId}/products/${productId}`));
  }

  /**
   * Get deal statistics
   */
  static async getDealStatistics(
    fromDate?: DateTime,
    toDate?: DateTime
  ): Promise<DealStatisticsDto> {
    return ApiService.get<DealStatisticsDto>(
      this.getPath('deals/statistics'),
      { params: { fromDate, toDate } }
    );
  }

  /**
   * Get conversion rates by pipeline
   */
  static async getConversionRates(
    pipelineId?: Guid,
    fromDate?: DateTime,
    toDate?: DateTime
  ): Promise<ConversionRatesDto> {
    return ApiService.get<ConversionRatesDto>(
      this.getPath('deals/conversion-rates'),
      { params: { pipelineId, fromDate, toDate } }
    );
  }

  // =====================================
  // PIPELINES - Extended Methods
  // =====================================

  /**
   * Reorder pipeline stages
   */
  static async reorderPipelineStages(
    pipelineId: string,
    stageOrders: { stageId: Guid; newOrder: number }[]
  ): Promise<PipelineStage[]> {
    const command: ReorderPipelineStagesCommand = { pipelineId, stageOrders };
    return ApiService.post<PipelineStage[]>(
      this.getPath(`pipelines/${pipelineId}/stages/reorder`),
      command
    );
  }

  /**
   * Get pipeline statistics
   */
  static async getPipelineStatistics(pipelineId: string): Promise<PipelineStatisticsDto> {
    return ApiService.get<PipelineStatisticsDto>(
      this.getPath(`pipelines/${pipelineId}/statistics`)
    );
  }

  // =====================================
  // CAMPAIGNS - Extended Methods
  // =====================================

  /**
   * Get campaign members
   */
  static async getCampaignMembers(id: string): Promise<CampaignMemberDto[]> {
    return ApiService.get<CampaignMemberDto[]>(this.getPath(`campaigns/${id}/members`));
  }

  /**
   * Add member to campaign
   */
  static async addCampaignMember(
    campaignId: string,
    data: Omit<AddCampaignMemberCommand, 'campaignId'>
  ): Promise<CampaignMemberDto> {
    const command: AddCampaignMemberCommand = { campaignId, ...data };
    return ApiService.post<CampaignMemberDto>(
      this.getPath(`campaigns/${campaignId}/members`),
      command
    );
  }

  /**
   * Remove member from campaign
   */
  static async removeCampaignMember(campaignId: string, memberId: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`campaigns/${campaignId}/members/${memberId}`));
  }

  /**
   * Convert campaign member (lead to customer)
   */
  static async convertCampaignMember(
    campaignId: string,
    memberId: Guid
  ): Promise<CampaignMemberDto> {
    return ApiService.post<CampaignMemberDto>(
      this.getPath(`campaigns/${campaignId}/members/${memberId}/convert`),
      {}
    );
  }

  /**
   * Get campaign ROI
   */
  static async getCampaignRoi(id: string): Promise<CampaignRoiDto> {
    return ApiService.get<CampaignRoiDto>(this.getPath(`campaigns/${id}/roi`));
  }

  /**
   * Get campaign statistics
   */
  static async getCampaignStatistics(id: string): Promise<CampaignStatisticsDto> {
    return ApiService.get<CampaignStatisticsDto>(this.getPath(`campaigns/${id}/statistics`));
  }

  /**
   * Bulk import campaign members
   */
  static async bulkImportCampaignMembers(
    campaignId: string,
    members: BulkImportCampaignMembersCommand['members']
  ): Promise<BulkImportResultDto> {
    const command: BulkImportCampaignMembersCommand = { campaignId, members };
    return ApiService.post<BulkImportResultDto>(this.getPath('campaigns/bulk-import'), command);
  }

  // =====================================
  // CUSTOMER SEGMENTS - Extended Methods
  // =====================================

  /**
   * Get segment members
   */
  static async getSegmentMembers(id: string): Promise<CustomerSegmentMemberDto[]> {
    return ApiService.get<CustomerSegmentMemberDto[]>(
      this.getPath(`customersegments/${id}/members`)
    );
  }

  /**
   * Add member to segment
   */
  static async addSegmentMember(segmentId: string, customerId: Guid): Promise<void> {
    const command: AddSegmentMemberCommand = { segmentId, customerId };
    return ApiService.post<void>(this.getPath(`customersegments/${segmentId}/members`), command);
  }

  /**
   * Remove member from segment
   */
  static async removeSegmentMember(segmentId: string, customerId: Guid): Promise<void> {
    return ApiService.delete<void>(
      this.getPath(`customersegments/${segmentId}/members/${customerId}`)
    );
  }

  /**
   * Update segment criteria (dynamic segments only)
   */
  static async updateSegmentCriteria(
    id: string,
    criteria: UpdateSegmentCriteriaCommand['criteria']
  ): Promise<CustomerSegment> {
    const command: UpdateSegmentCriteriaCommand = { id, criteria };
    return ApiService.put<CustomerSegment>(
      this.getPath(`customersegments/${id}/criteria`),
      command
    );
  }

  /**
   * Recalculate segment members (dynamic segments only)
   */
  static async recalculateSegmentMembers(id: string): Promise<CustomerSegment> {
    return ApiService.post<CustomerSegment>(
      this.getPath(`customersegments/${id}/recalculate`),
      {}
    );
  }

  // =====================================
  // OPPORTUNITIES (NEW MODULE)
  // =====================================

  /**
   * Get all opportunities with filters
   */
  static async getOpportunities(
    filters?: OpportunityFilters
  ): Promise<PaginatedResponse<OpportunityDto>> {
    return ApiService.get<PaginatedResponse<OpportunityDto>>(
      this.getPath('opportunities'),
      { params: filters }
    );
  }

  /**
   * Get single opportunity by ID
   */
  static async getOpportunity(id: Guid): Promise<OpportunityDto> {
    return ApiService.get<OpportunityDto>(this.getPath(`opportunities/${id}`));
  }

  /**
   * Create new opportunity
   */
  static async createOpportunity(data: CreateOpportunityCommand): Promise<OpportunityDto> {
    return ApiService.post<OpportunityDto>(this.getPath('opportunities'), data);
  }

  /**
   * Update existing opportunity
   */
  static async updateOpportunity(
    id: Guid,
    data: Omit<UpdateOpportunityCommand, 'id'>
  ): Promise<OpportunityDto> {
    const command: UpdateOpportunityCommand = { id, ...data };
    return ApiService.put<OpportunityDto>(this.getPath(`opportunities/${id}`), command);
  }

  /**
   * Delete opportunity
   */
  static async deleteOpportunity(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`opportunities/${id}`));
  }

  /**
   * Move opportunity to different stage
   */
  static async moveOpportunityStage(
    id: Guid,
    newStageId: Guid,
    notes?: string
  ): Promise<OpportunityDto> {
    const command: MoveOpportunityStageCommand = { opportunityId: id, newStageId, notes };
    return ApiService.post<OpportunityDto>(
      this.getPath(`opportunities/${id}/move-stage`),
      command
    );
  }

  /**
   * Win an opportunity
   */
  static async winOpportunity(
    id: Guid,
    actualAmount?: number,
    closedDate?: DateTime,
    notes?: string
  ): Promise<OpportunityDto> {
    const command: WinOpportunityCommand = {
      id,
      actualAmount,
      closedDate: closedDate || new Date().toISOString(),
      notes,
    };
    return ApiService.post<OpportunityDto>(this.getPath(`opportunities/${id}/win`), command);
  }

  /**
   * Lose an opportunity
   */
  static async loseOpportunity(
    id: Guid,
    lostReason: string,
    competitorName?: string,
    closedDate?: DateTime,
    notes?: string
  ): Promise<OpportunityDto> {
    const command: LoseOpportunityCommand = {
      id,
      lostReason,
      competitorName,
      closedDate: closedDate || new Date().toISOString(),
      notes,
    };
    return ApiService.post<OpportunityDto>(this.getPath(`opportunities/${id}/lose`), command);
  }

  /**
   * Get activities for an opportunity
   */
  static async getOpportunityActivities(id: Guid): Promise<Activity[]> {
    return ApiService.get<Activity[]>(this.getPath(`opportunities/${id}/activities`));
  }

  /**
   * Get products for an opportunity
   */
  static async getOpportunityProducts(id: Guid): Promise<OpportunityProductDto[]> {
    return ApiService.get<OpportunityProductDto[]>(this.getPath(`opportunities/${id}/products`));
  }

  /**
   * Add product to an opportunity
   */
  static async addOpportunityProduct(
    opportunityId: Guid,
    productId: Guid,
    quantity: number,
    unitPrice: number,
    discount?: number
  ): Promise<OpportunityProductDto> {
    const command = { opportunityId, productId, quantity, unitPrice, discount };
    return ApiService.post<OpportunityProductDto>(
      this.getPath(`opportunities/${opportunityId}/products`),
      command
    );
  }

  /**
   * Remove product from an opportunity
   */
  static async removeOpportunityProduct(opportunityId: Guid, productId: Guid): Promise<void> {
    return ApiService.delete<void>(
      this.getPath(`opportunities/${opportunityId}/products/${productId}`)
    );
  }

  /**
   * Get pipeline report
   */
  static async getPipelineReport(
    pipelineId?: Guid,
    fromDate?: DateTime,
    toDate?: DateTime
  ): Promise<PipelineReportDto> {
    return ApiService.get<PipelineReportDto>(
      this.getPath('opportunities/pipeline-report'),
      { params: { pipelineId, fromDate, toDate } }
    );
  }

  /**
   * Get sales forecast
   */
  static async getSalesForecast(fromDate: DateTime, toDate: DateTime): Promise<ForecastDto> {
    return ApiService.get<ForecastDto>(
      this.getPath('opportunities/forecast'),
      { params: { fromDate, toDate } }
    );
  }

  // =====================================
  // DOCUMENTS (NEW MODULE)
  // =====================================

  /**
   * Upload a document
   */
  static async uploadDocument(
    file: File,
    entityId: number | string,
    entityType: string,
    category: DocumentCategory,
    metadata?: {
      description?: string;
      tags?: string;
      accessLevel?: AccessLevel;
      expiresAt?: DateTime;
    }
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('EntityId', typeof entityId === 'number' ? entityId.toString() : entityId);
    formData.append('EntityType', entityType);
    formData.append('Category', category);

    if (metadata?.description) formData.append('Description', metadata.description);
    if (metadata?.tags) formData.append('Tags', metadata.tags);
    if (metadata?.accessLevel) formData.append('AccessLevel', metadata.accessLevel);
    if (metadata?.expiresAt) formData.append('ExpiresAt', metadata.expiresAt);

    // Don't set Content-Type manually - axios will add boundary automatically
    return ApiService.post<UploadDocumentResponse>(
      this.getPath('documents/upload'),
      formData
    );
  }

  /**
   * Get document by ID
   */
  static async getDocument(id: number): Promise<DocumentDto> {
    return ApiService.get<DocumentDto>(this.getPath(`documents/${id}`));
  }

  /**
   * Get documents by entity
   */
  static async getDocumentsByEntity(
    entityId: number | string,
    entityType: string
  ): Promise<DocumentDto[]> {
    return ApiService.get<DocumentDto[]>(
      this.getPath(`documents/entity/${entityId}/${entityType}`)
    );
  }

  /**
   * Download document
   */
  static async downloadDocument(id: number): Promise<Blob> {
    return ApiService.get<Blob>(this.getPath(`documents/${id}/download`), {
      responseType: 'blob',
    });
  }

  /**
   * Get temporary download URL
   */
  static async getDownloadUrl(
    id: number,
    expiresInMinutes: number = 60
  ): Promise<DownloadUrlResponse> {
    return ApiService.get<DownloadUrlResponse>(this.getPath(`documents/${id}/url`), {
      params: { expiresInMinutes },
    });
  }

  /**
   * Update document metadata
   */
  static async updateDocument(id: number, metadata: UpdateDocumentRequest): Promise<void> {
    return ApiService.put<void>(this.getPath(`documents/${id}`), metadata);
  }

  /**
   * Delete document
   */
  static async deleteDocument(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`documents/${id}`));
  }

  // =====================================
  // CUSTOMER TAGS (NEW MODULE)
  // =====================================

  /**
   * Get all tags for a customer
   */
  static async getCustomerTags(customerId: Guid): Promise<CustomerTagDto[]> {
    return ApiService.get<CustomerTagDto[]>(
      this.getPath(`customertags/customer/${customerId}`)
    );
  }

  /**
   * Get all distinct tags (tenant-wide)
   */
  static async getDistinctTags(): Promise<string[]> {
    return ApiService.get<string[]>(this.getPath('customertags/distinct'));
  }

  /**
   * Add tag to a customer
   */
  static async addCustomerTag(
    customerId: Guid,
    tagName: string,
    color?: string
  ): Promise<CustomerTagDto> {
    const command: AddCustomerTagCommand = { customerId, tagName, color };
    return ApiService.post<CustomerTagDto>(this.getPath('customertags'), command);
  }

  /**
   * Remove tag from a customer
   */
  static async removeCustomerTag(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`customertags/${id}`));
  }
}

export default CRMService;
