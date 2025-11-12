# 🔗 CRM Frontend-Backend Integration Guide

Frontend TypeScript servisi ile Backend .NET API'lerinin entegrasyon durumu ve eksik endpoint'ler.

---

## 📊 Coverage Summary

| Module | Frontend Coverage | Backend Endpoints | Missing on Frontend |
|--------|------------------|-------------------|---------------------|
| Customers | ✅ Full | 6 endpoints | 0 |
| Activities | ⚠️ Partial | 12 endpoints | 8 |
| Leads | ⚠️ Partial | 13 endpoints | 9 |
| Deals | ⚠️ Partial | 17 endpoints | 12 |
| Pipelines | ✅ Full | 13 endpoints | 0 |
| Campaigns | ⚠️ Partial | 15 endpoints | 12 |
| Customer Segments | ⚠️ Partial | 10 endpoints | 5 |
| Opportunities | ❌ Missing | 15 endpoints | 15 |
| Documents | ❌ Missing | 7 endpoints | 7 |
| Customer Tags | ❌ Missing | 4 endpoints | 4 |
| Workflows | ❌ Missing | 4 endpoints | 4 |

**Overall Coverage**: 48 / 116 endpoints (41%)

---

## ✅ Fully Implemented Modules

### 1. Customers
**Coverage**: 6/6 (100%)

| Endpoint | Frontend Method | Status |
|----------|----------------|--------|
| GET /customers/paged | `getCustomers()` | ✅ |
| GET /customers/{id} | `getCustomer()` | ✅ |
| POST /customers | `createCustomer()` | ✅ |
| PUT /customers/{id} | `updateCustomer()` | ✅ |
| DELETE /customers/{id} | `deleteCustomer()` | ✅ |
| GET /customers | `getCustomers()` (internal) | ✅ |

**Notes**:
- ✅ Phone number formatting handled (+90 prefix)
- ✅ Command pattern matching (CustomerData wrapper)
- ✅ Pagination support
- ✅ Filtering support

---

### 2. Pipelines
**Coverage**: 13/13 (100%)

| Endpoint | Frontend Method | Status |
|----------|----------------|--------|
| GET /pipelines | `getPipelines()` | ✅ |
| GET /pipelines/{id} | `getPipeline()` | ✅ |
| POST /pipelines | `createPipeline()` | ✅ |
| PUT /pipelines/{id} | `updatePipeline()` | ✅ |
| DELETE /pipelines/{id} | `deletePipeline()` | ✅ |
| GET /pipelines/{id}/stages | `getPipelineStages()` | ✅ |
| POST /pipelines/{id}/stages | `addPipelineStage()` | ✅ |
| PUT /pipelines/{id}/stages/{stageId} | `updatePipelineStage()` | ✅ |
| DELETE /pipelines/{id}/stages/{stageId} | `removePipelineStage()` | ✅ |
| POST /pipelines/{id}/activate | `activatePipeline()` | ✅ |
| POST /pipelines/{id}/deactivate | `deactivatePipeline()` | ✅ |
| POST /pipelines/{id}/stages/reorder | ❌ Missing | - |
| GET /pipelines/{id}/statistics | ❌ Missing | - |

**Actually**: 11/13 (85%) - 2 eksik method var

---

## ⚠️ Partially Implemented Modules

### 3. Activities
**Coverage**: 4/12 (33%)

#### ✅ Implemented (4)
- GET /activities → `getActivities()`
- GET /activities/{id} → `getActivity()`
- POST /activities → `createActivity()`
- PUT /activities/{id} → `updateActivity()`
- DELETE /activities/{id} → `deleteActivity()`
- PATCH /activities/{id}/complete → `completeActivity()`

