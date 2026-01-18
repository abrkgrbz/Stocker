import { ApiService } from '../api-service';
import logger from '../../utils/logger';
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
  // Workflows
  WorkflowDto,
  CreateWorkflowCommand,
  ExecuteWorkflowCommand,
  WorkflowExecutionResponse,
  // Notifications
  NotificationFilterParams,
  GetNotificationsResponse,
  // Call Logs
  CallLogDto,
  CreateCallLogCommand,
  UpdateCallLogCommand,
  CallLogFilters,
  CallDirection,
  CallStatus,
  CallOutcome,
  // Meetings
  MeetingDto,
  CreateMeetingCommand,
  UpdateMeetingCommand,
  MeetingFilters,
  MeetingType,
  MeetingStatus,
  // Territories
  TerritoryDto,
  CreateTerritoryCommand,
  UpdateTerritoryCommand,
  TerritoryFilters,
  TerritoryType,
  // Sales Teams
  SalesTeamDto,
  SalesTeamMemberDto,
  CreateSalesTeamCommand,
  UpdateSalesTeamCommand,
  AddSalesTeamMemberCommand,
  SalesTeamFilters,
  SalesTeamRole,
  // Competitors
  CompetitorDto,
  CompetitorProductDto,
  CompetitorStrengthDto,
  CompetitorWeaknessDto,
  CreateCompetitorCommand,
  UpdateCompetitorCommand,
  CompetitorFilters,
  ThreatLevel,
  StrengthCategory,
  WeaknessCategory,
  // Loyalty Programs
  LoyaltyProgramDto,
  LoyaltyTierDto,
  LoyaltyRewardDto,
  CreateLoyaltyProgramCommand,
  UpdateLoyaltyProgramCommand,
  LoyaltyProgramFilters,
  LoyaltyProgramType,
  // Referrals
  ReferralDto,
  CreateReferralCommand,
  UpdateReferralCommand,
  ReferralFilters,
  ReferralStatus,
  ReferralType,
  ReferralRewardType,
  // Reminders
  ReminderDto,
  CreateReminderCommand,
  UpdateReminderCommand,
  ReminderFilterParams,
  GetRemindersResponse,
  // Email
  SendTestEmailCommand,
  // Loyalty Memberships
  LoyaltyMembershipDto,
  LoyaltyMembershipFilters,
  CreateLoyaltyMembershipCommand,
  UpdateLoyaltyMembershipCommand,
  // Product Interests
  ProductInterestDto,
  ProductInterestFilters,
  CreateProductInterestCommand,
  UpdateProductInterestCommand,
  InterestStatus,
  InterestLevel,
  InterestSource,
  // Social Media Profiles
  SocialMediaProfileDto,
  SocialMediaProfileFilters,
  CreateSocialMediaProfileCommand,
  UpdateSocialMediaProfileCommand,
  SocialMediaPlatform,
  // Survey Responses
  SurveyResponseDto,
  SurveyResponseFilters,
  CreateSurveyResponseCommand,
  UpdateSurveyResponseCommand,
  SurveyType,
  SurveyResponseStatus,
  Guid,
  DateTime,
} from './crm.types';

// =====================================
// TYPES - Based on Backend API
// =====================================

export interface Customer {
  id: string; // Guid from backend
  companyName: string;
  customerName?: string; // Alias for companyName
  contactPerson: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  // GeoLocation IDs (FK to Master DB)
  countryId: string | null;
  cityId: string | null;
  districtId: string | null;
  // Denormalized location names (for display/backward compatibility)
  city: string | null;
  state: string | null;
  district: string | null;
  country: string | null;
  postalCode: string | null;
  customerType: 'Individual' | 'Corporate' | 'Government' | 'NonProfit';
  status: 'Active' | 'Inactive' | 'Prospect' | 'Suspended';
  creditLimit: number;
  taxId: string | null;
  taxOffice: string | null;
  paymentTerms: string | null;
  notes: string | null;
  description: string | null;
  totalPurchases: number | null;
  // Additional CRM fields
  industry: string | null;
  annualRevenue: number | null;
  numberOfEmployees: number | null;
  isActive: boolean;
  contacts?: Contact[]; // Contact array if backend provides it
  createdAt: string;
  updatedAt: string;
  // ═══════════════════════════════════════════════════════════════
  // TURKISH COMPLIANCE FIELDS
  // ═══════════════════════════════════════════════════════════════
  // Business Entity (Şirket Türü) - TTK uyumlu
  businessEntityType?: string | null;    // A.Ş., Ltd. Şti., Şahıs İşletmesi, etc.
  mersisNo?: string | null;              // MERSIS No (16 hane)
  tradeRegistryNo?: string | null;       // Ticaret Sicil No
  // e-Fatura (GİB)
  kepAddress?: string | null;            // KEP Adresi (Kayıtlı Elektronik Posta)
  eInvoiceRegistered?: boolean;          // e-Fatura Mükellefi mi?
  eInvoiceStartDate?: string | null;     // e-Fatura başlangıç tarihi
  // Individual (Bireysel)
  tcKimlikNo?: string | null;            // TC Kimlik No (11 hane)
  // KVKK Consent (Kişisel Verilerin Korunması) - Backend flat fields
  kvkkDataProcessingConsent?: boolean;
  kvkkMarketingConsent?: boolean;
  kvkkCommunicationConsent?: boolean;
  kvkkConsentDate?: string | null;
}

