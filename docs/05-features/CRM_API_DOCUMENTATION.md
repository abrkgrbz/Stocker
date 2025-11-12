# 📋 CRM API Dokümantasyonu

Stocker CRM modülünün tüm API endpoint'lerinin kapsamlı referans dokümantasyonu.

## 📊 Genel Bilgiler

- **Base URL**: `/api/crm`
- **Authentication**: Bearer Token (JWT)
- **Authorization**: `[RequireModule("CRM")]` - CRM modülü aktif olmalı
- **Multi-Tenant**: Tüm endpoint'ler tenant-aware
- **API Group**: `crm` (Swagger grouping)
- **Pattern**: CQRS (Command Query Responsibility Segregation)

---

## 1️⃣ Customers (Müşteriler)

**Base Route**: `/api/crm/customers`

### Endpoints

#### `GET /api/crm/customers`
Tüm müşterileri listele.

**Query Parameters**:
```typescript
{
  pageNumber?: number;        // Sayfa numarası (default: 1)
  pageSize?: number;          // Sayfa boyutu (default: 10)
  searchTerm?: string;        // Arama terimi
  sortBy?: string;            // Sıralama alanı
  sortDescending?: boolean;   // Azalan sıralama (default: false)
  includeInactive?: boolean;  // Pasif müşteriler dahil (default: false)
}
```

**Response**: `PagedResult<CustomerDto>`

---

#### `GET /api/crm/customers/paged`
Sayfalı müşteri listesi (gelişmiş filtreleme).

**Query Parameters**: Yukarıdaki ile aynı + ek filtreler

**Response**: `PagedResult<CustomerDto>`

---

#### `GET /api/crm/customers/{id}`
Tek bir müşteriyi getir.

**Path Parameters**:
- `id` (Guid): Müşteri ID

**Response**: `CustomerDto`

**Status Codes**:
- `200 OK`: Başarılı
- `404 Not Found`: Müşteri bulunamadı

---

#### `POST /api/crm/customers`
Yeni müşteri oluştur.

**Request Body**: `CreateCustomerCommand`
```typescript
{
  type: 'Individual' | 'Corporate';
  firstName?: string;          // Bireysel için
  lastName?: string;           // Bireysel için
  companyName?: string;        // Kurumsal için
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  taxNumber?: string;          // Kurumsal için
  taxOffice?: string;          // Kurumsal için
  website?: string;
  industry?: string;
  employeeCount?: number;
  annualRevenue?: number;
}
```

**Response**: `CustomerDto`

**Status Codes**:
- `201 Created`: Müşteri oluşturuldu
- `400 Bad Request`: Validasyon hatası

---

#### `PUT /api/crm/customers/{id}`
Müşteri güncelle.

**Path Parameters**:
- `id` (Guid): Müşteri ID

**Request Body**: `UpdateCustomerCommand`

**Response**: `CustomerDto`

**Status Codes**:
- `200 OK`: Güncellendi
- `400 Bad Request`: Validasyon hatası
- `404 Not Found`: Müşteri bulunamadı

---

#### `DELETE /api/crm/customers/{id}`
Müşteri sil.

**Path Parameters**:
- `id` (Guid): Müşteri ID

**Response**: `204 No Content`

**Status Codes**:
- `204 No Content`: Silindi
- `404 Not Found`: Müşteri bulunamadı

---

## 2️⃣ Activities (Aktiviteler)

**Base Route**: `/api/crm/activities`

### Endpoints

#### `GET /api/crm/activities`
Tüm aktiviteleri listele (filtrelenebilir).

**Query Parameters**:
```typescript
{
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
```

**Response**: `IEnumerable<ActivityDto>`

---

#### `GET /api/crm/activities/{id}`
Tek bir aktiviteyi getir.

**Response**: `ActivityDto`

---

#### `POST /api/crm/activities`
Yeni aktivite oluştur.

**Request Body**: `CreateActivityCommand`
```typescript
{
  type: 'Call' | 'Email' | 'Meeting' | 'Task' | 'Note';
  title: string;
  description?: string;
  startDate: DateTime;
  endDate?: DateTime;
  dueDate?: DateTime;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  assignedToId?: Guid;
  leadId?: Guid;
  customerId?: Guid;
  opportunityId?: Guid;
  dealId?: Guid;
  location?: string;
  attendees?: string[];
}
```

**Response**: `ActivityDto` (201 Created)

---

#### `PUT /api/crm/activities/{id}`
Aktivite güncelle.

**Request Body**: `UpdateActivityCommand`

**Response**: `ActivityDto`

---

