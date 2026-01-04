// =====================================
// CRM Module - TypeScript Type Definitions
// Aligned with Backend .NET DTOs
// =====================================

export type Guid = string;
export type DateTime = string; // ISO 8601 format

// =====================================
// STATISTICS & ANALYTICS
// =====================================

/**
 * Backend: ActivityStatisticsDto (ActivityDto.cs:44-58)
 * Synchronized with C# DTO
 */
export interface ActivityStatisticsDto {
  totalActivities: number;
  todayActivities: number;
  overdueActivities: number;
  thisWeekActivities: number;
  completedTodayActivities: number;
  completedActivities: number;
  pendingActivities: number;
  completionRate: number;
  activitiesByType: { [type: string]: number };
  activitiesByStatus: { [status: string]: number };
  userActivities: UserActivityDto[];
  dailyActivities: DailyActivityDto[];
}

export interface UserActivityDto {
  userId: string;
  userName: string;
  totalActivities: number;
  completedActivities: number;
  overdueActivities: number;
  completionRate: number;
}

export interface DailyActivityDto {
  date: DateTime;
  createdCount: number;
  completedCount: number;
  overdueCount: number;
}

// =====================================
// CORE ENTITIES
// =====================================

/**
 * Backend: CustomerDto (CustomerDto.cs:8-34)
 * Synchronized with C# DTO
 */
export interface CustomerDto {
  id: Guid;
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  // GeoLocation IDs (FK to Master DB)
  countryId?: Guid;
  cityId?: Guid;
  districtId?: Guid;
  // Denormalized location names (for display/backward compatibility)
  city?: string;
  state?: string;
  district?: string;
  country?: string;
  postalCode?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  description?: string;
  customerType: CustomerType;
  status: CustomerStatus;
  creditLimit: number;
  taxId?: string;
  paymentTerms?: string;
  contactPerson?: string;
  isActive: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  contacts: ContactDto[];
}

export enum CustomerType {
  Individual = 'Individual',
  Corporate = 'Corporate'
}

export enum CustomerStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Prospect = 'Prospect',
  Suspended = 'Suspended'
}

export interface CreateCustomerDto {
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  address?: string;
  // GeoLocation IDs (FK to Master DB)
  countryId?: Guid;
  cityId?: Guid;
  districtId?: Guid;
  // Denormalized location names (for display/backward compatibility)
  city?: string;
  state?: string;
  district?: string;
  country?: string;
  postalCode?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  description?: string;
  customerType?: CustomerType;
  status?: CustomerStatus;
  creditLimit?: number;
  taxId?: string;
  paymentTerms?: string;
  contactPerson?: string;
}

export interface UpdateCustomerDto extends CreateCustomerDto {}

/**
 * Backend: ContactDto (ContactDto.cs:6-23)
 * Synchronized with C# DTO
 */
export interface ContactDto {
  id: Guid;
  customerId: Guid;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary: boolean;
  isActive: boolean;
  notes?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateContactDto {
  customerId: Guid;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
}

export interface UpdateContactDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary: boolean;
  notes?: string;
}

/**
 * Backend: LeadDto (LeadDto.cs:8-42)
 * Synchronized with C# DTO
 */
export interface LeadDto {
  id: Guid;
  companyName?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  industry?: string;
  source?: string;
  status: LeadStatus;
  rating: LeadRating;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  description?: string;
  assignedToUserId?: Guid;
  assignedToName?: string;
  convertedDate?: DateTime;
  convertedToCustomerId?: Guid;
  isConverted: boolean;
  score: number;
  createdAt: DateTime;
  updatedAt?: DateTime;
  activities?: ActivityDto[];
  notes?: NoteDto[];
}

export enum LeadStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Unqualified = 'Unqualified',
  Converted = 'Converted',
  Lost = 'Lost'
}

export enum LeadRating {
  Unrated = 'Unrated',
  Cold = 'Cold',
  Warm = 'Warm',
  Hot = 'Hot'
}

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  phone?: string;
  mobilePhone?: string;
  jobTitle?: string;
  industry?: string;
  source?: string;
  status?: LeadStatus;
  rating?: LeadRating;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  annualRevenue?: number;
  numberOfEmployees?: number;
  description?: string;
  assignedToUserId?: Guid;
}

export interface UpdateLeadDto extends CreateLeadDto {}

/**
 * Backend: ActivityDto (ActivityDto.cs:5-42)
 * Synchronized with C# DTO
 */
export interface ActivityDto {
  id: Guid;
  subject: string;
  description?: string;
  type: ActivityType;
  status: ActivityStatus;
  priority: ActivityPriority;
  scheduledAt?: DateTime;
  dueAt?: DateTime;
  completedAt?: DateTime;
  duration?: string; // TimeSpan as ISO 8601 duration
  location?: string;
  leadId?: Guid;
  leadName?: string;
  customerId?: Guid;
  customerName?: string;
  contactId?: Guid;
  contactName?: string;
  opportunityId?: Guid;
  opportunityName?: string;
  dealId?: Guid;
  dealTitle?: string;
  ownerId: number;
  ownerName?: string;
  assignedToUserId?: Guid;
  assignedToName?: string;
  outcome?: string;
  notes?: string;
  isOverdue: boolean;
  createdAt: DateTime;
  updatedAt?: DateTime;
  // Frontend compatibility aliases (computed in backend)
  title: string;
  startTime?: DateTime;
  endTime?: DateTime;
}

export enum ActivityType {
  Call = 'Call',
  Email = 'Email',
  Meeting = 'Meeting',
  Task = 'Task',
  Note = 'Note',
  Demo = 'Demo',
  'Follow-up' = 'Follow-up'
}