export interface Lead {
  id: string; // Guid from backend
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string | null;
  mobilePhone: string | null;
  companyName: string | null;
  company?: string | null; // Alias for companyName
  jobTitle: string | null;
  industry: string | null;
  source: string | null;
  status: 'New' | 'Contacted' | 'Working' | 'Qualified' | 'Unqualified' | 'Converted' | 'Lost';
  rating: 'Unrated' | 'Cold' | 'Warm' | 'Hot';
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  website: string | null;
  annualRevenue: number | null;
  numberOfEmployees: number | null;
  description: string | null;
  assignedToUserId: string | null;
  assignedToName: string | null; // Added - backend has this field
  convertedDate: string | null;
  convertedToCustomerId: string | null;
  isConverted: boolean;
  score: number;
  createdAt: string;
  updatedAt: string | null;
  // Related data from backend
  activities?: Activity[];
  notes?: Note[];
  // ═══════════════════════════════════════════════════════════════
  // TURKISH COMPLIANCE FIELDS
  // ═══════════════════════════════════════════════════════════════
  // Business Entity (if company exists)
  businessEntityType?: string | null;    // A.Ş., Ltd. Şti., etc.
  // KVKK Consent (Kişisel Verilerin Korunması)
  kvkkConsent?: {
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    communicationConsent: boolean;
    consentDate?: string;
  } | null;
}

export interface Deal {
  id: string; // Guid from backend
  title: string;
  description: string | null;
  customerId: string; // Guid from backend
  customerName: string;
  amount: number;
  currency: string; // Default: TRY
  status: 'Open' | 'Won' | 'Lost';
  priority: 'Low' | 'Medium' | 'High';
  pipelineId: string | null;
  pipelineName: string | null;
  stageId: string | null;
  stageName: string | null;
  expectedCloseDate: string;
  actualCloseDate: string | null;
  probability: number;
  lostReason: string | null;
  wonDetails: string | null;
  competitorName: string | null;
  source: string | null;
  ownerId: string | null;
  ownerName: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  weightedAmount?: number; // Computed: amount * (probability / 100)
  // Related data from backend
  products?: DealProduct[];
  activities?: Activity[];
  notes?: Note[];
  createdAt: string;
  updatedAt: string | null;
}

export interface DealProduct {
  id: string;
  dealId: number;
  productId: number;
  productName: string;
  productCode: string | null;
  description: string | null;
  quantity: number;
  unitPrice: number;
  currency: string;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
  tax: number;
  taxAmount: number;
  sortOrder: number;
  isRecurring: boolean;
  recurringPeriod: string | null;
  recurringCycles: number | null;
}