#### ❌ Missing (8)
```typescript
// Activity Actions
cancelActivity(id: Guid, reason?: string): Promise<ActivityDto>
rescheduleActivity(id: Guid, startDate: DateTime, endDate?: DateTime, reason?: string): Promise<ActivityDto>

// Query Endpoints
getUpcomingActivities(days?: number): Promise<ActivityDto[]>
getOverdueActivities(): Promise<ActivityDto[]>
getCalendarActivities(fromDate: DateTime, toDate: DateTime): Promise<ActivityDto[]>
getActivityStatistics(fromDate?: DateTime, toDate?: DateTime): Promise<ActivityStatisticsDto>

// Conversion
completeActivity(id: Guid, notes?: string): Promise<ActivityDto>  // Mevcut ama parameter eksik
```

---

### 4. Leads
**Coverage**: 4/13 (31%)

#### ✅ Implemented (4)
- GET /leads → `getLeads()`
- GET /leads/{id} → `getLead()`
- POST /leads → `createLead()`
- PUT /leads/{id} → `updateLead()`
- DELETE /leads/{id} → `deleteLead()`
- POST /leads/{id}/convert → `convertLeadToCustomer()`

#### ❌ Missing (9)
```typescript
// Lead Actions
qualifyLead(id: Guid, notes?: string): Promise<LeadDto>
disqualifyLead(id: Guid, reason: string): Promise<LeadDto>
assignLead(id: Guid, assignedToId: Guid): Promise<LeadDto>
updateLeadScore(id: Guid, score: number, criteria?: ScoringCriteria): Promise<LeadDto>

// Related Data
getLeadActivities(id: Guid): Promise<ActivityDto[]>

// Statistics
getLeadStatistics(fromDate?: DateTime, toDate?: DateTime): Promise<LeadStatisticsDto>
```

---

### 5. Deals
**Coverage**: 5/17 (29%)

#### ✅ Implemented (5)
- GET /deals → `getDeals()`
- GET /deals/{id} → `getDeal()`
- POST /deals → `createDeal()`
- PUT /deals/{id} → `updateDeal()`
- DELETE /deals/{id} → `deleteDeal()`

#### ❌ Missing (12)
```typescript
// Deal Actions
moveDealStage(id: Guid, newStageId: Guid, notes?: string): Promise<DealDto>
closeWon(id: Guid, actualAmount?: number, closedDate: DateTime, notes?: string): Promise<DealDto>
closeLost(id: Guid, lostReason: string, competitorName?: string, closedDate: DateTime, notes?: string): Promise<DealDto>

// Related Data
getDealActivities(id: Guid): Promise<ActivityDto[]>
getDealProducts(id: Guid): Promise<DealProductDto[]>
addDealProduct(dealId: Guid, productId: Guid, quantity: number, unitPrice: number, discount?: number): Promise<DealProductDto>
removeDealProduct(dealId: Guid, productId: Guid): Promise<void>

// Statistics
getDealStatistics(fromDate?: DateTime, toDate?: DateTime): Promise<DealStatisticsDto>
getConversionRates(pipelineId?: Guid, fromDate?: DateTime, toDate?: DateTime): Promise<ConversionRatesDto>
```

---

### 6. Campaigns
**Coverage**: 3/15 (20%)

