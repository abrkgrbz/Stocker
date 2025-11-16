// =====================================
// CRM Module - TypeScript Type Definitions
// Aligned with Backend .NET DTOs
// =====================================

export type Guid = string;
export type DateTime = string; // ISO 8601 format

// =====================================
// STATISTICS & ANALYTICS
// =====================================

export interface ActivityStatisticsDto {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number; // in hours
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
  customerId: Guid;
  customerName?: string;
  pipelineId: Guid;
  pipelineName?: string;
  stageId: Guid;
  stageName?: string;
  amount: number;
  probability: number; // 0-100
  expectedCloseDate?: DateTime;
  actualCloseDate?: DateTime;
  status: OpportunityStatus;
  description?: string;
  assignedToId?: Guid;
  assignedToName?: string;
  createdAt: DateTime;
  updatedAt?: DateTime;
}

export enum OpportunityStatus {
  Prospecting = 'Prospecting',
  Qualification = 'Qualification',
  NeedsAnalysis = 'NeedsAnalysis',
  Proposal = 'Proposal',
  Negotiation = 'Negotiation',
  ClosedWon = 'ClosedWon',
  ClosedLost = 'ClosedLost'
}

export interface OpportunityProductDto {
  id: Guid;
  opportunityId: Guid;
  productId: Guid;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
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
  customerId: Guid;
  pipelineId: Guid;
  stageId: Guid;
  amount: number;
  expectedCloseDate?: DateTime;
  probability?: number;
  description?: string;
  assignedToId?: Guid;
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

export interface CustomerTagDto {
  id: Guid;
  customerId: Guid;
  tagName: string;
  color?: string;
  createdAt: DateTime;
}

export interface AddCustomerTagCommand {
  customerId: Guid;
  tagName: string;
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

export interface CustomerSegmentMemberDto {
  id: Guid;
  segmentId: Guid;
  customerId: Guid;
  customerName?: string;
  customerEmail?: string;
  addedAt: DateTime;
  addedBy?: Guid;
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

export type WorkflowTriggerType =
  | 'Manual'
  | 'OnCreate'
  | 'OnUpdate'
  | 'OnDelete'
  | 'OnStatusChange'
  | 'Scheduled';

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

export interface CreateWorkflowCommand {
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
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