export interface Activity {
  id: string; // Guid from backend
  subject: string; // Activity title/subject
  title?: string; // Alias for subject (frontend compatibility)
  description: string | null;
  type: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note' | 'Demo' | 'Follow-up';
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled' | 'Pending';
  priority: 'Low' | 'Medium' | 'High';
  scheduledAt: string | null;
  dueAt: string | null;
  completedAt: string | null;
  duration: string | null; // TimeSpan as ISO 8601 duration string
  location: string | null;
  // Related entity IDs (all Guid/string)
  leadId: string | null;
  leadName: string | null;
  customerId: string | null;
  customerName: string | null;
  contactId: string | null;
  contactName: string | null;
  opportunityId: string | null;
  opportunityName: string | null;
  dealId: string | null;
  dealTitle: string | null;
  // Owner and assignment
  ownerId: number;
  ownerName: string | null;
  assignedToUserId: string | null;
  assignedToName: string | null;
  // Additional fields
  outcome: string | null;
  notes: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string | null;
  // Frontend compatibility aliases
  startTime?: string; // Alias for scheduledAt
  endTime?: string | null; // Computed from dueAt + duration
  relatedToName?: string | null;
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

// Input types for creating pipelines
export interface CreatePipelineStageInput {
  name: string;
  order: number;
  probability: number;
  description?: string | null;
  color?: string;
  isWon?: boolean;
  isLost?: boolean;
}

export interface CreatePipelineInput {
  name: string;
  description?: string | null;
  type: 'Sales' | 'Lead' | 'Deal' | 'Custom';
  isActive: boolean;
  isDefault: boolean;
  stages: CreatePipelineStageInput[];
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
  subject?: string | null; // Email subject line
  type: 'Email' | 'SocialMedia' | 'Webinar' | 'Event' | 'Conference' | 'Advertisement' | 'Banner' | 'Telemarketing' | 'PublicRelations';
  status: 'Planned' | 'InProgress' | 'Completed' | 'Aborted' | 'OnHold';
  startDate: string;
  endDate: string;
  budgetedCost: number;
  budget?: number; // Alias for budgetedCost
  actualCost: number;
  expectedRevenue: number;
  actualRevenue: number;
  revenue?: number; // Alias for actualRevenue
  targetAudience: string | null;
  targetLeads: number;
  actualLeads: number;
  convertedLeads: number;
  // Email campaign metrics
  totalRecipients?: number;
  deliveredCount?: number;
  openedCount?: number;
  clickedCount?: number;
  sentCount?: number;
  responseCount?: number;
  convertedCount?: number;
  targetSegmentName?: string | null;
  // Ownership
  ownerId: string | null;
  ownerName: string | null;
  customerName?: string | null;
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
  customerType?: 'Individual' | 'Corporate' | 'Government' | 'NonProfit';
  status?: 'Active' | 'Inactive' | 'Prospect' | 'Suspended';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCustomerDto {
  companyName: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  // GeoLocation IDs (FK to Master DB)
  countryId?: string;
  cityId?: string;
  districtId?: string;
  // Denormalized location names (for display/backward compatibility)
  city?: string;
  state?: string;
  district?: string;
  country?: string;
  postalCode?: string;
  customerType: 'Individual' | 'Corporate';
  status?: 'Active' | 'Inactive' | 'Prospect' | 'Suspended';
  creditLimit?: number;
  taxId?: string;
  taxOffice?: string;
  paymentTerms?: string;
  notes?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  description?: string;
  // Turkish Compliance Fields
  businessEntityType?: string;
  mersisNo?: string;
  tradeRegistryNo?: string;
  kepAddress?: string;
  eInvoiceRegistered?: boolean;
  tcKimlikNo?: string;
  // KVKK Consent
  kvkkDataProcessingConsent?: boolean;
  kvkkMarketingConsent?: boolean;
  kvkkCommunicationConsent?: boolean;
}

export interface UpdateCustomerDto extends CreateCustomerDto {}

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
   * Create new customer using CRM module's CreateCustomerDto
   */
  static async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    // CRM module expects: CreateCustomerDto directly (controller wraps in command)
    const dto: Record<string, any> = {
      companyName: data.companyName,
      customerType: data.customerType || 'Corporate',
      contactPerson: data.contactPerson || null,
      email: data.email,
      phone: this.formatPhoneNumber(data.phone),
      website: data.website || null,
      industry: data.industry || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      postalCode: data.postalCode || null,
      // GeoLocation IDs
      countryId: data.countryId || null,
      cityId: data.cityId || null,
      districtId: data.districtId || null,
      // Financial
      taxId: data.taxId || null,
      taxOffice: data.taxOffice || null,
      creditLimit: data.creditLimit || 0,
      paymentTerms: data.paymentTerms || null,
      annualRevenue: data.annualRevenue || null,
      numberOfEmployees: data.numberOfEmployees || null,
      description: data.description || data.notes || null,
      status: data.status || 'Active',
      // Turkish Compliance Fields
      businessEntityType: data.businessEntityType || null,
      mersisNo: data.mersisNo || null,
      tradeRegistryNo: data.tradeRegistryNo || null,
      kepAddress: data.kepAddress || null,
      eInvoiceRegistered: data.eInvoiceRegistered || false,
      tcKimlikNo: data.tcKimlikNo || null,
      // KVKK Consent - flat fields matching backend DTO
      kvkkDataProcessingConsent: data.kvkkDataProcessingConsent || false,
      kvkkMarketingConsent: data.kvkkMarketingConsent || false,
      kvkkCommunicationConsent: data.kvkkCommunicationConsent || false,
    };

    logger.info('📤 Sending CreateCustomerDto to CRM module', { metadata: { dto } });
    return ApiService.post<Customer>(this.getPath('customers'), dto);
  }

  /**
   * Update existing customer using CRM module's UpdateCustomerDto
   */
  static async updateCustomer(
    id: string,
    data: UpdateCustomerDto
  ): Promise<Customer> {
    // CRM module expects: UpdateCustomerDto directly (controller wraps in command)
    const dto: Record<string, any> = {
      companyName: data.companyName,
      customerType: data.customerType,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone ? this.formatPhoneNumber(data.phone) : undefined,
      website: data.website,
      industry: data.industry,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      // GeoLocation IDs
      countryId: data.countryId,
      cityId: data.cityId,
      districtId: data.districtId,
      // Financial
      taxId: data.taxId,
      taxOffice: data.taxOffice,
      creditLimit: data.creditLimit,
      paymentTerms: data.paymentTerms,
      annualRevenue: data.annualRevenue,
      numberOfEmployees: data.numberOfEmployees,
      description: data.description,
      status: data.status,
      // Turkish Compliance Fields
      businessEntityType: data.businessEntityType,
      mersisNo: data.mersisNo,
      tradeRegistryNo: data.tradeRegistryNo,
      kepAddress: data.kepAddress,
      eInvoiceRegistered: data.eInvoiceRegistered,
      tcKimlikNo: data.tcKimlikNo,
      // KVKK Consent - flat fields matching backend DTO
      kvkkDataProcessingConsent: data.kvkkDataProcessingConsent || false,
      kvkkMarketingConsent: data.kvkkMarketingConsent || false,
      kvkkCommunicationConsent: data.kvkkCommunicationConsent || false,
    };

    logger.info('📤 Sending UpdateCustomerDto to CRM module', { metadata: { dto } });
    return ApiService.put<Customer>(
      this.getPath(`customers/${id}`),
      dto
    );
  }