#### ✅ Implemented (3)
- GET /campaigns → `getCampaigns()`
- GET /campaigns/{id} → `getCampaign()`
- POST /campaigns → `createCampaign()`
- PUT /campaigns/{id} → `updateCampaign()`
- DELETE /campaigns/{id} → `deleteCampaign()`
- POST /campaigns/{id}/start → `startCampaign()`
- POST /campaigns/{id}/complete → `completeCampaign()`
- POST /campaigns/{id}/abort → `abortCampaign()` (backend'de yok ama pause var)

#### ❌ Missing (12)
```typescript
// Campaign Actions
pauseCampaign(id: Guid): Promise<CampaignDto>

// Member Management
getCampaignMembers(id: Guid): Promise<CampaignMemberDto[]>
addCampaignMember(campaignId: Guid, leadId?: Guid, customerId?: Guid, status: string): Promise<CampaignMemberDto>
removeCampaignMember(campaignId: Guid, memberId: Guid): Promise<void>
convertCampaignMember(campaignId: Guid, memberId: Guid): Promise<CampaignMemberDto>

// Bulk Operations
bulkImportMembers(campaignId: Guid, members: any[]): Promise<BulkImportResultDto>

// Statistics
getCampaignRoi(id: Guid): Promise<CampaignRoiDto>
getCampaignStatistics(id: Guid): Promise<CampaignStatisticsDto>
```

---

### 7. Customer Segments
**Coverage**: 5/10 (50%)

#### ✅ Implemented (5)
- GET /segments → `getCustomerSegments()`
- GET /segments/{id} → `getCustomerSegment()`
- POST /segments → `createCustomerSegment()`
- PUT /segments/{id} → `updateCustomerSegment()`
- DELETE /segments/{id} → `deleteCustomerSegment()`
- POST /segments/{id}/activate → `activateCustomerSegment()`
- POST /segments/{id}/deactivate → `deactivateCustomerSegment()`

#### ❌ Missing (5)
```typescript
// Member Management
getSegmentMembers(id: Guid): Promise<CustomerSegmentMemberDto[]>
addSegmentMember(segmentId: Guid, customerId: Guid): Promise<void>
removeSegmentMember(segmentId: Guid, customerId: Guid): Promise<void>

// Dynamic Segments
updateSegmentCriteria(id: Guid, criteria: any): Promise<CustomerSegmentDto>
recalculateSegmentMembers(id: Guid): Promise<CustomerSegmentDto>
```

---

## ❌ Not Implemented Modules

### 8. Opportunities
**Coverage**: 0/15 (0%)

#### Missing All Endpoints (15)
```typescript
// CRUD
getOpportunities(filters?: OpportunityFilters): Promise<PaginatedResponse<OpportunityDto>>
getOpportunity(id: Guid): Promise<OpportunityDto>
createOpportunity(data: CreateOpportunityCommand): Promise<OpportunityDto>
updateOpportunity(id: Guid, data: UpdateOpportunityCommand): Promise<OpportunityDto>
deleteOpportunity(id: Guid): Promise<void>

// Actions
moveOpportunityStage(id: Guid, newStageId: Guid, notes?: string): Promise<OpportunityDto>
winOpportunity(id: Guid, actualAmount?: number, closedDate: DateTime, notes?: string): Promise<OpportunityDto>
loseOpportunity(id: Guid, lostReason: string, competitorName?: string, closedDate: DateTime, notes?: string): Promise<OpportunityDto>

// Related Data
getOpportunityActivities(id: Guid): Promise<ActivityDto[]>
getOpportunityProducts(id: Guid): Promise<OpportunityProductDto[]>
addOpportunityProduct(oppId: Guid, productId: Guid, quantity: number, unitPrice: number, discount?: number): Promise<OpportunityProductDto>
removeOpportunityProduct(oppId: Guid, productId: Guid): Promise<void>

// Reports
getPipelineReport(pipelineId?: Guid, fromDate?: DateTime, toDate?: DateTime): Promise<PipelineReportDto>
getSalesForecast(fromDate: DateTime, toDate: DateTime): Promise<ForecastDto>
```

---

### 9. Documents
**Coverage**: 0/7 (0%)

#### Missing All Endpoints (7)
```typescript
// Document Management
uploadDocument(file: File, entityId: number, entityType: string, category: DocumentCategory, description?: string, tags?: string, accessLevel?: AccessLevel, expiresAt?: DateTime): Promise<UploadDocumentResponse>
getDocument(id: number): Promise<DocumentDto>
getDocumentsByEntity(entityId: number, entityType: string): Promise<DocumentDto[]>
downloadDocument(id: number): Promise<Blob>
getDownloadUrl(id: number, expiresInMinutes?: number): Promise<DownloadUrlResponse>
updateDocument(id: number, metadata: UpdateDocumentRequest): Promise<void>
deleteDocument(id: number): Promise<void>
```

---

### 10. Customer Tags
**Coverage**: 0/4 (0%)

#### Missing All Endpoints (4)
```typescript
// Tag Management
getCustomerTags(customerId: Guid): Promise<CustomerTagDto[]>
getDistinctTags(): Promise<string[]>
addCustomerTag(customerId: Guid, tagName: string, color?: string): Promise<CustomerTagDto>
removeCustomerTag(id: Guid): Promise<void>
```

---

### 11. Workflows
**Coverage**: 0/4 (0%)

#### Missing All Endpoints (4)
```typescript
// Workflow Management
createWorkflow(data: CreateWorkflowCommand): Promise<number>
getWorkflow(id: number): Promise<WorkflowResponse>
activateWorkflow(id: number): Promise<{ message: string }>
executeWorkflow(workflowId: number, entityId?: Guid, parameters?: any): Promise<{ executionId: number, message: string }>
```

---

## 🎯 Implementation Priority

### High Priority (Core Features)
1. **Opportunities** - Critical for sales pipeline
2. **Deal Actions** - move-stage, close-won, close-lost
3. **Lead Actions** - qualify, disqualify, score
4. **Activity Actions** - cancel, reschedule, upcoming, overdue
5. **Documents** - Essential for file management

### Medium Priority (Enhanced Features)
6. **Campaign Members** - Member management and statistics
7. **Pipeline Statistics** - Analytics and reporting
8. **Segment Members** - Dynamic segment management
9. **Customer Tags** - Simple but useful feature

### Low Priority (Advanced Features)
10. **Workflows** - Automation (complex, can wait)
11. **Sales Forecast** - Advanced reporting

---

## 🔧 Implementation Guide

### Step 1: Add Missing Types
Create comprehensive TypeScript interfaces:

```typescript
// stocker-nextjs/src/lib/api/services/crm.types.ts

export interface OpportunityDto {
  id: Guid;
  name: string;
  customerId: Guid;
  pipelineId: Guid;
  stageId: Guid;
  amount: number;
  probability: number;
  expectedCloseDate?: DateTime;
  status: 'Prospecting' | 'Qualification' | 'NeedsAnalysis' | 'Proposal' | 'Negotiation' | 'ClosedWon' | 'ClosedLost';
  description?: string;
  assignedToId?: Guid;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export interface ActivityStatisticsDto {
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
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
  averageSalesCycle: number;
}

export interface ConversionRatesDto {
  overallRate: number;
  stageRates: {
    stageId: Guid;
    stageName: string;
    conversionRate: number;
    averageTime: number;
  }[];
}

export interface CampaignMemberDto {
  id: Guid;
  campaignId: Guid;
  leadId?: Guid;
  customerId?: Guid;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Responded' | 'Bounced';
  sentDate?: DateTime;
  openedDate?: DateTime;
  clickedDate?: DateTime;
  respondedDate?: DateTime;
  createdAt: DateTime;
}

export interface CampaignRoiDto {
  totalCost: number;
  totalRevenue: number;
  roi: number;
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

export interface DocumentDto {
  id: number;
  fileName: string;
  originalFileName: string;
  contentType: string;
  size: number;
  storagePath: string;
  entityId: number;
  entityType: string;
  category: 'Contract' | 'Proposal' | 'Invoice' | 'Report' | 'Other';
  description?: string;
  tags?: string;
  accessLevel: 'Private' | 'Team' | 'Public';
  expiresAt?: DateTime;
  uploadedBy: Guid;
  uploadedAt: DateTime;
}

export interface CustomerTagDto {
  id: Guid;
  customerId: Guid;
  tagName: string;
  color?: string;
  createdAt: DateTime;
}

export interface WorkflowResponse {
  id: number;
  name: string;
  description?: string;
  trigger: any;
  actions: any[];
  isActive: boolean;
  createdAt: DateTime;
}
```

---

### Step 2: Extend CRMService

Add missing methods to `crm.service.ts`:

```typescript
// =====================================
// ACTIVITIES - Extended
// =====================================

static async cancelActivity(id: Guid, reason?: string): Promise<Activity> {
  return ApiService.post<Activity>(
    this.getPath(`activities/${id}/cancel`),
    { id, cancellationReason: reason }
  );
}

static async rescheduleActivity(
  id: Guid,
  newStartDate: DateTime,
  newEndDate?: DateTime,
  reason?: string
): Promise<Activity> {
  return ApiService.post<Activity>(
    this.getPath(`activities/${id}/reschedule`),
    { id, newStartDate, newEndDate, reason }
  );
}

static async getUpcomingActivities(days: number = 7): Promise<Activity[]> {
  return ApiService.get<Activity[]>(
    this.getPath('activities/upcoming'),
    { params: { days } }
  );
}

static async getOverdueActivities(): Promise<Activity[]> {
  return ApiService.get<Activity[]>(this.getPath('activities/overdue'));
}

static async getCalendarActivities(
  fromDate: DateTime,
  toDate: DateTime
): Promise<Activity[]> {
  return ApiService.get<Activity[]>(
    this.getPath('activities/calendar'),
    { params: { fromDate, toDate } }
  );
}

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
// LEADS - Extended
// =====================================

static async qualifyLead(id: Guid, notes?: string): Promise<Lead> {
  return ApiService.post<Lead>(
    this.getPath(`leads/${id}/qualify`),
    { id, qualificationNotes: notes }
  );
}

static async disqualifyLead(id: Guid, reason: string): Promise<Lead> {
  return ApiService.post<Lead>(
    this.getPath(`leads/${id}/disqualify`),
    { id, disqualificationReason: reason }
  );
}

static async assignLead(id: Guid, assignedToId: Guid): Promise<Lead> {
  return ApiService.post<Lead>(
    this.getPath(`leads/${id}/assign`),
    { id, assignedToId }
  );
}

static async updateLeadScore(
  id: Guid,
  score: number,
  scoringCriteria?: any
): Promise<Lead> {
  return ApiService.post<Lead>(
    this.getPath(`leads/${id}/score`),
    { id, score, scoringCriteria }
  );
}

static async getLeadActivities(id: Guid): Promise<Activity[]> {
  return ApiService.get<Activity[]>(this.getPath(`leads/${id}/activities`));
}

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
// DEALS - Extended
// =====================================

static async moveDealStage(
  id: Guid,
  newStageId: Guid,
  notes?: string
): Promise<Deal> {
  return ApiService.post<Deal>(
    this.getPath(`deals/${id}/move-stage`),
    { dealId: id, newStageId, notes }
  );
}

static async closeDealWon(
  id: Guid,
  actualAmount?: number,
  closedDate?: DateTime,
  notes?: string
): Promise<Deal> {
  return ApiService.post<Deal>(
    this.getPath(`deals/${id}/close-won`),
    { id, actualAmount, closedDate: closedDate || new Date().toISOString(), notes }
  );
}

static async closeDealLost(
  id: Guid,
  lostReason: string,
  competitorName?: string,
  closedDate?: DateTime,
  notes?: string
): Promise<Deal> {
  return ApiService.post<Deal>(
    this.getPath(`deals/${id}/close-lost`),
    { id, lostReason, competitorName, closedDate: closedDate || new Date().toISOString(), notes }
  );
}

static async getDealActivities(id: Guid): Promise<Activity[]> {
  return ApiService.get<Activity[]>(this.getPath(`deals/${id}/activities`));
}

static async getDealProducts(id: Guid): Promise<any[]> {
  return ApiService.get<any[]>(this.getPath(`deals/${id}/products`));
}

static async getDealStatistics(
  fromDate?: DateTime,
  toDate?: DateTime
): Promise<DealStatisticsDto> {
  return ApiService.get<DealStatisticsDto>(
    this.getPath('deals/statistics'),
    { params: { fromDate, toDate } }
  );
}

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
// OPPORTUNITIES (NEW MODULE)
// =====================================

static async getOpportunities(filters?: any): Promise<PaginatedResponse<OpportunityDto>> {
  return ApiService.get<PaginatedResponse<OpportunityDto>>(
    this.getPath('opportunities'),
    { params: filters }
  );
}

static async getOpportunity(id: Guid): Promise<OpportunityDto> {
  return ApiService.get<OpportunityDto>(this.getPath(`opportunities/${id}`));
}

static async createOpportunity(data: any): Promise<OpportunityDto> {
  return ApiService.post<OpportunityDto>(this.getPath('opportunities'), data);
}

static async getSalesForecast(
  fromDate: DateTime,
  toDate: DateTime
): Promise<any> {
  return ApiService.get<any>(
    this.getPath('opportunities/forecast'),
    { params: { fromDate, toDate } }
  );
}

// =====================================
// DOCUMENTS (NEW MODULE)
// =====================================

static async uploadDocument(
  file: File,
  entityId: number,
  entityType: string,
  category: string,
  metadata?: any
): Promise<any> {
  const formData = new FormData();
  formData.append('File', file);
  formData.append('EntityId', entityId.toString());
  formData.append('EntityType', entityType);
  formData.append('Category', category);
  if (metadata?.description) formData.append('Description', metadata.description);
  if (metadata?.tags) formData.append('Tags', metadata.tags);

  return ApiService.post<any>(
    this.getPath('documents/upload'),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

static async getDocumentsByEntity(
  entityId: number,
  entityType: string
): Promise<DocumentDto[]> {
  return ApiService.get<DocumentDto[]>(
    this.getPath(`documents/entity/${entityId}/${entityType}`)
  );
}

static async downloadDocument(id: number): Promise<Blob> {
  return ApiService.get<Blob>(
    this.getPath(`documents/${id}/download`),
    { responseType: 'blob' }
  );
}

// =====================================
// CUSTOMER TAGS (NEW MODULE)
// =====================================

static async getCustomerTags(customerId: Guid): Promise<CustomerTagDto[]> {
  return ApiService.get<CustomerTagDto[]>(
    this.getPath(`customertags/customer/${customerId}`)
  );
}

static async getDistinctTags(): Promise<string[]> {
  return ApiService.get<string[]>(this.getPath('customertags/distinct'));
}

static async addCustomerTag(
  customerId: Guid,
  tagName: string,
  color?: string
): Promise<CustomerTagDto> {
  return ApiService.post<CustomerTagDto>(
    this.getPath('customertags'),
    { customerId, tagName, color }
  );
}

static async removeCustomerTag(id: Guid): Promise<void> {
  return ApiService.delete<void>(this.getPath(`customertags/${id}`));
}
```

---

## 🧪 Testing Checklist

### For Each New Endpoint:
- [ ] TypeScript interface matches backend DTO
- [ ] Request payload format correct
- [ ] Response handling with proper typing
- [ ] Error handling (400, 404, 409, etc.)
- [ ] Loading states in React Query hooks
- [ ] Success/error notifications in UI
- [ ] Pagination support (where applicable)
- [ ] Date formatting (ISO 8601)
- [ ] Guid vs number ID handling

---

## 📝 Notes

### ID Type Differences
- **Backend**: Uses `Guid` for most entities
- **Frontend**: Currently uses `number` for some entities
- **Action Needed**: Align all ID types to `string` (Guid) in frontend

### Command Pattern
- Backend uses **Command/Query pattern** (CQRS)
- Some endpoints expect wrapper objects:
  ```csharp
  { CustomerData: { ... } }  // Not just { ... }
  ```

### Phone Number Formatting
- Frontend auto-formats to E.164: `+905532078250`
- Backend expects this format

### Date Handling
- Always use ISO 8601: `2025-10-26T10:30:00.000Z`
- Use `new Date().toISOString()`

---

**Last Updated**: 26 Ekim 2025
**Frontend Version**: Next.js 15
**Backend Version**: .NET 9