#### `DELETE /api/crm/activities/{id}`
Aktivite sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/activities/{id}/complete`
Aktiviteyi tamamla.

**Request Body**: `CompleteActivityCommand`
```typescript
{
  id: Guid;
  completionNotes?: string;
}
```

**Response**: `ActivityDto`

---

#### `POST /api/crm/activities/{id}/cancel`
Aktiviteyi iptal et.

**Request Body**: `CancelActivityCommand`
```typescript
{
  id: Guid;
  cancellationReason?: string;
}
```

**Response**: `ActivityDto`

---

#### `POST /api/crm/activities/{id}/reschedule`
Aktiviteyi yeniden planla.

**Request Body**: `RescheduleActivityCommand`
```typescript
{
  id: Guid;
  newStartDate: DateTime;
  newEndDate?: DateTime;
  reason?: string;
}
```

**Response**: `ActivityDto`

---

#### `GET /api/crm/activities/upcoming`
Yaklaşan aktiviteler.

**Query Parameters**:
```typescript
{
  days?: number;  // Kaç gün sonrasına kadar (default: 7)
}
```

**Response**: `IEnumerable<ActivityDto>`

---

#### `GET /api/crm/activities/overdue`
Gecikmiş aktiviteler.

**Response**: `IEnumerable<ActivityDto>`

---

#### `GET /api/crm/activities/calendar`
Takvim görünümü için aktiviteler.

**Query Parameters**:
```typescript
{
  fromDate: DateTime;
  toDate: DateTime;
}
```

**Response**: `IEnumerable<ActivityDto>`

---

#### `GET /api/crm/activities/statistics`
Aktivite istatistikleri.

**Query Parameters**:
```typescript
{
  fromDate?: DateTime;
  toDate?: DateTime;
}
```

**Response**: `ActivityStatisticsDto`
```typescript
{
  total: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
}
```

---

## 3️⃣ Leads (Potansiyel Müşteriler)

**Base Route**: `/api/crm/leads`

### Endpoints

#### `GET /api/crm/leads`
Tüm lead'leri listele.

**Query Parameters**:
```typescript
{
  search?: string;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Disqualified' | 'Converted';
  rating?: 'Hot' | 'Warm' | 'Cold';
  source?: string;
  fromDate?: DateTime;
  toDate?: DateTime;
  page?: number;
  pageSize?: number;
}
```

**Response**: `IEnumerable<LeadDto>`

---

#### `GET /api/crm/leads/{id}`
Tek bir lead getir.

**Response**: `LeadDto`

---

#### `POST /api/crm/leads`
Yeni lead oluştur.

**Request Body**: `CreateLeadCommand`
```typescript
{
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Disqualified';
  rating: 'Hot' | 'Warm' | 'Cold';
  estimatedValue?: number;
  estimatedCloseDate?: DateTime;
  notes?: string;
  assignedToId?: Guid;
}
```

**Response**: `LeadDto` (201 Created)

---

#### `PUT /api/crm/leads/{id}`
Lead güncelle.

**Request Body**: `UpdateLeadCommand`

**Response**: `LeadDto`

---

#### `DELETE /api/crm/leads/{id}`
Lead sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/leads/{id}/convert`
Lead'i müşteriye dönüştür.

**Request Body**: `ConvertLeadToCustomerCommand`
```typescript
{
  leadId: Guid;
  createOpportunity?: boolean;
  opportunityName?: string;
  opportunityAmount?: number;
  pipelineId?: Guid;
  stageId?: Guid;
}
```

**Response**: `CustomerDto`

---

#### `POST /api/crm/leads/{id}/qualify`
Lead'i nitelikli olarak işaretle.

**Request Body**: `QualifyLeadCommand`
```typescript
{
  id: Guid;
  qualificationNotes?: string;
}
```

**Response**: `LeadDto`

---

#### `POST /api/crm/leads/{id}/disqualify`
Lead'i niteliksiz olarak işaretle.

**Request Body**: `DisqualifyLeadCommand`
```typescript
{
  id: Guid;
  disqualificationReason: string;
}
```

**Response**: `LeadDto`

---

#### `POST /api/crm/leads/{id}/assign`
Lead'i bir kullanıcıya ata.

**Request Body**: `AssignLeadCommand`
```typescript
{
  id: Guid;
  assignedToId: Guid;
}
```

**Response**: `LeadDto`

---

#### `GET /api/crm/leads/{id}/activities`
Lead'e ait aktiviteler.

**Response**: `IEnumerable<ActivityDto>`

---

#### `POST /api/crm/leads/{id}/score`
Lead skorunu güncelle.