  /**
   * Delete customer using CRM module's DeleteCustomerCommand
   */
  static async deleteCustomer(id: string): Promise<void> {
    logger.info('📤 Sending DeleteCustomerCommand to CRM module', { metadata: { customerId: id } });
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
  static async getLead(id: string): Promise<Lead> {
    return ApiService.get<Lead>(this.getPath(`leads/${id}`));
  }

  /**
   * Create new lead
   * Backend expects: CreateLeadDto directly (controller wraps in command)
   */
  static async createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> & {
    // Extended fields for lead creation
    businessEntityType?: string;
    kvkkDataProcessingConsent?: boolean;
    kvkkMarketingConsent?: boolean;
    kvkkCommunicationConsent?: boolean;
  }): Promise<Lead> {
    // CRM module expects: CreateLeadDto directly (controller wraps in command)
    const dto = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      companyName: data.companyName || data.company,
      phone: data.phone ? this.formatPhoneNumber(data.phone) : undefined,
      mobilePhone: data.mobilePhone ? this.formatPhoneNumber(data.mobilePhone) : undefined,
      jobTitle: data.jobTitle,
      industry: data.industry,
      source: data.source,
      status: data.status || 'New',
      rating: data.rating || 'Unrated',
      score: data.score ?? 50, // Lead score (0-100)
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
      website: data.website,
      annualRevenue: data.annualRevenue,
      numberOfEmployees: data.numberOfEmployees,
      description: data.description,
      notes: data.notes,
      assignedToUserId: data.assignedToUserId,
      // Business entity type for company-associated leads
      businessEntityType: data.businessEntityType,
      // KVKK Consent
      kvkkDataProcessingConsent: data.kvkkDataProcessingConsent,
      kvkkMarketingConsent: data.kvkkMarketingConsent,
      kvkkCommunicationConsent: data.kvkkCommunicationConsent,
    };