export enum ActivityStatus {
  Pending = 'Pending',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export enum ActivityPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

/**
 * Backend: NoteDto (NoteDto.cs:3-17)
 * Synchronized with C# DTO
 */
export interface NoteDto {
  id: Guid;
  content: string;
  leadId?: Guid;
  customerId?: Guid;
  contactId?: Guid;
  opportunityId?: Guid;
  dealId?: Guid;
  isPinned: boolean;
  createdById?: string;
  createdByName?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface LeadStatisticsDto {
  total: number;
  new: number;
  contacted: number;
  qualified: number;
  disqualified: number;
  converted: number;
  conversionRate: number;
  averageScore: number;
  bySource: { [source: string]: number };
  byRating: { [rating: string]: number };
}

export interface DealStatisticsDto {
  total: number;
  open: number;
  won: number;
  lost: number;
  totalValue: number;
  wonValue: number;
  lostValue: number;
  winRate: number;
  averageDealSize: number;
  averageSalesCycle: number; // in days
}

export interface ConversionRatesDto {
  overallRate: number;
  stageRates: {
    stageId: Guid;
    stageName: string;
    conversionRate: number;
    averageTime: number; // in days
  }[];
}

export interface PipelineStatisticsDto {
  totalDeals: number;
  totalValue: number;
  stageDistribution: {
    stageId: Guid;
    stageName: string;
    dealCount: number;
    totalValue: number;
    averageValue: number;
  }[];
  velocity: number; // Average days to move through pipeline
}

export interface CampaignRoiDto {
  totalCost: number;
  totalRevenue: number;
  roi: number; // Percentage
  conversions: number;
  costPerLead: number;
  costPerConversion: number;
}

export interface CampaignStatisticsDto {
  totalMembers: number;
  sent: number;
  opened: number;
  clicked: number;
  responded: number;
  bounced: number;
  conversions: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  bounceRate: number;
}

// =====================================
// OPPORTUNITIES
// =====================================

export interface OpportunityDto {
  id: Guid;
  name: string;
  description?: string;
  customerId: Guid;
  customerName: string;
  amount: number;
  currency: string; // Default: TRY
  probability: number; // 0-100
  expectedCloseDate: DateTime;
  status: OpportunityStatus;
  pipelineId?: Guid;
  pipelineName?: string;
  currentStageId?: Guid;
  currentStageName?: string;
  // Aliases for frontend compatibility
  stageId?: Guid;
  stageName?: string;
  // Additional fields
  lostReason?: string;
  competitorName?: string;
  source?: string;
  ownerId?: string;
  ownerName?: string;
  assignedToId?: Guid;
  assignedToName?: string;
  actualCloseDate?: DateTime;
  score: number;
  weightedAmount?: number; // Computed: amount * (probability / 100)
  // Related data
  products?: OpportunityProductDto[];
  recentActivities?: ActivityDto[];
  notes?: NoteDto[];
  createdAt: DateTime;
  updatedAt?: DateTime;
}

// Backend enum: Open=1, Won=2, Lost=3, OnHold=4
export enum OpportunityStatus {
  Open = 'Open',
  Won = 'Won',
  Lost = 'Lost',
  OnHold = 'OnHold'
}

export interface OpportunityProductDto {
  id: Guid;
  opportunityId: number;
  productId: number;
  productName: string;
  productCode?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  discountPercent: number;
  discountAmount: number;
  totalPrice: number;
  sortOrder: number;
}

export interface PipelineReportDto {
  pipelineId?: Guid;
  pipelineName?: string;
  totalOpportunities: number;
  totalValue: number;
  averageValue: number;
  winRate: number;
  averageSalesCycle: number;
  stageMetrics: {
    stageId: Guid;
    stageName: string;
    count: number;
    value: number;
    conversionRate: number;
    averageTimeInStage: number;
  }[];
}

export interface ForecastDto {
  period: string;
  totalValue: number;
  weightedValue: number;
  bestCase: number;
  worstCase: number;
  forecastedRevenue: number;
  confidence: number;
}

export interface CreateOpportunityCommand {
  name: string;
  description?: string;
  customerId: Guid;
  amount: number;
  currency?: string; // default: TRY
  probability?: number;
  expectedCloseDate: DateTime;
  status: OpportunityStatus | string;
  pipelineId?: Guid;
  currentStageId?: Guid; // backend field name
  competitorName?: string;
  source?: string;
  ownerId?: string;
  score?: number;
}

export interface UpdateOpportunityCommand {
  id: Guid;
  name?: string;
  amount?: number;
  expectedCloseDate?: DateTime;
  probability?: number;
  description?: string;
}

// =====================================
// DOCUMENTS
// =====================================

export interface DocumentDto {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  fileSize?: number; // Alias for size
  storagePath: string;
  entityId: number;
  entityType: string;
  category: DocumentCategory;
  description?: string;
  tags?: string;
  accessLevel: AccessLevel;
  expiresAt?: DateTime;
  uploadedBy: Guid;
  uploadedByName?: string;
  uploadedAt: DateTime;
}

export enum DocumentCategory {
  Contract = 'Contract',
  Proposal = 'Proposal',
  Invoice = 'Invoice',
  Report = 'Report',
  Other = 'Other'
}

export enum AccessLevel {
  Private = 'Private',
  Team = 'Team',
  Public = 'Public'
}

export interface UploadDocumentResponse {
  documentId: number;
  fileName: string;
  url: string;
}

export interface UpdateDocumentRequest {
  description?: string;
  tags?: string;
  category?: DocumentCategory;
  accessLevel?: AccessLevel;
}

export interface DownloadUrlResponse {
  url: string;
  expiresAt: DateTime;
}

// =====================================
// CUSTOMER TAGS
// =====================================

/**
 * Backend: CustomerTagDto (CustomerSegmentDto.cs:33-42)
 * Synchronized with C# DTO
 */
export interface CustomerTagDto {
  id: Guid;
  tenantId: Guid;
  customerId: Guid;
  tag: string; // C#: Tag (backend field name)
  color?: string;
  createdBy: Guid;
  createdAt: DateTime;
}

/**
 * Frontend sends tagName, controller maps to Tag
 * See: CustomerTagsController.cs AddCustomerTagDto
 */
export interface AddCustomerTagCommand {
  customerId: Guid;
  tagName: string; // Controller expects tagName, maps to command.Tag
  color?: string;
}

// =====================================
// CAMPAIGN MEMBERS
// =====================================

export interface CampaignMemberDto {
  id: Guid;
  campaignId: Guid;
  leadId?: Guid;
  customerId?: Guid;
  contactName?: string;
  contactEmail?: string;
  status: CampaignMemberStatus;
  sentDate?: DateTime;
  openedDate?: DateTime;
  clickedDate?: DateTime;
  respondedDate?: DateTime;
  createdAt: DateTime;
}

export enum CampaignMemberStatus {
  Sent = 'Sent',
  Opened = 'Opened',
  Clicked = 'Clicked',
  Responded = 'Responded',
  Bounced = 'Bounced'
}

export interface AddCampaignMemberCommand {
  campaignId: Guid;
  leadId?: Guid;
  customerId?: Guid;
  status: CampaignMemberStatus;
}

export interface BulkImportResultDto {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

export interface BulkImportCampaignMembersCommand {
  campaignId: Guid;
  members: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    customFields?: { [key: string]: any };
  }[];
}

// =====================================
// CUSTOMER SEGMENT MEMBERS
// =====================================

// Segment type - Backend SegmentType enum ile senkronize
export enum SegmentType {
  Static = 'Static',
  Dynamic = 'Dynamic',
}

// Reason why a customer was added to a segment
export type SegmentMembershipReason = 'Manual' | 'AutoCriteria' | 'Import';

export interface CustomerSegmentMemberDto {
  id: Guid;
  segmentId: Guid;
  customerId: Guid;
  customerName?: string;
  customerEmail?: string;
  addedAt: DateTime;
  reason: SegmentMembershipReason;
}

export interface AddSegmentMemberCommand {
  segmentId: Guid;
  customerId: Guid;
}

export interface UpdateSegmentCriteriaCommand {
  id: Guid;
  criteria: {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
    value: any;
  }[];
}

// =====================================
// LEAD SCORING
// =====================================

export interface ScoringCriteria {
  engagement?: number;
  fit?: number;
  budget?: number;
  authority?: number;
  need?: number;
  timing?: number;
}

export interface UpdateLeadScoreCommand {
  id: Guid;
  score: number; // 0-100
  scoringCriteria?: ScoringCriteria;
}

// =====================================
// DEAL PRODUCTS
// =====================================

export interface DealProductDto {
  id: Guid;
  dealId: Guid;
  productId: Guid;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface AddDealProductCommand {
  dealId: Guid;
  productId: Guid;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

// =====================================
// WORKFLOW
// =====================================

/**
 * Backend: WorkflowTriggerType (WorkflowTriggerType.cs)
 * Synchronized with C# enum
 */
export type WorkflowTriggerType =
  | 'Manual'
  | 'EntityCreated'
  | 'EntityUpdated'
  | 'StatusChanged'
  | 'DealStageChanged'
  | 'Scheduled'
  | 'FieldCondition'
  | 'AmountThreshold'
  | 'DueDateEvent';

export type WorkflowActionType =
  | 'SendEmail'
  | 'SendSMS'
  | 'CreateTask'
  | 'UpdateField'
  | 'SendNotification'
  | 'CallWebhook'
  | 'CreateActivity'
  | 'AssignToUser';

export interface WorkflowDto {
  id: number;
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  entityType: string;
  triggerConditions: string;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt: DateTime | null;
  steps: WorkflowStepDto[];
}

export interface WorkflowStepDto {
  id: number;
  name: string;
  description: string;
  actionType: WorkflowActionType;
  stepOrder: number;
  actionConfiguration: string;
  delayMinutes: number;
  isEnabled: boolean;
}

export interface WorkflowTrigger {
  type: 'Manual' | 'Scheduled' | 'EntityCreated' | 'EntityUpdated' | 'FieldChanged';
  entityType?: string;
  field?: string;
  value?: any;
}

export interface WorkflowAction {
  type: 'SendEmail' | 'CreateTask' | 'UpdateField' | 'SendNotification' | 'CallWebhook';
  parameters: { [key: string]: any };
}

// =====================================
// NOTIFICATIONS
// =====================================

export type NotificationType = 'System' | 'Deal' | 'Customer' | 'Task' | 'Workflow' | 'Meeting' | 'Alert' | 'Success';
export type NotificationChannel = 'InApp' | 'Email' | 'SMS' | 'Push';
export type NotificationStatus = 'Pending' | 'Sent' | 'Failed';

export interface NotificationDto {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  relatedEntityId?: number;
  relatedEntityType?: string;
  isRead: boolean;
  createdAt: DateTime;
  readAt?: DateTime;
}

export interface GetNotificationsResponse {
  notifications: NotificationDto[];
  totalCount: number;
  unreadCount: number;
}

export interface NotificationFilterParams {
  unreadOnly?: boolean;
  skip?: number;
  take?: number;
}

/**
 * Backend: CreateWorkflowCommand (CreateWorkflowCommand.cs)
 * Synchronized with C# record
 */
export interface CreateWorkflowCommand {
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  entityType: string;
  triggerConditions: string; // JSON string
  steps: CreateWorkflowStepDto[];
}

export interface CreateWorkflowStepDto {
  name: string;
  description: string;
  actionType: WorkflowActionType;
  stepOrder: number;
  actionConfiguration: string; // JSON string
  conditions: string; // JSON string
  delayMinutes?: number;
  continueOnError?: boolean;
}

export interface ExecuteWorkflowCommand {
  workflowId: number;
  entityId?: Guid;
  parameters?: { [key: string]: any };
}

export interface WorkflowExecutionResponse {
  executionId: number;
  message: string;
}

// =====================================
// PIPELINE STAGE REORDERING
// =====================================

export interface ReorderPipelineStagesCommand {
  pipelineId: Guid;
  stageOrders: {
    stageId: Guid;
    newOrder: number;
  }[];
}

// =====================================
// ACTIVITY ACTIONS
// =====================================

export interface CompleteActivityCommand {
  id: Guid;
  completionNotes?: string;
}

export interface CancelActivityCommand {
  id: Guid;
  cancellationReason?: string;
}

export interface RescheduleActivityCommand {
  id: Guid;
  newStartDate: DateTime;
  newEndDate?: DateTime;
  reason?: string;
}

// =====================================
// LEAD ACTIONS
// =====================================

export interface QualifyLeadCommand {
  id: Guid;
  qualificationNotes?: string;
}

export interface DisqualifyLeadCommand {
  id: Guid;
  disqualificationReason: string;
}

export interface AssignLeadCommand {
  id: Guid;
  assignedToId: Guid;
}

// =====================================
// DEAL ACTIONS
// =====================================

export interface MoveDealStageCommand {
  dealId: Guid;
  newStageId: Guid;
  notes?: string;
}

export interface CloseDealWonCommand {
  id: Guid;
  actualAmount?: number;
  closedDate: DateTime;
  notes?: string;
}

export interface CloseDealLostCommand {
  id: Guid;
  lostReason: string;
  competitorName?: string;
  closedDate: DateTime;
  notes?: string;
}

// =====================================
// OPPORTUNITY ACTIONS
// =====================================

export interface MoveOpportunityStageCommand {
  opportunityId: Guid;
  newStageId: Guid;
  notes?: string;
}

export interface WinOpportunityCommand {
  id: Guid;
  actualAmount?: number;
  closedDate: DateTime;
  notes?: string;
}

export interface LoseOpportunityCommand {
  id: Guid;
  lostReason: string;
  competitorName?: string;
  closedDate: DateTime;
  notes?: string;
}

// =====================================
// FILTERS
// =====================================

export interface OpportunityFilters {
  search?: string;
  status?: OpportunityStatus;
  customerId?: Guid;
  pipelineId?: Guid;
  stageId?: Guid;
  minAmount?: number;
  maxAmount?: number;
  fromDate?: DateTime;
  toDate?: DateTime;
  page?: number;
  pageSize?: number;
}

export interface ActivityFilters {
  type?: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
  status?: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  leadId?: Guid;
  customerId?: Guid;
  opportunityId?: Guid;
  dealId?: Guid;
  assignedToId?: Guid;
  fromDate?: DateTime;
  toDate?: DateTime;
  overdue?: boolean;
  page?: number;
  pageSize?: number;
}

// =====================================
// CALL LOGS
// =====================================

export enum CallDirection {
  Inbound = 'Inbound',
  Outbound = 'Outbound',
  Internal = 'Internal'
}

export enum CallType {
  Standard = 'Standard',
  Sales = 'Sales',
  Support = 'Support',
  FollowUp = 'FollowUp',
  Campaign = 'Campaign',
  Conference = 'Conference',
  Callback = 'Callback'
}

export enum CallStatus {
  Ringing = 'Ringing',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Transferred = 'Transferred',
  Completed = 'Completed',
  Missed = 'Missed',
  Abandoned = 'Abandoned',
  Busy = 'Busy',
  Failed = 'Failed'
}

export enum CallOutcome {
  Successful = 'Successful',
  LeftVoicemail = 'LeftVoicemail',
  NoAnswer = 'NoAnswer',
  Busy = 'Busy',
  WrongNumber = 'WrongNumber',
  CallbackRequested = 'CallbackRequested',
  NotInterested = 'NotInterested',
  InformationProvided = 'InformationProvided',
  AppointmentScheduled = 'AppointmentScheduled',
  SaleMade = 'SaleMade',
  ComplaintReceived = 'ComplaintReceived',
  IssueResolved = 'IssueResolved',
  Abandoned = 'Abandoned',
  Transferred = 'Transferred'
}

export interface CallLogDto {
  id: Guid;
  callNumber: string;
  direction: CallDirection;
  callType: CallType;
  status: CallStatus;

  // Time Information
  startTime: DateTime;
  endTime?: DateTime;
  durationSeconds: number;
  waitTimeSeconds?: number;
  ringTimeSeconds?: number;

  // Communication Details
  callerNumber: string;
  calledNumber: string;
  extension?: string;
  forwardedTo?: string;

  // Relationships
  customerId?: Guid;
  customerName?: string;
  contactId?: Guid;
  contactName?: string;
  leadId?: Guid;
  leadName?: string;
  opportunityId?: Guid;
  opportunityName?: string;
  ticketId?: Guid;
  campaignId?: Guid;
  campaignName?: string;

  // Agent Information
  agentUserId?: number;
  agentName?: string;
  queueName?: string;

  // Outcome Information
  outcome?: CallOutcome;
  outcomeDescription?: string;
  followUpRequired: boolean;
  followUpDate?: DateTime;
  followUpNote?: string;

  // Recording Information
  hasRecording: boolean;
  recordingUrl?: string;
  recordingFileSize?: number;
  transcript?: string;

  // Quality Information
  qualityScore?: number;
  customerSatisfaction?: number;
  qualityNotes?: string;

  // Notes
  notes?: string;
  summary?: string;
  tags?: string;

  // System Information
  externalCallId?: string;
  pbxType?: string;

  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateCallLogCommand {
  callNumber: string; // Required by backend
  direction: CallDirection;
  callerNumber: string;
  calledNumber: string;
  startTime?: DateTime;
  callType?: CallType;
  customerId?: Guid;
  contactId?: Guid;
  leadId?: Guid;
  opportunityId?: Guid;
  agentUserId?: number;
  agentName?: string;
  notes?: string;
}

export interface UpdateCallLogCommand {
  id: Guid;
  outcome?: CallOutcome;
  outcomeDescription?: string;
  notes?: string;
  summary?: string;
  tags?: string;
  followUpRequired?: boolean;
  followUpDate?: DateTime;
  followUpNote?: string;
}

// =====================================
// MEETINGS
// =====================================

export enum MeetingType {
  General = 'General',
  Sales = 'Sales',
  Demo = 'Demo',
  Presentation = 'Presentation',
  Negotiation = 'Negotiation',
  Contract = 'Contract',
  Kickoff = 'Kickoff',
  Review = 'Review',
  Planning = 'Planning',
  Training = 'Training',
  Workshop = 'Workshop',
  Webinar = 'Webinar',
  Conference = 'Conference',
  OneOnOne = 'OneOnOne',
  TeamMeeting = 'TeamMeeting',
  BusinessLunch = 'BusinessLunch',
  SiteVisit = 'SiteVisit'
}

export enum MeetingStatus {
  Scheduled = 'Scheduled',
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Rescheduled = 'Rescheduled',
  NoShow = 'NoShow'
}

export enum MeetingPriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Urgent = 'Urgent'
}

export enum MeetingLocationType {
  InPerson = 'InPerson',
  Online = 'Online',
  Hybrid = 'Hybrid',
  Phone = 'Phone'
}

export enum AttendeeType {
  Required = 'Required',
  Optional = 'Optional',
  Resource = 'Resource'
}

export enum AttendeeResponse {
  NotResponded = 'NotResponded',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Tentative = 'Tentative'
}

export interface MeetingAttendeeDto {
  id: Guid;
  meetingId: Guid;
  email: string;
  name?: string;
  type: AttendeeType;
  response: AttendeeResponse;
  responseDate?: DateTime;
  responseNote?: string;
  isOrganizer: boolean;
  attended: boolean;
  checkInTime?: DateTime;
  contactId?: Guid;
  userId?: number;
}

export interface MeetingDto {
  id: Guid;
  title: string;
  description?: string;
  meetingType: MeetingType;
  status: MeetingStatus;
  priority: MeetingPriority;

  // Time Information
  startTime: DateTime;
  endTime: DateTime;
  isAllDay: boolean;
  timezone?: string;
  actualStartTime?: DateTime;
  actualEndTime?: DateTime;

  // Location Information
  locationType: MeetingLocationType;
  location?: string;
  meetingRoom?: string;
  onlineMeetingLink?: string;
  onlineMeetingPlatform?: string;
  meetingPassword?: string;
  dialInNumber?: string;

  // Relationships
  customerId?: Guid;
  customerName?: string;
  contactId?: Guid;
  contactName?: string;
  leadId?: Guid;
  leadName?: string;
  opportunityId?: Guid;
  opportunityName?: string;
  dealId?: Guid;
  dealTitle?: string;
  campaignId?: Guid;
  campaignName?: string;

  // Organizer Information
  organizerId: number;
  organizerName?: string;
  organizerEmail?: string;

  // Content Information
  agenda?: string;
  notes?: string;
  outcome?: string;
  actionItems?: string;

  // Reminder Information
  hasReminder: boolean;
  reminderMinutesBefore?: number;
  reminderSent: boolean;

  // Recurrence Information
  isRecurring: boolean;
  recurrencePattern?: string;
  parentMeetingId?: Guid;
  recurrenceEndDate?: DateTime;

  // Recording Information
  hasRecording: boolean;
  recordingUrl?: string;

  // Attendees
  attendees?: MeetingAttendeeDto[];

  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateMeetingCommand {
  title: string;
  description?: string;
  meetingType?: MeetingType;
  startTime: DateTime;
  endTime: DateTime;
  isAllDay?: boolean;
  timezone?: string;
  locationType?: MeetingLocationType;
  location?: string;
  meetingRoom?: string;
  onlineMeetingLink?: string;
  onlineMeetingPlatform?: string;
  customerId?: Guid;
  contactId?: Guid;
  leadId?: Guid;
  opportunityId?: Guid;
  dealId?: Guid;
  agenda?: string;
  priority?: MeetingPriority;
  reminderMinutesBefore?: number;
  attendeeEmails?: string[];
}

export interface UpdateMeetingCommand {
  id: Guid;
  title?: string;
  description?: string;
  meetingType?: MeetingType;
  startTime?: DateTime;
  endTime?: DateTime;
  location?: string;
  onlineMeetingLink?: string;
  agenda?: string;
  priority?: MeetingPriority;
}

// =====================================
// TERRITORIES
// =====================================

export enum TerritoryType {
  Country = 'Country',
  Region = 'Region',
  City = 'City',
  District = 'District',
  PostalCode = 'PostalCode',
  Custom = 'Custom',
  Industry = 'Industry',
  CustomerSegment = 'CustomerSegment'
}

export enum TerritoryAssignmentType {
  Primary = 'Primary',
  Secondary = 'Secondary',
  Backup = 'Backup',
  Temporary = 'Temporary'
}

export interface TerritoryAssignmentDto {
  id: Guid;
  territoryId: Guid;
  userId: number;
  userName?: string;
  isPrimary: boolean;
  isActive: boolean;
  assignedDate: DateTime;
  endDate?: DateTime;
  assignmentType: TerritoryAssignmentType;
  responsibilityPercentage?: number;
}

export interface TerritoryDto {
  id: Guid;
  tenantId: Guid;
  name: string;
  code: string;
  description?: string;
  territoryType: TerritoryType;
  isActive: boolean;

  // Hierarchy
  parentTerritoryId?: Guid;
  parentTerritoryName?: string;
  hierarchyLevel: number;
  hierarchyPath?: string;

  // Geographic - GeoLocation IDs (FK to Master DB)
  countryId?: Guid;
  cityId?: Guid;
  districtId?: Guid;

  // Geographic - Denormalized display fields
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  district?: string;
  postalCodeRange?: string;
  geoCoordinates?: string;

  // Targets
  salesTarget?: number;
  targetYear?: number;
  currency: string;
  potentialValue?: number;

  // Assignment
  assignedSalesTeamId?: Guid;
  assignedSalesTeamName?: string;
  primarySalesRepId?: number;
  primarySalesRepName?: string;

  // Statistics
  customerCount: number;
  opportunityCount: number;
  totalSales: number;
  statsUpdatedAt?: DateTime;

  // Assignments
  assignments?: TerritoryAssignmentDto[];

  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateTerritoryCommand {
  name: string;
  code: string;
  description?: string;
  territoryType?: TerritoryType;
  parentTerritoryId?: Guid;

  // GeoLocation IDs (for cascade dropdown)
  countryId?: Guid;
  cityId?: Guid;
  districtId?: Guid;

  // Denormalized display fields (auto-filled from dropdown selection)
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  district?: string;
  postalCodeRange?: string;

  salesTarget?: number;
  targetYear?: number;
  currency?: string;
}

export interface UpdateTerritoryCommand {
  id: Guid;
  name?: string;
  code?: string;
  description?: string;
  territoryType?: TerritoryType;

  // GeoLocation IDs (for cascade dropdown)
  countryId?: Guid;
  cityId?: Guid;
  districtId?: Guid;

  // Denormalized display fields
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  district?: string;
  postalCodeRange?: string;

  salesTarget?: number;
  targetYear?: number;
  currency?: string;
  isActive?: boolean;
}

// =====================================
// SALES TEAMS
// =====================================

export enum SalesTeamRole {
  Member = 'Member',
  Senior = 'Senior',
  Leader = 'Leader',
  Manager = 'Manager',
  Director = 'Director'
}

export interface SalesTeamMemberDto {
  id: Guid;
  salesTeamId: Guid;
  salesTeamName?: string;
  userId: number;
  userName?: string;
  role: SalesTeamRole;
  isActive: boolean;
  joinedDate: DateTime;
  leftDate?: DateTime;
  individualTarget?: number;
  commissionRate?: number;
}

export interface SalesTeamDto {
  id: Guid;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;

  // Manager Information
  teamLeaderId?: number;
  teamLeaderName?: string;
  parentTeamId?: Guid;
  parentTeamName?: string;

  // Target Information
  salesTarget?: number;
  targetPeriod?: string;
  currency: string;

  // Territory Information
  territoryId?: Guid;
  territoryNames?: string;

  // Communication
  teamEmail?: string;
  communicationChannel?: string;

  // Statistics
  activeMemberCount: number;
  totalMemberCount: number;

  // Members
  members?: SalesTeamMemberDto[];

  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateSalesTeamCommand {
  name: string;
  code: string;
  description?: string;
  teamLeaderId?: number;
  teamLeaderName?: string;
  parentTeamId?: Guid;
  salesTarget?: number;
  targetPeriod?: string;
  currency?: string;
  territoryId?: Guid;
  teamEmail?: string;
  communicationChannel?: string;
}

export interface UpdateSalesTeamCommand {
  id: Guid;
  name?: string;
  code?: string;
  description?: string;
  teamLeaderId?: number;
  teamLeaderName?: string;
  salesTarget?: number;
  targetPeriod?: string;
  teamEmail?: string;
}

export interface AddSalesTeamMemberCommand {
  salesTeamId: Guid;
  userId: number;
  userName?: string;
  role?: SalesTeamRole;
  individualTarget?: number;
  commissionRate?: number;
}

// =====================================
// COMPETITORS
// =====================================

export enum ThreatLevel {
  VeryLow = 'VeryLow',
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  VeryHigh = 'VeryHigh'
}

export enum PriceComparison {
  MuchLower = 'MuchLower',
  Lower = 'Lower',
  Similar = 'Similar',
  Higher = 'Higher',
  MuchHigher = 'MuchHigher'
}

export enum StrengthCategory {
  Product = 'Product',
  Pricing = 'Pricing',
  Brand = 'Brand',
  Distribution = 'Distribution',
  Technology = 'Technology',
  CustomerService = 'CustomerService',
  HumanResources = 'HumanResources',
  Financial = 'Financial',
  Marketing = 'Marketing',
  Other = 'Other'
}

export enum WeaknessCategory {
  Product = 'Product',
  Pricing = 'Pricing',
  Brand = 'Brand',
  Distribution = 'Distribution',
  Technology = 'Technology',
  CustomerService = 'CustomerService',
  HumanResources = 'HumanResources',
  Financial = 'Financial',
  Marketing = 'Marketing',
  Other = 'Other'
}

export interface CompetitorProductDto {
  id: Guid;
  competitorId: Guid;
  productName: string;
  description?: string;
  priceRange?: string;
  features?: string;
  differentiators?: string;
  ourAdvantage?: string;
  ourDisadvantage?: string;
  isDirectCompetitor: boolean;
}

export interface CompetitorStrengthDto {
  id: Guid;
  competitorId: Guid;
  description: string;
  category: StrengthCategory;
  impactLevel: number;
  counterStrategy?: string;
}

export interface CompetitorWeaknessDto {
  id: Guid;
  competitorId: Guid;
  description: string;
  category: WeaknessCategory;
  opportunityLevel: number;
  exploitStrategy?: string;
}

export interface CompetitorDto {
  id: Guid;
  tenantId: Guid;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  threatLevel: ThreatLevel;

  // Company Information
  website?: string;
  headquarters?: string;
  foundedYear?: number;
  employeeCount?: string;
  annualRevenue?: string;
  marketShare?: number;

  // Market Information
  targetMarkets?: string;
  industries?: string;
  industry?: string; // Alias for industries (single)
  geographicCoverage?: string;
  customerSegments?: string;

  // Pricing Information
  pricingStrategy?: string;
  priceRange?: string;
  priceComparison?: PriceComparison;

  // Sales & Marketing
  salesChannels?: string;
  marketingStrategy?: string;
  keyMessage?: string;
  socialMediaLinks?: string;

  // Contact Information
  contactPerson?: string;
  email?: string;
  phone?: string;

  // Analysis Information
  swotSummary?: string;
  competitiveStrategy?: string;
  winStrategy?: string;
  lossReasons?: string;
  lastAnalysisDate?: DateTime;
  analyzedBy?: string;

  // Statistics
  encounterCount: number;
  winCount: number;
  lossCount: number;
  winRate: number;

  // Notes
  notes?: string;
  tags?: string;

  // Children
  products?: CompetitorProductDto[];
  strengths?: CompetitorStrengthDto[];
  weaknesses?: CompetitorWeaknessDto[];

  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateCompetitorCommand {
  name: string;
  code?: string;
  description?: string;
  threatLevel?: ThreatLevel;
  website?: string;
  headquarters?: string;
  foundedYear?: number;
  employeeCount?: string;
  annualRevenue?: string;
  marketShare?: number;
  targetMarkets?: string;
  industries?: string;
  pricingStrategy?: string;
  priceRange?: string;
  priceComparison?: PriceComparison;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

export interface UpdateCompetitorCommand {
  id: Guid;
  name?: string;
  code?: string;
  description?: string;
  threatLevel?: ThreatLevel;
  website?: string;
  headquarters?: string;
  marketShare?: number;
  pricingStrategy?: string;
  swotSummary?: string;
  competitiveStrategy?: string;
  winStrategy?: string;
}

// =====================================
// LOYALTY PROGRAMS
// =====================================

export enum LoyaltyProgramType {
  PointsBased = 'PointsBased',
  TierBased = 'TierBased',
  SpendBased = 'SpendBased',
  Subscription = 'Subscription',
  Hybrid = 'Hybrid'
}

export enum LoyaltyTransactionType {
  Earn = 'Earn',
  Redeem = 'Redeem',
  Adjustment = 'Adjustment',
  Expire = 'Expire',
  Transfer = 'Transfer',
  Bonus = 'Bonus'
}

export enum LoyaltyRewardType {
  Discount = 'Discount',
  FreeProduct = 'FreeProduct',
  FreeShipping = 'FreeShipping',
  GiftCard = 'GiftCard',
  Experience = 'Experience',
  Upgrade = 'Upgrade',
  Other = 'Other'
}

export interface LoyaltyTierDto {
  id: Guid;
  loyaltyProgramId: Guid;
  name: string;
  order: number;
  minimumPoints: number;
  discountPercentage: number;
  bonusPointsMultiplier?: number;
  benefits?: string;
  iconUrl?: string;
  color?: string;
  isActive: boolean;
}

export interface LoyaltyRewardDto {
  id: Guid;
  loyaltyProgramId: Guid;
  name: string;
  description: string;
  pointsCost: number;
  rewardType: LoyaltyRewardType;
  discountValue?: number;
  discountPercentage?: number;
  productId?: number;
  productName?: string;
  stockQuantity?: number;
  validFrom?: DateTime;
  validUntil?: DateTime;
  imageUrl?: string;
  terms?: string;
  isActive: boolean;
  redemptionCount: number;
}

export interface LoyaltyProgramDto {
  id: Guid;
  tenantId: Guid;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  programType: LoyaltyProgramType;

  // Dates
  startDate: DateTime;
  endDate?: DateTime;

  // Points Rules
  pointsPerSpend: number;
  spendUnit: number;
  currency: string;
  minimumSpendForPoints?: number;
  maxPointsPerTransaction?: number;

  // Redemption Rules
  pointValue: number;
  minimumRedemptionPoints: number;
  maxRedemptionPercentage?: number;

  // Expiry Rules
  pointsValidityMonths?: number;
  resetPointsYearly: boolean;

  // Bonus Rules
  birthdayBonusPoints?: number;
  signUpBonusPoints?: number;
  referralBonusPoints?: number;
  reviewBonusPoints?: number;

  // Terms
  termsAndConditions?: string;
  privacyPolicy?: string;

  // Children
  tiers?: LoyaltyTierDto[];
  rewards?: LoyaltyRewardDto[];

  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export interface LoyaltyMembershipDto {
  id: Guid;
  loyaltyProgramId: Guid;
  loyaltyProgramName?: string;
  customerId: Guid;
  customerName?: string;
  membershipNumber: string;
  currentTierId?: Guid;
  currentTierName?: string;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  currentPoints: number;
  lifetimePoints: number;
  enrollmentDate: DateTime;
  lastActivityDate?: DateTime;
  pointsExpiryDate?: DateTime;
  isActive: boolean;
}

export interface CreateLoyaltyProgramCommand {
  name: string;
  code: string;
  description?: string;
  programType?: LoyaltyProgramType;
  startDate?: DateTime;
  endDate?: DateTime;
  pointsPerSpend?: number;
  spendUnit?: number;
  currency?: string;
  pointValue?: number;
  minimumRedemptionPoints?: number;
  birthdayBonusPoints?: number;
  signUpBonusPoints?: number;
  referralBonusPoints?: number;
}

export interface UpdateLoyaltyProgramCommand {
  id: Guid;
  name?: string;
  code?: string;
  description?: string;
  programType?: LoyaltyProgramType;
  pointsPerSpend?: number;
  pointValue?: number;
  minimumRedemptionPoints?: number;
}

// =====================================
// REFERRALS
// =====================================

export enum ReferralStatus {
  New = 'New',
  Contacted = 'Contacted',
  Qualified = 'Qualified',
  Converted = 'Converted',
  Rejected = 'Rejected',
  Expired = 'Expired'
}

export enum ReferralType {
  Customer = 'Customer',
  Partner = 'Partner',
  Employee = 'Employee',
  Influencer = 'Influencer',
  Affiliate = 'Affiliate',
  Other = 'Other'
}

export enum ReferralRewardType {
  Cash = 'Cash',
  Discount = 'Discount',
  Points = 'Points',
  Credit = 'Credit',
  Gift = 'Gift',
  FreeProduct = 'FreeProduct',
  FreeService = 'FreeService'
}

export interface ReferralDto {
  id: Guid;
  referralCode: string;
  status: ReferralStatus;
  referralType: ReferralType;

  // Referrer
  referrerCustomerId?: Guid;
  referrerCustomerName?: string;
  referrerContactId?: Guid;
  referrerContactName?: string;
  referrerName: string;
  referrerEmail?: string;
  referrerPhone?: string;

  // Referred
  referredCustomerId?: Guid;
  referredCustomerName?: string;
  referredLeadId?: Guid;
  referredLeadName?: string;
  referredName: string;
  referredEmail?: string;
  referredPhone?: string;
  referredCompany?: string;

  // Dates
  referralDate: DateTime;
  contactedDate?: DateTime;
  conversionDate?: DateTime;
  expiryDate?: DateTime;

  // Reward Information
  referrerReward?: number;
  referredReward?: number;
  rewardType?: ReferralRewardType;
  currency: string;
  rewardPaid: boolean;
  rewardPaidDate?: DateTime;

  // Program Information
  campaignId?: Guid;
  campaignName?: string;
  programName?: string;

  // Result Information
  opportunityId?: Guid;
  opportunityName?: string;
  dealId?: Guid;
  dealTitle?: string;
  totalSalesAmount?: number;
  conversionValue?: number;

  // Notes
  referralMessage?: string;
  internalNotes?: string;
  rejectionReason?: string;

  // Tracking
  assignedToUserId?: number;
  assignedToUserName?: string;
  followUpCount: number;
  lastFollowUpDate?: DateTime;

  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateReferralCommand {
  referralCode?: string;
  referralType?: ReferralType;
  referrerCustomerId?: Guid;
  referrerContactId?: Guid;
  referrerName: string;
  referrerEmail?: string;
  referrerPhone?: string;
  referredName: string;
  referredEmail?: string;
  referredPhone?: string;
  referredCompany?: string;
  referralMessage?: string;
  campaignId?: Guid;
  programName?: string;
  expiryDate?: DateTime;
  referrerReward?: number;
  referredReward?: number;
  rewardType?: ReferralRewardType;
  currency?: string;
  internalNotes?: string;
  assignedToUserId?: number;
}

export interface UpdateReferralCommand {
  id: Guid;
  status?: ReferralStatus;
  referredName?: string;
  referredEmail?: string;
  referredPhone?: string;
  referredCompany?: string;
  internalNotes?: string;
  assignedToUserId?: number;
}

// =====================================
// FILTERS
// =====================================

export interface CallLogFilters {
  search?: string;
  direction?: CallDirection;
  callType?: CallType;
  status?: CallStatus;
  outcome?: CallOutcome;
  customerId?: Guid;
  leadId?: Guid;
  agentUserId?: number;
  fromDate?: DateTime;
  toDate?: DateTime;
  hasRecording?: boolean;
  page?: number;
  pageSize?: number;
}

export interface MeetingFilters {
  search?: string;
  meetingType?: MeetingType;
  status?: MeetingStatus;
  locationType?: MeetingLocationType;
  customerId?: Guid;
  leadId?: Guid;
  opportunityId?: Guid;
  organizerId?: number;
  fromDate?: DateTime;
  toDate?: DateTime;
  page?: number;
  pageSize?: number;
}

export interface TerritoryFilters {
  search?: string;
  territoryType?: TerritoryType;
  country?: string;
  region?: string;
  isActive?: boolean;
  assignedSalesTeamId?: Guid;
  page?: number;
  pageSize?: number;
}

export interface SalesTeamFilters {
  search?: string;
  isActive?: boolean;
  territoryId?: Guid;
  parentTeamId?: Guid;
  page?: number;
  pageSize?: number;
}

export interface CompetitorFilters {
  search?: string;
  threatLevel?: ThreatLevel;
  isActive?: boolean;
  industry?: string;
  page?: number;
  pageSize?: number;
}

export interface LoyaltyProgramFilters {
  search?: string;
  programType?: LoyaltyProgramType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface ReferralFilters {
  search?: string;
  status?: ReferralStatus;
  referralType?: ReferralType;
  referrerCustomerId?: Guid;
  campaignId?: Guid;
  fromDate?: DateTime;
  toDate?: DateTime;
  rewardPaid?: boolean;
  page?: number;
  pageSize?: number;
}

// =====================================
// REMINDERS
// =====================================

export interface ReminderDto {
  id: number;
  title: string;
  description?: string;
  reminderDate: DateTime;
  isCompleted: boolean;
  completedAt?: DateTime;
  userId: Guid;
  tenantId: Guid;
  entityType?: string;
  entityId?: Guid;
  assignedToUserId?: Guid;
  createdAt: DateTime;
  updatedAt?: DateTime;
}

export interface CreateReminderCommand {
  title: string;
  description?: string;
  reminderDate: DateTime;
  entityType?: string;
  entityId?: Guid;
  assignedToUserId?: Guid;
  userId?: Guid;
  tenantId?: Guid;
}

export interface UpdateReminderCommand {
  id?: number;
  title: string;
  description?: string;
  reminderDate: DateTime;
  entityType?: string;
  entityId?: Guid;
  assignedToUserId?: Guid;
}

export interface ReminderFilterParams {
  pendingOnly?: boolean;
  skip?: number;
  take?: number;
  assignedToUserId?: Guid;
}

export interface GetRemindersResponse {
  items: ReminderDto[];
  totalCount: number;
}

// =====================================
// EMAIL
// =====================================

export interface SendTestEmailCommand {
  to: string;
  subject?: string;
}