**Request Body**: `UpdateLeadScoreCommand`
```typescript
{
  id: Guid;
  score: number;  // 0-100 arası
  scoringCriteria?: {
    engagement: number;
    fit: number;
    budget: number;
    authority: number;
    need: number;
    timing: number;
  };
}
```

**Response**: `LeadDto`

---

#### `GET /api/crm/leads/statistics`
Lead istatistikleri.

**Query Parameters**:
```typescript
{
  fromDate?: DateTime;
  toDate?: DateTime;
}
```

**Response**: `LeadStatisticsDto`
```typescript
{
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
```

---

## 4️⃣ Deals (Anlaşmalar)

**Base Route**: `/api/crm/deals`

### Endpoints

#### `GET /api/crm/deals`
Tüm deal'leri listele.

**Query Parameters**:
```typescript
{
  search?: string;
  status?: 'Open' | 'Won' | 'Lost';
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
```

**Response**: `IEnumerable<DealDto>`

---

#### `GET /api/crm/deals/{id}`
Tek bir deal getir.

**Response**: `DealDto`

---

#### `POST /api/crm/deals`
Yeni deal oluştur.

**Request Body**: `CreateDealCommand`
```typescript
{
  name: string;
  customerId: Guid;
  pipelineId: Guid;
  stageId: Guid;
  amount: number;
  expectedCloseDate?: DateTime;
  probability?: number;  // 0-100
  description?: string;
  assignedToId?: Guid;
  products?: {
    productId: Guid;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }[];
}
```

**Response**: `DealDto` (201 Created)

---

#### `PUT /api/crm/deals/{id}`
Deal güncelle.

**Request Body**: `UpdateDealCommand`

**Response**: `DealDto`

---