    logger.info('📤 Sending CreateLeadDto to CRM module', { metadata: { dto } });
    return ApiService.post<Lead>(this.getPath('leads'), dto);
  }

  /**
   * Update existing lead
   */
  static async updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
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
  static async convertLeadToCustomer(leadId: string, customerData: CreateCustomerDto): Promise<Customer> {
    return ApiService.post<Customer>(this.getPath(`leads/${leadId}/convert`), {
      leadId,
      ...customerData
    });
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
    filters?: ActivityFilters
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
  static async createPipeline(data: CreatePipelineInput): Promise<Pipeline> {
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
    return ApiService.post<PipelineStage>(this.getPath(`pipelines/${pipelineId}/stages`), data);
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

  /**
   * Abort a campaign
   */
  static async abortCampaign(id: string): Promise<Campaign> {
    return ApiService.post<Campaign>(this.getPath(`campaigns/${id}/abort`), {});
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
    finalAmount?: number,
    actualCloseDate?: DateTime,
    wonDetails?: string
  ): Promise<Deal> {
    const command: CloseDealWonCommand = {
      id,
      finalAmount,
      actualCloseDate: actualCloseDate || new Date().toISOString(),
      wonDetails,
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
    actualCloseDate?: DateTime
  ): Promise<Deal> {
    const command: CloseDealLostCommand = {
      id,
      lostReason,
      competitorName,
      actualCloseDate: actualCloseDate || new Date().toISOString(),
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
   * Get all documents
   */
  static async getAllDocuments(): Promise<DocumentDto[]> {
    return ApiService.get<DocumentDto[]>(this.getPath('documents'));
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
    expiresInMinutes: number = 60,
    inline: boolean = false
  ): Promise<DownloadUrlResponse> {
    return ApiService.get<DownloadUrlResponse>(this.getPath(`documents/${id}/url`), {
      params: { expiresInMinutes, inline },
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

  // =====================================
  // WORKFLOWS
  // =====================================

  /**
   * Get all workflows
   */
  static async getWorkflows(): Promise<WorkflowDto[]> {
    return ApiService.get<WorkflowDto[]>(this.getPath('workflows'));
  }

  /**
   * Get workflow by ID
   */
  static async getWorkflow(id: number): Promise<WorkflowDto> {
    return ApiService.get<WorkflowDto>(this.getPath(`workflows/${id}`));
  }

  /**
   * Create a new workflow
   */
  static async createWorkflow(data: CreateWorkflowCommand): Promise<number> {
    return ApiService.post<number>(this.getPath('workflows'), data);
  }

  /**
   * Update workflow
   */
  static async updateWorkflow(id: number, data: Partial<WorkflowDto>): Promise<void> {
    return ApiService.put<void>(this.getPath(`workflows/${id}`), data);
  }

  /**
   * Delete workflow
   */
  static async deleteWorkflow(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`workflows/${id}`));
  }

  /**
   * Execute workflow
   */
  static async executeWorkflow(data: ExecuteWorkflowCommand): Promise<WorkflowExecutionResponse> {
    return ApiService.post<WorkflowExecutionResponse>(
      this.getPath(`workflows/${data.workflowId}/execute`),
      data
    );
  }

  /**
   * Activate workflow
   */
  static async activateWorkflow(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`workflows/${id}/activate`), {});
  }

  /**
   * Deactivate workflow
   */
  static async deactivateWorkflow(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`workflows/${id}/deactivate`), {});
  }

  // =====================================
  // NOTIFICATIONS
  // =====================================

  /**
   * Get notifications for current user
   */
  static async getNotifications(params?: NotificationFilterParams): Promise<GetNotificationsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.unreadOnly !== undefined) {
      queryParams.append('unreadOnly', params.unreadOnly.toString());
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.take !== undefined) {
      queryParams.append('take', params.take.toString());
    }

    const queryString = queryParams.toString();
    return ApiService.get<GetNotificationsResponse>(
      this.getPath(`notifications${queryString ? `?${queryString}` : ''}`)
    );
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(id: number): Promise<void> {
    return ApiService.put<void>(this.getPath(`notifications/${id}/read`), {});
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(): Promise<void> {
    return ApiService.put<void>(this.getPath(`notifications/read-all`), {});
  }

  /**
   * Delete notification
   */
  static async deleteNotification(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`notifications/${id}`));
  }

  // =====================================
  // CALL LOGS
  // =====================================

  /**
   * Get all call logs with filters
   */
  static async getCallLogs(filters?: CallLogFilters): Promise<{ callLogs: CallLogDto[]; totalCount: number }> {
    return ApiService.get<{ callLogs: CallLogDto[]; totalCount: number }>(this.getPath('call-logs'), { params: filters });
  }

  /**
   * Get call log by ID
   */
  static async getCallLog(id: Guid): Promise<CallLogDto> {
    return ApiService.get<CallLogDto>(this.getPath(`call-logs/${id}`));
  }

  /**
   * Get call logs by customer
   */
  static async getCallLogsByCustomer(customerId: Guid): Promise<CallLogDto[]> {
    return ApiService.get<CallLogDto[]>(this.getPath(`call-logs/customer/${customerId}`));
  }

  /**
   * Create new call log
   */
  static async createCallLog(data: CreateCallLogCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('call-logs'), data);
  }

  /**
   * Complete a call log
   */
  static async completeCallLog(id: Guid, outcome: CallOutcome, outcomeDescription?: string): Promise<void> {
    return ApiService.put<void>(this.getPath(`call-logs/${id}/complete`), { id, outcome, outcomeDescription });
  }

  /**
   * Set follow-up for call log
   */
  static async setCallLogFollowUp(id: Guid, followUpDate: DateTime, followUpNote?: string): Promise<void> {
    return ApiService.put<void>(this.getPath(`call-logs/${id}/follow-up`), { id, followUpDate, followUpNote });
  }

  /**
   * Set quality score for call log
   */
  static async setCallLogQualityScore(
    id: Guid,
    score: number,
    customerSatisfaction?: number,
    qualityNotes?: string
  ): Promise<void> {
    return ApiService.put<void>(this.getPath(`call-logs/${id}/quality-score`), { id, score, customerSatisfaction, qualityNotes });
  }

  /**
   * Delete call log
   */
  static async deleteCallLog(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`call-logs/${id}`));
  }

  // =====================================
  // MEETINGS
  // =====================================

  /**
   * Get all meetings with filters
   */
  static async getMeetings(filters?: MeetingFilters): Promise<PaginatedResponse<MeetingDto>> {
    return ApiService.get<PaginatedResponse<MeetingDto>>(this.getPath('meetings'), { params: filters });
  }

  /**
   * Get meeting by ID
   */
  static async getMeeting(id: Guid): Promise<MeetingDto> {
    return ApiService.get<MeetingDto>(this.getPath(`meetings/${id}`));
  }

  /**
   * Create new meeting
   */
  static async createMeeting(data: CreateMeetingCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('meetings'), data);
  }

  /**
   * Update meeting
   */
  static async updateMeeting(id: Guid, data: UpdateMeetingCommand): Promise<void> {
    return ApiService.put<void>(this.getPath(`meetings/${id}`), data);
  }

  /**
   * Delete meeting
   */
  static async deleteMeeting(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`meetings/${id}`));
  }

  // =====================================
  // TERRITORIES
  // =====================================

  /**
   * Get all territories with filters
   */
  static async getTerritories(filters?: TerritoryFilters): Promise<TerritoryDto[]> {
    return ApiService.get<TerritoryDto[]>(this.getPath('territories'), { params: filters });
  }

  /**
   * Get territory by ID
   */
  static async getTerritory(id: Guid): Promise<TerritoryDto> {
    return ApiService.get<TerritoryDto>(this.getPath(`territories/${id}`));
  }

  /**
   * Create new territory
   */
  static async createTerritory(data: CreateTerritoryCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('territories'), data);
  }

  /**
   * Update territory
   */
  static async updateTerritory(id: Guid, data: Omit<UpdateTerritoryCommand, 'id'>): Promise<void> {
    return ApiService.put<void>(this.getPath(`territories/${id}`), { id, ...data });
  }

  /**
   * Delete territory
   */
  static async deleteTerritory(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`territories/${id}`));
  }

  // =====================================
  // SALES TEAMS
  // =====================================

  /**
   * Get all sales teams with filters
   */
  static async getSalesTeams(filters?: SalesTeamFilters): Promise<PaginatedResponse<SalesTeamDto>> {
    return ApiService.get<PaginatedResponse<SalesTeamDto>>(this.getPath('sales-teams'), { params: filters });
  }

  /**
   * Get sales team by ID
   */
  static async getSalesTeam(id: Guid): Promise<SalesTeamDto> {
    return ApiService.get<SalesTeamDto>(this.getPath(`sales-teams/${id}`));
  }

  /**
   * Create new sales team
   */
  static async createSalesTeam(data: CreateSalesTeamCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('sales-teams'), data);
  }

  /**
   * Update sales team
   */
  static async updateSalesTeam(data: UpdateSalesTeamCommand): Promise<void> {
    return ApiService.put<void>(this.getPath(`sales-teams/${data.id}`), data);
  }

  /**
   * Delete sales team
   */
  static async deleteSalesTeam(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`sales-teams/${id}`));
  }

  /**
   * Add member to sales team
   */
  static async addSalesTeamMember(data: AddSalesTeamMemberCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath(`sales-teams/${data.salesTeamId}/members`), data);
  }

  /**
   * Remove member from sales team
   */
  static async removeSalesTeamMember(salesTeamId: Guid, userId: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`sales-teams/${salesTeamId}/members/${userId}`));
  }

  // =====================================
  // COMPETITORS
  // =====================================

  /**
   * Get all competitors with filters
   */
  static async getCompetitors(filters?: CompetitorFilters): Promise<PaginatedResponse<CompetitorDto>> {
    return ApiService.get<PaginatedResponse<CompetitorDto>>(this.getPath('competitors'), { params: filters });
  }

  /**
   * Get competitor by ID
   */
  static async getCompetitor(id: Guid): Promise<CompetitorDto> {
    return ApiService.get<CompetitorDto>(this.getPath(`competitors/${id}`));
  }

  /**
   * Create new competitor
   */
  static async createCompetitor(data: CreateCompetitorCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('competitors'), data);
  }

  /**
   * Update competitor
   */
  static async updateCompetitor(id: Guid, data: Omit<UpdateCompetitorCommand, 'id'>): Promise<CompetitorDto> {
    return ApiService.put<CompetitorDto>(this.getPath(`competitors/${id}`), { id, ...data });
  }

  /**
   * Delete competitor
   */
  static async deleteCompetitor(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`competitors/${id}`));
  }

  // =====================================
  // LOYALTY PROGRAMS
  // =====================================

  /**
   * Get all loyalty programs with filters
   */
  static async getLoyaltyPrograms(filters?: LoyaltyProgramFilters): Promise<LoyaltyProgramDto[]> {
    return ApiService.get<LoyaltyProgramDto[]>(this.getPath('loyalty-programs'), { params: filters });
  }

  /**
   * Get loyalty program by ID
   */
  static async getLoyaltyProgram(id: Guid): Promise<LoyaltyProgramDto> {
    return ApiService.get<LoyaltyProgramDto>(this.getPath(`loyalty-programs/${id}`));
  }

  /**
   * Create new loyalty program
   */
  static async createLoyaltyProgram(data: CreateLoyaltyProgramCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('loyalty-programs'), data);
  }

  /**
   * Update loyalty program
   */
  static async updateLoyaltyProgram(id: Guid, data: Omit<UpdateLoyaltyProgramCommand, 'id'>): Promise<void> {
    return ApiService.put<void>(this.getPath(`loyalty-programs/${id}`), { id, ...data });
  }

  /**
   * Delete loyalty program
   */
  static async deleteLoyaltyProgram(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`loyalty-programs/${id}`));
  }

  // =====================================
  // REFERRALS
  // =====================================

  /**
   * Get all referrals with filters
   */
  static async getReferrals(filters?: ReferralFilters): Promise<PaginatedResponse<ReferralDto>> {
    return ApiService.get<PaginatedResponse<ReferralDto>>(this.getPath('referrals'), { params: filters });
  }

  /**
   * Get referral by ID
   */
  static async getReferral(id: Guid): Promise<ReferralDto> {
    return ApiService.get<ReferralDto>(this.getPath(`referrals/${id}`));
  }

  /**
   * Create new referral
   */
  static async createReferral(data: CreateReferralCommand): Promise<Guid> {
    return ApiService.post<Guid>(this.getPath('referrals'), data);
  }

  /**
   * Update referral
   */
  static async updateReferral(id: Guid, data: UpdateReferralCommand): Promise<void> {
    return ApiService.put<void>(this.getPath(`referrals/${id}`), data);
  }

  /**
   * Delete referral
   */
  static async deleteReferral(id: Guid): Promise<void> {
    return ApiService.delete<void>(this.getPath(`referrals/${id}`));
  }

  // =====================================
  // REMINDERS
  // =====================================

  /**
   * Get reminders for current user
   */
  static async getReminders(params?: ReminderFilterParams): Promise<GetRemindersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.pendingOnly !== undefined) {
      queryParams.append('pendingOnly', params.pendingOnly.toString());
    }
    if (params?.skip !== undefined) {
      queryParams.append('skip', params.skip.toString());
    }
    if (params?.take !== undefined) {
      queryParams.append('take', params.take.toString());
    }
    if (params?.assignedToUserId) {
      queryParams.append('assignedToUserId', params.assignedToUserId);
    }

    const queryString = queryParams.toString();
    return ApiService.get<GetRemindersResponse>(
      this.getPath(`reminders${queryString ? `?${queryString}` : ''}`)
    );
  }

  /**
   * Create a new reminder
   */
  static async createReminder(data: CreateReminderCommand): Promise<number> {
    return ApiService.post<number>(this.getPath('reminders'), data);
  }

  /**
   * Update a reminder
   */
  static async updateReminder(id: number, data: UpdateReminderCommand): Promise<void> {
    return ApiService.put<void>(this.getPath(`reminders/${id}`), data);
  }

  /**
   * Snooze a reminder
   */
  static async snoozeReminder(id: number, minutes: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`reminders/${id}/snooze`), { minutes });
  }

  /**
   * Complete a reminder
   */
  static async completeReminder(id: number): Promise<void> {
    return ApiService.post<void>(this.getPath(`reminders/${id}/complete`), {});
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(id: number): Promise<void> {
    return ApiService.delete<void>(this.getPath(`reminders/${id}`));
  }

  // =====================================
  // EMAIL
  // =====================================

  /**
   * Send a test email
   */
  static async sendTestEmail(data: SendTestEmailCommand): Promise<{ message: string; sentTo: string }> {
    return ApiService.post<{ message: string; sentTo: string }>(this.getPath('email/test'), data);
  }

  // =====================================
  // CONTACTS
  // =====================================

  /**
   * Get contacts for a customer
   */
  static async getContactsByCustomer(customerId: string): Promise<Contact[]> {
    return ApiService.get<Contact[]>(this.getPath(`contacts/customer/${customerId}`));
  }

  /**
   * Get a single contact
   */
  static async getContact(id: string): Promise<Contact> {
    return ApiService.get<Contact>(this.getPath(`contacts/${id}`));
  }

  /**
   * Create a new contact
   */
  static async createContact(data: CreateContactCommand): Promise<Contact> {
    return ApiService.post<Contact>(this.getPath('contacts'), data);
  }

  /**
   * Update a contact
   */
  static async updateContact(id: string, data: UpdateContactCommand): Promise<Contact> {
    return ApiService.put<Contact>(this.getPath(`contacts/${id}`), data);
  }

  /**
   * Delete a contact
   */
  static async deleteContact(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`contacts/${id}`));
  }

  /**
   * Set a contact as primary
   */
  static async setContactAsPrimary(id: string): Promise<Contact> {
    return ApiService.post<Contact>(this.getPath(`contacts/${id}/set-primary`), {});
  }

  /**
   * Activate a contact
   */
  static async activateContact(id: string): Promise<Contact> {
    return ApiService.post<Contact>(this.getPath(`contacts/${id}/activate`), {});
  }

  /**
   * Deactivate a contact
   */
  static async deactivateContact(id: string): Promise<Contact> {
    return ApiService.post<Contact>(this.getPath(`contacts/${id}/deactivate`), {});
  }

  // =====================================
  // LOYALTY MEMBERSHIPS
  // =====================================

  /**
   * Get all loyalty memberships with optional filters
   */
  static async getLoyaltyMemberships(filters?: LoyaltyMembershipFilters): Promise<PaginatedResponse<LoyaltyMembershipDto>> {
    const params = new URLSearchParams();
    if (filters?.programId) params.append('programId', filters.programId);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.currentTierId) params.append('currentTierId', filters.currentTierId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.skip) params.append('skip', String(filters.skip));
    if (filters?.take) params.append('take', String(filters.take));
    const query = params.toString();
    return ApiService.get<PaginatedResponse<LoyaltyMembershipDto>>(this.getPath(`loyalty-memberships${query ? `?${query}` : ''}`));
  }

  /**
   * Get a single loyalty membership by ID
   */
  static async getLoyaltyMembership(id: string): Promise<LoyaltyMembershipDto> {
    return ApiService.get<LoyaltyMembershipDto>(this.getPath(`loyalty-memberships/${id}`));
  }

  /**
   * Get loyalty memberships by customer ID
   */
  static async getLoyaltyMembershipsByCustomer(customerId: string): Promise<LoyaltyMembershipDto[]> {
    return ApiService.get<LoyaltyMembershipDto[]>(this.getPath(`loyalty-memberships/by-customer/${customerId}`));
  }

  /**
   * Create a new loyalty membership
   */
  static async createLoyaltyMembership(data: CreateLoyaltyMembershipCommand): Promise<LoyaltyMembershipDto> {
    return ApiService.post<LoyaltyMembershipDto>(this.getPath('loyalty-memberships'), data);
  }

  /**
   * Update a loyalty membership
   */
  static async updateLoyaltyMembership(id: string, data: UpdateLoyaltyMembershipCommand): Promise<LoyaltyMembershipDto> {
    return ApiService.put<LoyaltyMembershipDto>(this.getPath(`loyalty-memberships/${id}`), data);
  }

  /**
   * Delete a loyalty membership
   */
  static async deleteLoyaltyMembership(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`loyalty-memberships/${id}`));
  }

  // =====================================
  // PRODUCT INTERESTS
  // =====================================

  /**
   * Get all product interests with optional filters
   */
  static async getProductInterests(filters?: ProductInterestFilters): Promise<PaginatedResponse<ProductInterestDto>> {
    const params = new URLSearchParams();
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.leadId) params.append('leadId', filters.leadId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.level) params.append('level', filters.level);
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.pageSize) params.append('pageSize', String(filters.pageSize));
    const query = params.toString();
    return ApiService.get<PaginatedResponse<ProductInterestDto>>(this.getPath(`product-interests${query ? `?${query}` : ''}`));
  }

  /**
   * Get a single product interest by ID
   */
  static async getProductInterest(id: string): Promise<ProductInterestDto> {
    return ApiService.get<ProductInterestDto>(this.getPath(`product-interests/${id}`));
  }

  /**
   * Create a new product interest
   */
  static async createProductInterest(data: CreateProductInterestCommand): Promise<ProductInterestDto> {
    return ApiService.post<ProductInterestDto>(this.getPath('product-interests'), data);
  }

  /**
   * Update a product interest
   */
  static async updateProductInterest(id: string, data: UpdateProductInterestCommand): Promise<ProductInterestDto> {
    return ApiService.put<ProductInterestDto>(this.getPath(`product-interests/${id}`), data);
  }

  /**
   * Delete a product interest
   */
  static async deleteProductInterest(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`product-interests/${id}`));
  }

  // =====================================
  // SOCIAL MEDIA PROFILES
  // =====================================

  /**
   * Get all social media profiles with optional filters
   */
  static async getSocialMediaProfiles(filters?: SocialMediaProfileFilters): Promise<PaginatedResponse<SocialMediaProfileDto>> {
    const params = new URLSearchParams();
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.platform) params.append('platform', filters.platform);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.skip) params.append('skip', String(filters.skip));
    if (filters?.take) params.append('take', String(filters.take));
    const query = params.toString();
    return ApiService.get<PaginatedResponse<SocialMediaProfileDto>>(this.getPath(`social-profiles${query ? `?${query}` : ''}`));
  }

  /**
   * Get a single social media profile by ID
   */
  static async getSocialMediaProfile(id: string): Promise<SocialMediaProfileDto> {
    return ApiService.get<SocialMediaProfileDto>(this.getPath(`social-profiles/${id}`));
  }

  /**
   * Get social media profiles by customer ID
   */
  static async getSocialMediaProfilesByCustomer(customerId: string): Promise<SocialMediaProfileDto[]> {
    return ApiService.get<SocialMediaProfileDto[]>(this.getPath(`social-profiles/by-customer/${customerId}`));
  }

  /**
   * Create a new social media profile
   */
  static async createSocialMediaProfile(data: CreateSocialMediaProfileCommand): Promise<SocialMediaProfileDto> {
    return ApiService.post<SocialMediaProfileDto>(this.getPath('social-profiles'), data);
  }

  /**
   * Update a social media profile
   */
  static async updateSocialMediaProfile(id: string, data: UpdateSocialMediaProfileCommand): Promise<SocialMediaProfileDto> {
    return ApiService.put<SocialMediaProfileDto>(this.getPath(`social-profiles/${id}`), data);
  }

  /**
   * Delete a social media profile
   */
  static async deleteSocialMediaProfile(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`social-profiles/${id}`));
  }

  // =====================================
  // SURVEY RESPONSES
  // =====================================

  /**
   * Get all survey responses with optional filters
   */
  static async getSurveyResponses(filters?: SurveyResponseFilters): Promise<PaginatedResponse<SurveyResponseDto>> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    if (filters?.fromDate) params.append('fromDate', filters.fromDate);
    if (filters?.toDate) params.append('toDate', filters.toDate);
    if (filters?.skip) params.append('skip', String(filters.skip));
    if (filters?.take) params.append('take', String(filters.take));
    const query = params.toString();
    return ApiService.get<PaginatedResponse<SurveyResponseDto>>(this.getPath(`surveys${query ? `?${query}` : ''}`));
  }

  /**
   * Get a single survey response by ID
   */
  static async getSurveyResponse(id: string): Promise<SurveyResponseDto> {
    return ApiService.get<SurveyResponseDto>(this.getPath(`surveys/${id}`));
  }

  /**
   * Create a new survey response
   */
  static async createSurveyResponse(data: CreateSurveyResponseCommand): Promise<SurveyResponseDto> {
    return ApiService.post<SurveyResponseDto>(this.getPath('surveys'), data);
  }

  /**
   * Update a survey response
   */
  static async updateSurveyResponse(id: string, data: UpdateSurveyResponseCommand): Promise<SurveyResponseDto> {
    return ApiService.put<SurveyResponseDto>(this.getPath(`surveys/${id}`), data);
  }

  /**
   * Delete a survey response
   */
  static async deleteSurveyResponse(id: string): Promise<void> {
    return ApiService.delete<void>(this.getPath(`surveys/${id}`));
  }
}

// =====================================
// CONTACT TYPES
// =====================================

export interface Contact {
  id: string;
  customerId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string | null;
  mobilePhone?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface CreateContactCommand {
  customerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
}

export interface UpdateContactCommand {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary?: boolean;
  notes?: string;
}

// =====================================
// NOTE TYPES
// =====================================

export interface Note {
  id: string;
  content: string;
  leadId: string | null;
  customerId: string | null;
  contactId: string | null;
  opportunityId: string | null;
  dealId: string | null;
  isPinned: boolean;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateNoteCommand {
  content: string;
  leadId?: string;
  customerId?: string;
  contactId?: string;
  opportunityId?: string;
  dealId?: string;
  isPinned?: boolean;
}

export interface UpdateNoteCommand {
  content: string;
  isPinned?: boolean;
}

export default CRMService;