#### `DELETE /api/crm/deals/{id}`
Deal sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/deals/{id}/move-stage`
Deal'i başka bir aşamaya taşı.

**Request Body**: `MoveDealStageCommand`
```typescript
{
  dealId: Guid;
  newStageId: Guid;
  notes?: string;
}
```

**Response**: `DealDto`

---

#### `POST /api/crm/deals/{id}/close-won`
Deal'i kazanıldı olarak kapat.

**Request Body**: `CloseDealWonCommand`
```typescript
{
  id: Guid;
  closedDate: DateTime;
  actualAmount?: number;
  notes?: string;
}
```

**Response**: `DealDto`

---

#### `POST /api/crm/deals/{id}/close-lost`
Deal'i kaybedildi olarak kapat.

**Request Body**: `CloseDealLostCommand`
```typescript
{
  id: Guid;
  closedDate: DateTime;
  lostReason: string;
  competitorName?: string;
  notes?: string;
}
```

**Response**: `DealDto`

---

#### `GET /api/crm/deals/{id}/activities`
Deal'e ait aktiviteler.

**Response**: `IEnumerable<ActivityDto>`

---

#### `GET /api/crm/deals/{id}/products`
Deal'e ait ürünler.

**Response**: `IEnumerable<DealProductDto>`

---

#### `POST /api/crm/deals/{id}/products`
Deal'e ürün ekle.

**Request Body**: `AddDealProductCommand`
```typescript
{
  dealId: Guid;
  productId: Guid;
  quantity: number;
  unitPrice: number;
  discount?: number;
}
```

**Response**: `DealProductDto`

---

#### `DELETE /api/crm/deals/{id}/products/{productId}`
Deal'den ürün çıkar.

**Response**: `204 No Content`

---

#### `GET /api/crm/deals/statistics`
Deal istatistikleri.

**Query Parameters**:
```typescript
{
  fromDate?: DateTime;
  toDate?: DateTime;
}
```

**Response**: `DealStatisticsDto`
```typescript
{
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
```

---

#### `GET /api/crm/deals/conversion-rates`
Pipeline dönüşüm oranları.

**Query Parameters**:
```typescript
{
  pipelineId?: Guid;
  fromDate?: DateTime;
  toDate?: DateTime;
}
```

**Response**: `ConversionRatesDto`
```typescript
{
  overallRate: number;
  stageRates: {
    stageId: Guid;
    stageName: string;
    conversionRate: number;
    averageTime: number;
  }[];
}
```

---

## 5️⃣ Pipelines (Satış Hunileri)

**Base Route**: `/api/crm/pipelines`

### Endpoints

#### `GET /api/crm/pipelines`
Tüm pipeline'ları listele.

**Response**: `IEnumerable<PipelineDto>`

---

#### `GET /api/crm/pipelines/{id}`
Tek bir pipeline getir.

**Response**: `PipelineDto`

---

#### `POST /api/crm/pipelines`
Yeni pipeline oluştur.

**Request Body**: `CreatePipelineCommand`
```typescript
{
  name: string;
  description?: string;
  isActive: boolean;
  stages: {
    name: string;
    order: number;
    probability: number;  // 0-100
    color?: string;
    isWinStage: boolean;
    isLostStage: boolean;
  }[];
}
```

**Response**: `PipelineDto` (201 Created)

---

#### `PUT /api/crm/pipelines/{id}`
Pipeline güncelle.

**Request Body**: `UpdatePipelineCommand`

**Response**: `PipelineDto`

---

#### `DELETE /api/crm/pipelines/{id}`
Pipeline sil.

**Response**: `204 No Content`

---

#### `GET /api/crm/pipelines/{id}/stages`
Pipeline'a ait aşamalar.

**Response**: `IEnumerable<PipelineStageDto>`

---

#### `POST /api/crm/pipelines/{id}/stages`
Pipeline'a yeni aşama ekle.

**Request Body**: `AddPipelineStageCommand`
```typescript
{
  pipelineId: Guid;
  name: string;
  order: number;
  probability: number;
  color?: string;
  isWinStage: boolean;
  isLostStage: boolean;
}
```

**Response**: `PipelineStageDto`

---

#### `PUT /api/crm/pipelines/{id}/stages/{stageId}`
Aşama güncelle.

**Request Body**: `UpdatePipelineStageCommand`

**Response**: `PipelineStageDto`

---

#### `DELETE /api/crm/pipelines/{id}/stages/{stageId}`
Aşama sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/pipelines/{id}/stages/reorder`
Aşamaları yeniden sırala.

**Request Body**: `ReorderPipelineStagesCommand`
```typescript
{
  pipelineId: Guid;
  stageOrders: {
    stageId: Guid;
    newOrder: number;
  }[];
}
```

**Response**: `IEnumerable<PipelineStageDto>`

---

#### `GET /api/crm/pipelines/{id}/statistics`
Pipeline istatistikleri.

**Response**: `PipelineStatisticsDto`
```typescript
{
  totalDeals: number;
  totalValue: number;
  stageDistribution: {
    stageId: Guid;
    stageName: string;
    dealCount: number;
    totalValue: number;
    averageValue: number;
  }[];
  velocity: number;  // Ortalama hareket hızı (gün)
}
```

---

#### `POST /api/crm/pipelines/{id}/activate`
Pipeline'ı aktif et.

**Response**: `PipelineDto`

---

#### `POST /api/crm/pipelines/{id}/deactivate`
Pipeline'ı pasif et.

**Response**: `PipelineDto`

---

## 6️⃣ Campaigns (Kampanyalar)

**Base Route**: `/api/crm/campaigns`

### Endpoints

#### `GET /api/crm/campaigns`
Tüm kampanyaları listele.

**Query Parameters**:
```typescript
{
  search?: string;
  status?: 'Planning' | 'Active' | 'Paused' | 'Completed' | 'Cancelled';
  type?: 'Email' | 'SMS' | 'Social' | 'Event' | 'Webinar' | 'Advertisement';
  fromDate?: DateTime;
  toDate?: DateTime;
  page?: number;
  pageSize?: number;
}
```

**Response**: `IEnumerable<CampaignDto>`

---

#### `GET /api/crm/campaigns/{id}`
Tek bir kampanya getir.

**Response**: `CampaignDto`

---

#### `POST /api/crm/campaigns`
Yeni kampanya oluştur.

**Request Body**: `CreateCampaignCommand`
```typescript
{
  name: string;
  type: 'Email' | 'SMS' | 'Social' | 'Event' | 'Webinar' | 'Advertisement';
  description?: string;
  startDate: DateTime;
  endDate?: DateTime;
  budget?: number;
  targetAudience?: string;
  goals?: string;
  status: 'Planning' | 'Active' | 'Paused';
}
```

**Response**: `CampaignDto` (201 Created)

---

#### `PUT /api/crm/campaigns/{id}`
Kampanya güncelle.

**Request Body**: `UpdateCampaignCommand`

**Response**: `CampaignDto`

---

#### `DELETE /api/crm/campaigns/{id}`
Kampanya sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/campaigns/{id}/start`
Kampanyayı başlat.

**Response**: `CampaignDto`

---

#### `POST /api/crm/campaigns/{id}/pause`
Kampanyayı duraklat.

**Response**: `CampaignDto`

---

#### `POST /api/crm/campaigns/{id}/complete`
Kampanyayı tamamla.

**Response**: `CampaignDto`

---

#### `GET /api/crm/campaigns/{id}/members`
Kampanya üyeleri.

**Response**: `IEnumerable<CampaignMemberDto>`

---

#### `POST /api/crm/campaigns/{id}/members`
Kampanyaya üye ekle.

**Request Body**: `AddCampaignMemberCommand`
```typescript
{
  campaignId: Guid;
  leadId?: Guid;
  customerId?: Guid;
  status: 'Sent' | 'Opened' | 'Clicked' | 'Responded' | 'Bounced';
}
```

**Response**: `CampaignMemberDto`

---

#### `DELETE /api/crm/campaigns/{id}/members/{memberId}`
Kampanyadan üye çıkar.

**Response**: `204 No Content`

---

#### `POST /api/crm/campaigns/{id}/members/{memberId}/convert`
Kampanya üyesini dönüştür (lead → customer).

**Response**: `CampaignMemberDto`

---

#### `GET /api/crm/campaigns/{id}/roi`
Kampanya ROI (Yatırım Getirisi).

**Response**: `CampaignRoiDto`
```typescript
{
  totalCost: number;
  totalRevenue: number;
  roi: number;  // Percentage
  conversions: number;
  costPerLead: number;
  costPerConversion: number;
}
```

---

#### `GET /api/crm/campaigns/{id}/statistics`
Kampanya istatistikleri.

**Response**: `CampaignStatisticsDto`
```typescript
{
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
```

---

#### `POST /api/crm/campaigns/bulk-import`
Toplu üye import et.

**Request Body**: `BulkImportCampaignMembersCommand`
```typescript
{
  campaignId: Guid;
  members: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    customFields?: { [key: string]: any };
  }[];
}
```

**Response**: `BulkImportResultDto`
```typescript
{
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}
```

---

## 7️⃣ Customer Segments (Müşteri Segmentleri)

**Base Route**: `/api/crm/segments`

### Endpoints

#### `GET /api/crm/segments`
Tüm segmentleri listele.

**Query Parameters**:
```typescript
{
  isActive?: boolean;
}
```

**Response**: `List<CustomerSegmentDto>`

---

#### `GET /api/crm/segments/{id}`
Tek bir segment getir.

**Response**: `CustomerSegmentDto`

---

#### `GET /api/crm/segments/{id}/members`
Segment üyeleri.

**Response**: `List<CustomerSegmentMemberDto>`

---

#### `POST /api/crm/segments`
Yeni segment oluştur.

**Request Body**: `CreateCustomerSegmentCommand`
```typescript
{
  name: string;
  description?: string;
  type: 'Static' | 'Dynamic';
  criteria?: {
    field: string;
    operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
    value: any;
  }[];
  isActive: boolean;
}
```

**Response**: `CustomerSegmentDto` (201 Created)

---

#### `PUT /api/crm/segments/{id}`
Segment güncelle.

**Request Body**: `UpdateCustomerSegmentCommand`

**Response**: `CustomerSegmentDto`

---

#### `PUT /api/crm/segments/{id}/criteria`
Segment kriterlerini güncelle (sadece dynamic segmentler için).

**Request Body**: `UpdateSegmentCriteriaCommand`
```typescript
{
  id: Guid;
  criteria: {
    field: string;
    operator: string;
    value: any;
  }[];
}
```

**Response**: `CustomerSegmentDto`

---

#### `DELETE /api/crm/segments/{id}`
Segment sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/segments/{id}/members`
Segment'e üye ekle (sadece static segmentler için).

**Request Body**: `AddSegmentMemberCommand`
```typescript
{
  segmentId: Guid;
  customerId: Guid;
}
```

**Response**: `204 No Content`

---

#### `DELETE /api/crm/segments/{id}/members/{customerId}`
Segment'ten üye çıkar.

**Response**: `204 No Content`

---

#### `POST /api/crm/segments/{id}/activate`
Segment'i aktif et.

**Response**: `204 No Content`

---

#### `POST /api/crm/segments/{id}/deactivate`
Segment'i pasif et.

**Response**: `204 No Content`

---

#### `POST /api/crm/segments/{id}/recalculate`
Dynamic segment üyelerini yeniden hesapla.

**Response**: `CustomerSegmentDto`

---

## 8️⃣ Opportunities (Fırsatlar)

**Base Route**: `/api/crm/opportunities`

### Endpoints

#### `GET /api/crm/opportunities`
Tüm fırsatları listele.

**Query Parameters**:
```typescript
{
  search?: string;
  status?: 'Prospecting' | 'Qualification' | 'NeedsAnalysis' | 'Proposal' | 'Negotiation' | 'ClosedWon' | 'ClosedLost';
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
```

**Response**: `IEnumerable<OpportunityDto>`

---

#### `GET /api/crm/opportunities/{id}`
Tek bir fırsat getir.

**Response**: `OpportunityDto`

---

#### `POST /api/crm/opportunities`
Yeni fırsat oluştur.

**Request Body**: `CreateOpportunityCommand`
```typescript
{
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
```

**Response**: `OpportunityDto` (201 Created)

---

#### `PUT /api/crm/opportunities/{id}`
Fırsat güncelle.

**Request Body**: `UpdateOpportunityCommand`

**Response**: `OpportunityDto`

---

#### `DELETE /api/crm/opportunities/{id}`
Fırsat sil.

**Response**: `204 No Content`

---

#### `POST /api/crm/opportunities/{id}/move-stage`
Fırsatı başka aşamaya taşı.

**Request Body**: `MoveOpportunityStageCommand`
```typescript
{
  opportunityId: Guid;
  newStageId: Guid;
  notes?: string;
}
```

**Response**: `OpportunityDto`

---

#### `POST /api/crm/opportunities/{id}/win`
Fırsatı kazanıldı olarak işaretle.

**Request Body**: `WinOpportunityCommand`
```typescript
{
  id: Guid;
  actualAmount?: number;
  closedDate: DateTime;
  notes?: string;
}
```

**Response**: `OpportunityDto`

---

#### `POST /api/crm/opportunities/{id}/lose`
Fırsatı kaybedildi olarak işaretle.

**Request Body**: `LoseOpportunityCommand`
```typescript
{
  id: Guid;
  lostReason: string;
  competitorName?: string;
  closedDate: DateTime;
  notes?: string;
}
```

**Response**: `OpportunityDto`

---

#### `GET /api/crm/opportunities/{id}/activities`
Fırsata ait aktiviteler.

**Response**: `IEnumerable<ActivityDto>`

---

#### `GET /api/crm/opportunities/{id}/products`
Fırsata ait ürünler.

**Response**: `IEnumerable<OpportunityProductDto>`

---

#### `POST /api/crm/opportunities/{id}/products`
Fırsata ürün ekle.

**Request Body**: `AddOpportunityProductCommand`
```typescript
{
  opportunityId: Guid;
  productId: Guid;
  quantity: number;
  unitPrice: number;
  discount?: number;
}
```

**Response**: `OpportunityProductDto`

---

#### `DELETE /api/crm/opportunities/{id}/products/{productId}`
Fırsattan ürün çıkar.

**Response**: `204 No Content`

---

#### `GET /api/crm/opportunities/pipeline-report`
Pipeline raporu.

**Query Parameters**:
```typescript
{
  pipelineId?: Guid;
  fromDate?: DateTime;
  toDate?: DateTime;
}
```

**Response**: `PipelineReportDto`

---

#### `GET /api/crm/opportunities/forecast`
Satış tahmini.

**Query Parameters**:
```typescript
{
  fromDate: DateTime;
  toDate: DateTime;
}
```

**Response**: `ForecastDto`
```typescript
{
  period: string;
  totalValue: number;
  weightedValue: number;
  bestCase: number;
  worstCase: number;
  forecastedRevenue: number;
  confidence: number;
}
```

---

## 9️⃣ Documents (Dökümanlar)

**Base Route**: `/api/crm/documents`

### Endpoints

#### `POST /api/crm/documents/upload`
Yeni döküman yükle.

**Request**: `multipart/form-data`
```typescript
{
  File: IFormFile;
  EntityId: number;
  EntityType: string;  // "Customer", "Lead", "Deal", etc.
  Category: 'Contract' | 'Proposal' | 'Invoice' | 'Report' | 'Other';
  Description?: string;
  Tags?: string;
  AccessLevel: 'Private' | 'Team' | 'Public';
  ExpiresAt?: DateTime;
}
```

**Response**: `UploadDocumentResponse` (201 Created)
```typescript
{
  documentId: number;
  fileName: string;
  url: string;
}
```

---

#### `GET /api/crm/documents/{id}`
Döküman bilgisi getir.

**Response**: `DocumentDto`

---

#### `GET /api/crm/documents/entity/{entityId}/{entityType}`
Entity'e ait tüm dökümanlar.

**Path Parameters**:
- `entityId` (int)
- `entityType` (string)

**Response**: `List<DocumentDto>`

---

#### `GET /api/crm/documents/{id}/download`
Dökümanı indir.

**Response**: `File` (binary)

---

#### `GET /api/crm/documents/{id}/url`
Geçici download URL al.

**Query Parameters**:
```typescript
{
  expiresInMinutes?: number;  // Default: 60
}
```

**Response**: `DownloadUrlResponse`
```typescript
{
  url: string;
  expiresAt: DateTime;
}
```

---

#### `PUT /api/crm/documents/{id}`
Döküman metadata güncelle.

**Request Body**: `UpdateDocumentRequest`
```typescript
{
  description?: string;
  tags?: string;
  category?: 'Contract' | 'Proposal' | 'Invoice' | 'Report' | 'Other';
  accessLevel?: 'Private' | 'Team' | 'Public';
}
```

**Response**: `204 No Content`

---

#### `DELETE /api/crm/documents/{id}`
Dökümanı sil.

**Response**: `204 No Content`

---

## 🔟 Customer Tags (Müşteri Etiketleri)

**Base Route**: `/api/crm/customertags`

### Endpoints

#### `GET /api/crm/customertags/customer/{customerId}`
Müşteriye ait tüm etiketler.

**Path Parameters**:
- `customerId` (Guid)

**Response**: `List<CustomerTagDto>`

---

#### `GET /api/crm/customertags/distinct`
Tüm benzersiz etiketler (tenant bazında).

**Response**: `List<string>`

---

#### `POST /api/crm/customertags`
Müşteriye etiket ekle.

**Request Body**: `AddCustomerTagCommand`
```typescript
{
  customerId: Guid;
  tagName: string;
  color?: string;
}
```

**Response**: `CustomerTagDto` (201 Created)

**Status Codes**:
- `201 Created`: Etiket eklendi
- `409 Conflict`: Etiket zaten mevcut

---

#### `DELETE /api/crm/customertags/{id}`
Etiketi kaldır.

**Path Parameters**:
- `id` (Guid): Tag ID

**Response**: `204 No Content`

---

## 1️⃣1️⃣ Workflows (İş Akışları)

**Base Route**: `/api/crm/workflows`

### Endpoints

#### `POST /api/crm/workflows`
Yeni workflow oluştur.

**Request Body**: `CreateWorkflowCommand`
```typescript
{
  name: string;
  description?: string;
  trigger: {
    type: 'Manual' | 'Scheduled' | 'EntityCreated' | 'EntityUpdated' | 'FieldChanged';
    entityType?: string;
    field?: string;
    value?: any;
  };
  actions: {
    type: 'SendEmail' | 'CreateTask' | 'UpdateField' | 'SendNotification' | 'CallWebhook';
    parameters: { [key: string]: any };
  }[];
  isActive: boolean;
}
```

**Response**: `int` (Workflow ID) (201 Created)

---

#### `GET /api/crm/workflows/{id}`
Workflow getir.

**Path Parameters**:
- `id` (int)

**Response**: `WorkflowResponse`

---

#### `POST /api/crm/workflows/{id}/activate`
Workflow'u aktif et.

**Response**: `{ message: string }`

---

#### `POST /api/crm/workflows/{id}/deactivate`
Workflow'u pasif et (TODO: Henüz implement edilmemiş).

**Response**: `{ message: string }`

---

#### `POST /api/crm/workflows/execute`
Workflow'u manuel olarak çalıştır.

**Request Body**: `ExecuteWorkflowCommand`
```typescript
{
  workflowId: int;
  entityId?: Guid;
  parameters?: { [key: string]: any };
}
```

**Response**: `{ executionId: int, message: string }`

---

## 🔐 Authentication & Authorization

### Headers
```http
Authorization: Bearer {jwt_token}
```

### Tenant Context
Tüm endpoint'ler otomatik olarak tenant context'i alır:
```csharp
var tenantId = HttpContext.Items["TenantId"] as Guid?;
```

### Required Permissions
Tüm endpoint'ler şu attribute'lara sahip:
- `[Authorize]` - JWT authentication gerekli
- `[RequireModule("CRM")]` - CRM modülü aktif olmalı

---

## 📊 Common Response Patterns

### Success Responses

#### Single Entity
```typescript
{
  id: Guid;
  // ... entity properties
  createdAt: DateTime;
  updatedAt: DateTime;
  tenantId: Guid;
}
```

#### Paginated List
```typescript
{
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
```

#### Statistics
```typescript
{
  total: number;
  // ... specific metrics
  calculatedAt: DateTime;
}
```

---

### Error Responses

#### 400 Bad Request
```json
{
  "type": "Validation",
  "message": "Validation failed",
  "errors": {
    "Email": ["Email is required"],
    "Amount": ["Amount must be greater than 0"]
  }
}
```

#### 404 Not Found
```json
{
  "type": "NotFound",
  "message": "Customer not found",
  "code": "CUSTOMER_NOT_FOUND"
}
```

#### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

#### 409 Conflict
```json
{
  "type": "Conflict",
  "message": "Tag already exists for this customer",
  "code": "TAG_CONFLICT"
}
```

---

## 🎯 Best Practices

### 1. Pagination
Her zaman `pageNumber` ve `pageSize` kullanın:
```typescript
const params = {
  pageNumber: 1,
  pageSize: 20
};
```

### 2. Filtering
Null/undefined değerleri göndermeyin:
```typescript
const filters = {
  search: searchTerm || undefined,
  status: selectedStatus || undefined
};
```

### 3. Error Handling
```typescript
try {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    // Handle specific error types
    if (error.type === 'NotFound') {
      // Show not found message
    } else if (error.type === 'Validation') {
      // Show validation errors
    }
  }
} catch (error) {
  // Handle network errors
}
```

### 4. Date Formatting
Tarihler ISO 8601 formatında gönderilmeli:
```typescript
const date = new Date().toISOString(); // "2025-10-26T10:30:00.000Z"
```

### 5. Multi-tenant
TenantId otomatik olarak backend tarafından eklenir, göndermeye gerek yok.

---

## 📚 Entity Relationships

```
Customer (1) → (N) Activities
Customer (1) → (N) Deals
Customer (1) → (N) Opportunities
Customer (1) → (N) Documents
Customer (1) → (N) Customer Tags
Customer (N) ← (N) Customer Segments

Lead (1) → (N) Activities
Lead (1) → (1) Customer (conversion)

Deal (1) → (N) Activities
Deal (1) → (N) Deal Products
Deal (N) → (1) Pipeline
Deal (N) → (1) Pipeline Stage

Opportunity (1) → (N) Activities
Opportunity (1) → (N) Opportunity Products
Opportunity (N) → (1) Pipeline
Opportunity (N) → (1) Pipeline Stage

Pipeline (1) → (N) Pipeline Stages
Pipeline (1) → (N) Deals
Pipeline (1) → (N) Opportunities

Campaign (1) → (N) Campaign Members
Campaign (1) → (N) Activities
```

---

## 🔄 Workflow Example

### Lead to Customer Conversion Flow
```typescript
// 1. Get lead
GET /api/crm/leads/{leadId}

// 2. Qualify lead
POST /api/crm/leads/{leadId}/qualify
{
  id: leadId,
  qualificationNotes: "Budget confirmed, decision maker identified"
}

// 3. Convert to customer
POST /api/crm/leads/{leadId}/convert
{
  leadId: leadId,
  createOpportunity: true,
  opportunityName: "Q4 2025 Deal",
  opportunityAmount: 50000,
  pipelineId: "...",
  stageId: "..."
}

// 4. Response includes new customer
// → CustomerDto with new customerId

// 5. Create follow-up activity
POST /api/crm/activities
{
  type: "Meeting",
  title: "Kickoff Meeting",
  customerId: newCustomerId,
  startDate: "2025-11-01T10:00:00Z",
  priority: "High"
}
```

---

## 📈 Performance Tips

1. **Use pagination** for large datasets
2. **Filter early** - use query parameters to reduce payload
3. **Cache static data** (pipelines, stages, tags)
4. **Batch operations** when possible
5. **Use statistics endpoints** instead of calculating client-side
6. **Monitor ROI endpoints** - they're computationally expensive

---

## 🔍 Quick Reference

### Most Used Endpoints

```typescript
// Customers
GET    /api/crm/customers/paged
POST   /api/crm/customers
PUT    /api/crm/customers/{id}

// Activities
GET    /api/crm/activities/calendar
POST   /api/crm/activities
POST   /api/crm/activities/{id}/complete

// Leads
GET    /api/crm/leads
POST   /api/crm/leads
POST   /api/crm/leads/{id}/convert

// Deals
GET    /api/crm/deals
POST   /api/crm/deals/{id}/move-stage
POST   /api/crm/deals/{id}/close-won

// Statistics
GET    /api/crm/activities/statistics
GET    /api/crm/leads/statistics
GET    /api/crm/deals/statistics
GET    /api/crm/deals/conversion-rates
```

---

**Dokümantasyon Versiyonu**: 1.0
**Son Güncelleme**: 26 Ekim 2025
**Backend Framework**: .NET 9 + MediatR (CQRS)
**Authentication**: JWT Bearer Tokens
**Multi-Tenancy**: ✅ Enabled
